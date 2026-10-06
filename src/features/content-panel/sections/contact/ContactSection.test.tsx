import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { contactContent } from '@/content/contact';
import type { ContactMessageSubmitter, ContactSubmitResult } from '@/lib/contact-message';
import { ContactSection } from './ContactSection';
import type { FrameScheduler } from './use-comet';

const INSTANT_STEP_MS = 1_000_000;

function createInstantScheduler(): FrameScheduler {
  let clock = 0;
  return {
    now: () => clock,
    request: (callback) =>
      window.setTimeout(() => {
        clock += INSTANT_STEP_MS;
        callback(clock);
      }, 0),
    cancel: (handle) => window.clearTimeout(handle),
  };
}

const message = {
  name: 'Ana Souza',
  email: 'ana@empresa.com',
  message: 'Gostei do seu portfólio, vamos conversar?',
};

function setup(submit: ContactMessageSubmitter = async () => ({ ok: true })) {
  const user = userEvent.setup();
  const clock = { time: new Date(2026, 9, 5).getTime() };
  render(
    <ContactSection
      content={contactContent}
      onSubmitMessage={submit}
      frameScheduler={createInstantScheduler()}
      getNow={() => new Date(clock.time)}
    />,
  );
  return { user, clock };
}

const nameField = () => screen.getByRole('textbox', { name: /Como posso te chamar/ });
const emailField = () => screen.getByRole('textbox', { name: /Para onde envio a resposta/ });
const messageField = () => screen.getByRole('textbox', { name: /Sobre o que você quer conversar/ });
const continueButton = () => screen.getByRole('button', { name: 'Continuar' });
const sendButton = () => screen.getByRole('button', { name: 'Enviar mensagem' });

async function answerName(user: ReturnType<typeof userEvent.setup>, value = message.name) {
  await user.type(nameField(), value);
  await user.click(continueButton());
}

async function answerEmail(user: ReturnType<typeof userEvent.setup>, value = message.email) {
  await user.type(await screen.findByRole('textbox', { name: /Para onde envio/ }), value);
  await user.click(continueButton());
}

async function reachMessageStep(user: ReturnType<typeof userEvent.setup>) {
  await answerName(user);
  await answerEmail(user);
  await screen.findByRole('textbox', { name: /Sobre o que você quer conversar/ });
}

async function writeAndSend(user: ReturnType<typeof userEvent.setup>) {
  await user.type(messageField(), message.message);
  await user.click(sendButton());
}

describe('ContactSection', () => {
  it('opens with the first question and its step counter', () => {
    setup();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Oi! Como posso te chamar?' }),
    ).toBeInTheDocument();
    expect(screen.getByText('01 / 03')).toBeInTheDocument();
    expect(nameField()).toHaveAttribute('placeholder', 'Seu nome');
  });

  it('explains what is missing instead of advancing with an empty answer', async () => {
    const { user } = setup();
    await user.click(continueButton());
    expect(screen.getByText('Digite seu nome para continuar.')).toBeInTheDocument();
    expect(nameField()).toBeInvalid();
    expect(screen.getByText('01 / 03')).toBeInTheDocument();
  });

  it('clears the explanation as soon as the visitor types', async () => {
    const { user } = setup();
    await user.click(continueButton());
    await user.type(nameField(), 'A');
    expect(screen.queryByText('Digite seu nome para continuar.')).not.toBeInTheDocument();
    expect(nameField()).toBeValid();
  });

  it('advances with Enter and greets the visitor by first name', async () => {
    const { user } = setup();
    await user.type(nameField(), 'Ana Souza{Enter}');
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Prazer, Ana. Para onde envio a resposta?',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('02 / 03')).toBeInTheDocument();
  });

  it('moves focus to the next answer so the visitor can keep typing', async () => {
    const { user } = setup();
    await answerName(user);
    await waitFor(() => expect(emailField()).toHaveFocus());
  });

  it('rejects an incomplete e-mail and accepts a complete one', async () => {
    const { user } = setup();
    await answerName(user);
    await user.type(emailField(), 'ana@empresa');
    await user.click(continueButton());
    expect(screen.getByText('Esse e-mail parece incompleto.')).toBeInTheDocument();
    expect(screen.getByText('02 / 03')).toBeInTheDocument();

    await user.type(emailField(), '.com');
    await user.click(continueButton());
    expect(await screen.findByText('03 / 03')).toBeInTheDocument();
  });

  it('keeps the answers when going back', async () => {
    const { user } = setup();
    await answerName(user);
    await user.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(await screen.findByText('01 / 03')).toBeInTheDocument();
    expect(nameField()).toHaveValue('Ana Souza');
  });

  it('goes back to an answered step through its planet', async () => {
    const { user } = setup();
    await answerName(user);
    await user.click(await screen.findByRole('button', { name: 'Voltar para NOME' }));
    expect(await screen.findByText('01 / 03')).toBeInTheDocument();
  });

  it('counts the characters of the message', async () => {
    const { user } = setup();
    await reachMessageStep(user);
    await user.type(messageField(), 'Olá');
    expect(screen.getByText('3/500')).toBeInTheDocument();
  });

  it('adds a line with Enter in the message and sends with Ctrl+Enter', async () => {
    const submit = vi.fn<ContactMessageSubmitter>(async () => ({ ok: true }));
    const { user } = setup(submit);
    await reachMessageStep(user);
    await user.type(messageField(), 'Linha um{Enter}Linha dois');
    expect(messageField()).toHaveValue('Linha um\nLinha dois');
    expect(submit).not.toHaveBeenCalled();

    await user.keyboard('{Control>}{Enter}{/Control}');
    await waitFor(() => expect(submit).toHaveBeenCalledOnce());
  });

  it('refuses to send an empty message', async () => {
    const submit = vi.fn<ContactMessageSubmitter>(async () => ({ ok: true }));
    const { user } = setup(submit);
    await reachMessageStep(user);
    await user.click(sendButton());
    expect(screen.getByText('Escreva uma mensagem antes de enviar.')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it('sends the answers once and shows the delivery confirmation', async () => {
    const submit = vi.fn<ContactMessageSubmitter>(async () => ({ ok: true }));
    const { user } = setup(submit);
    await answerName(user, '  Ana Souza  ');
    await answerEmail(user);
    await screen.findByRole('textbox', { name: /Sobre o que você quer conversar/ });
    await writeAndSend(user);

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Hermes levou sua mensagem, Ana.' }),
    ).toBeInTheDocument();
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith(expect.objectContaining(message));
    expect(screen.getByText('Vou responder em ana@empresa.com.')).toBeInTheDocument();
    expect(screen.getByText(/Gostei do seu portfólio/)).toBeInTheDocument();
  });

  it('stamps the delivery with the date it happened', async () => {
    const { user } = setup();
    await reachMessageStep(user);
    await writeAndSend(user);
    await screen.findByRole('heading', { level: 2, name: /Hermes levou/ });
    expect(screen.getByText('05·10·26')).toBeInTheDocument();
  });

  it('blocks a second send while the first is still on its way', async () => {
    let finish: (result: ContactSubmitResult) => void = () => undefined;
    const submit = vi.fn<ContactMessageSubmitter>(
      () =>
        new Promise<ContactSubmitResult>((resolve) => {
          finish = resolve;
        }),
    );
    const { user } = setup(submit);
    await reachMessageStep(user);
    await user.type(messageField(), message.message);
    await user.click(sendButton());
    const busyButton = await screen.findByRole('button', { name: 'Transmitindo…' });
    await user.click(busyButton);
    await user.click(busyButton);
    expect(submit).toHaveBeenCalledTimes(1);
    finish({ ok: true });
    expect(await screen.findByRole('heading', { level: 2, name: /Hermes levou/ })).toBeVisible();
  });

  it('does not allow going back while sending', async () => {
    const submit = vi.fn<ContactMessageSubmitter>(() => new Promise<ContactSubmitResult>(() => {}));
    const { user } = setup(submit);
    await reachMessageStep(user);
    await writeAndSend(user);
    await screen.findByRole('button', { name: 'Transmitindo…' });
    expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Voltar para/ })).not.toBeInTheDocument();
  });

  it('brings the visitor back to the message with the reason when delivery fails', async () => {
    const submit = vi
      .fn<ContactMessageSubmitter>()
      .mockResolvedValueOnce({ ok: false, error: 'Falhou, tente de novo.' })
      .mockResolvedValueOnce({ ok: true });
    const { user } = setup(submit);
    await reachMessageStep(user);
    await writeAndSend(user);

    expect(await screen.findByText('Falhou, tente de novo.')).toBeInTheDocument();
    expect(messageField()).toHaveValue(message.message);
    expect(screen.getByText('03 / 03')).toBeInTheDocument();

    await user.click(sendButton());
    expect(
      await screen.findByRole('heading', { level: 2, name: /Hermes levou/ }),
    ).toBeInTheDocument();
    expect(submit).toHaveBeenCalledTimes(2);
  });

  it('treats a submitter that throws as a failed delivery', async () => {
    const { user } = setup(async () => {
      throw new Error('network down');
    });
    await reachMessageStep(user);
    await writeAndSend(user);
    expect(await screen.findByText(/Não foi possível enviar/)).toBeInTheDocument();
    await waitFor(() => expect(sendButton()).toBeEnabled());
  });

  it('starts another message from the beginning with empty answers', async () => {
    const { user } = setup();
    await reachMessageStep(user);
    await writeAndSend(user);
    await user.click(await screen.findByRole('button', { name: 'Enviar outra mensagem' }));

    expect(await screen.findByText('01 / 03')).toBeInTheDocument();
    expect(nameField()).toHaveValue('');
    await user.type(nameField(), 'Bia');
    await user.click(continueButton());
    expect(await screen.findByRole('textbox', { name: /Para onde envio/ })).toHaveValue('');
  });

  it('keeps LinkedIn within reach as another way to talk', () => {
    setup();
    const link = screen.getByRole('link', { name: /LinkedIn/ });
    expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/matheuspaulosouza');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  describe('bot protection signals', () => {
    it('tells the server how long the visitor took, with the hidden field left empty', async () => {
      const submit = vi.fn<ContactMessageSubmitter>(async () => ({ ok: true }));
      const { user, clock } = setup(submit);
      await reachMessageStep(user);
      clock.time += 7000;
      await writeAndSend(user);
      await waitFor(() =>
        expect(submit).toHaveBeenCalledWith(
          expect.objectContaining({ homepage: '', elapsedMs: 7000 }),
        ),
      );
    });

    it('sends whatever a script wrote into the hidden field', async () => {
      const submit = vi.fn<ContactMessageSubmitter>(async () => ({ ok: true }));
      const { user } = setup(submit);
      await reachMessageStep(user);
      fireEvent.change(screen.getByLabelText('Não preencha este campo', { selector: 'input' }), {
        target: { value: 'http://spam.example' },
      });
      await writeAndSend(user);
      await waitFor(() =>
        expect(submit).toHaveBeenCalledWith(
          expect.objectContaining({ homepage: 'http://spam.example' }),
        ),
      );
    });

    it('keeps the hidden field away from people and assistive technology', () => {
      setup();
      expect(screen.queryByRole('textbox', { name: /Não preencha este campo/ })).toBeNull();
      expect(screen.getAllByRole('textbox')).toHaveLength(1);
    });
  });
});
