import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ContactFormContent } from '@/lib/celestial-body';
import type { ContactMessageSubmitter, ContactSubmitResult } from '@/lib/contact-message';
import { ContactForm } from './ContactForm';

const content: ContactFormContent = {
  heading: 'Ou envie uma mensagem',
  nameLabel: 'Nome',
  emailLabel: 'E-mail',
  messageLabel: 'Mensagem',
  submitLabel: 'Enviar mensagem',
  submittingLabel: 'Enviando…',
  successMessage: 'Mensagem enviada.',
};

const validMessage = {
  name: 'Ana Souza',
  email: 'ana@empresa.com',
  message: 'Gostei do seu portfólio, vamos conversar?',
};

type User = ReturnType<typeof userEvent.setup>;

function setup(submit: ContactMessageSubmitter = async () => ({ ok: true })) {
  const user = userEvent.setup();
  render(<ContactForm content={content} onSubmit={submit} />);
  return { user };
}

async function fillValid(user: User) {
  await user.type(screen.getByRole('textbox', { name: 'Nome' }), validMessage.name);
  await user.type(screen.getByRole('textbox', { name: 'E-mail' }), validMessage.email);
  await user.type(screen.getByRole('textbox', { name: 'Mensagem' }), validMessage.message);
}

const send = () => screen.getByRole('button', { name: 'Enviar mensagem' });

describe('ContactForm', () => {
  it('submits the trimmed values once and confirms to the user', async () => {
    const submit = vi.fn<ContactMessageSubmitter>(async () => ({ ok: true }));
    const { user } = setup(submit);
    await user.type(screen.getByRole('textbox', { name: 'Nome' }), '  Ana Souza  ');
    await user.type(screen.getByRole('textbox', { name: 'E-mail' }), validMessage.email);
    await user.type(screen.getByRole('textbox', { name: 'Mensagem' }), validMessage.message);
    await user.click(send());

    expect(await screen.findByRole('status')).toHaveTextContent('Mensagem enviada.');
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith(validMessage);
  });

  it('clears the fields after a successful send', async () => {
    const { user } = setup();
    await fillValid(user);
    await user.click(send());
    await screen.findByRole('status');
    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Mensagem' })).toHaveValue('');
  });

  it('shows an error per invalid field, focuses the first one and does not submit', async () => {
    const submit = vi.fn<ContactMessageSubmitter>(async () => ({ ok: true }));
    const { user } = setup(submit);
    await user.click(send());

    expect(await screen.findByText('Informe seu nome.')).toBeInTheDocument();
    expect(screen.getByText('Informe seu e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Escreva uma mensagem.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveFocus();
    expect(submit).not.toHaveBeenCalled();
  });

  it('rejects a malformed e-mail with its own message', async () => {
    const { user } = setup();
    await user.type(screen.getByRole('textbox', { name: 'Nome' }), 'Ana');
    await user.type(screen.getByRole('textbox', { name: 'E-mail' }), 'ana@');
    await user.type(screen.getByRole('textbox', { name: 'Mensagem' }), validMessage.message);
    await user.click(send());
    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveFocus();
  });

  it('validates a field when the user leaves it, not while typing the first character', async () => {
    const { user } = setup();
    await user.type(screen.getByRole('textbox', { name: 'E-mail' }), 'a');
    expect(screen.queryByText('Informe um e-mail válido.')).not.toBeInTheDocument();
    await user.tab();
    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument();
  });

  it('blocks a second submission while the first is still in flight', async () => {
    let finish: (result: ContactSubmitResult) => void = () => undefined;
    const submit = vi.fn<ContactMessageSubmitter>(
      () =>
        new Promise<ContactSubmitResult>((resolve) => {
          finish = resolve;
        }),
    );
    const { user } = setup(submit);
    await fillValid(user);
    await user.click(send());
    const busyButton = await screen.findByRole('button', { name: 'Enviando…' });
    expect(busyButton).toBeDisabled();
    await user.click(busyButton);
    expect(submit).toHaveBeenCalledTimes(1);
    finish({ ok: true });
    expect(await screen.findByRole('status')).toBeInTheDocument();
  });

  it('shows the failure as an alert, keeps what was typed and allows retrying', async () => {
    const submit = vi
      .fn<ContactMessageSubmitter>()
      .mockResolvedValueOnce({ ok: false, error: 'Falhou, tente de novo.' })
      .mockResolvedValueOnce({ ok: true });
    const { user } = setup(submit);
    await fillValid(user);
    await user.click(send());

    expect(await screen.findByRole('alert')).toHaveTextContent('Falhou, tente de novo.');
    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveValue(validMessage.name);

    await user.click(send());
    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('treats a submitter that throws as a failure instead of crashing', async () => {
    const { user } = setup(async () => {
      throw new Error('network down');
    });
    await fillValid(user);
    await user.click(send());
    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível/i);
    await waitFor(() => expect(send()).toBeEnabled());
  });

  it('hides the previous confirmation as soon as the user starts a new message', async () => {
    const { user } = setup();
    await fillValid(user);
    await user.click(send());
    await screen.findByRole('status');
    await user.type(screen.getByRole('textbox', { name: 'Nome' }), 'B');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('asks the browser to autofill the personal fields', () => {
    setup();
    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveAttribute(
      'autocomplete',
      'email',
    );
  });
});
