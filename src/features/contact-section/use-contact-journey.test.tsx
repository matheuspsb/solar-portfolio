import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { contactContent } from '@/content/contact';
import type { ContactMessageSubmitter } from '@/domain/contact-message';
import { ContactSubmitterProvider } from '@/hooks/contact-submitter';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { useContactJourney } from './use-contact-journey';

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

const submitEvent = { preventDefault: () => undefined } as React.FormEvent<HTMLFormElement>;

function setup(submit: ContactMessageSubmitter = async () => ({ ok: true })) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ContactSubmitterProvider submitter={submit}>{children}</ContactSubmitterProvider>
  );
  return renderHook(
    () =>
      useContactJourney({
        content: contactContent,
        frameScheduler: createInstantScheduler(),
        getNow: () => new Date(2026, 9, 5),
        draftStorage: null,
      }),
    { wrapper },
  );
}

function type(result: ReturnType<typeof setup>['result'], name: string, value: string) {
  act(() => {
    void result.current.form.registration.onChange({ target: { name, value }, type: 'change' });
  });
}

async function submit(result: ReturnType<typeof setup>['result']) {
  await act(async () => {
    result.current.form.onSubmit(submitEvent);
  });
}

async function reachLastStep(result: ReturnType<typeof setup>['result']) {
  type(result, 'name', 'Ana Souza');
  await submit(result);
  type(result, 'email', 'ana@empresa.com');
  await submit(result);
  type(result, 'message', 'Gostei do seu portfólio, vamos conversar?');
}

describe('useContactJourney', () => {
  it('starts on the first question with nothing delivered and no error', () => {
    const { result } = setup();
    expect(result.current.stage.currentStep).toBe(0);
    expect(result.current.delivered).toBeNull();
    expect(result.current.form.hasError).toBe(false);
    expect(result.current.form.canGoBack).toBe(false);
  });

  it('refuses an empty answer and stays on the step', async () => {
    const { result } = setup();
    await submit(result);
    expect(result.current.form.hasError).toBe(true);
    expect(result.current.stage.currentStep).toBe(0);
  });

  it('moves to the next question after a valid answer and lets the visitor go back', async () => {
    const { result } = setup();
    type(result, 'name', 'Ana Souza');
    expect(result.current.form.isValid).toBe(true);
    await submit(result);
    expect(result.current.stage.currentStep).toBe(1);
    expect(result.current.form.canGoBack).toBe(true);
    act(() => result.current.form.onBack());
    expect(result.current.stage.currentStep).toBe(0);
  });

  it('sends the message once, with the honeypot and the time spent, and delivers it', async () => {
    const submitter = vi.fn<ContactMessageSubmitter>(async () => ({ ok: true }));
    const { result } = setup(submitter);
    await reachLastStep(result);
    await submit(result);
    await waitFor(() => expect(result.current.delivered).not.toBeNull());
    expect(submitter).toHaveBeenCalledTimes(1);
    expect(submitter.mock.calls[0]![0]).toMatchObject({
      name: 'Ana Souza',
      email: 'ana@empresa.com',
      homepage: '',
    });
    expect(result.current.delivered?.message.name).toBe('Ana Souza');
  });

  it('ignores a second submit while the first one is still being sent', async () => {
    let finish: () => void = () => undefined;
    const submitter = vi.fn(
      () =>
        new Promise<{ ok: true }>((resolve) => {
          finish = () => resolve({ ok: true });
        }),
    );
    const { result } = setup(submitter);
    await reachLastStep(result);
    await submit(result);
    await submit(result);
    expect(submitter).toHaveBeenCalledTimes(1);
    expect(result.current.form.isSending).toBe(true);
    await act(async () => finish());
    await waitFor(() => expect(result.current.delivered).not.toBeNull());
  });

  it('stays on the last step with the error when the delivery fails, then lets the visitor retry', async () => {
    const submitter = vi
      .fn<ContactMessageSubmitter>()
      .mockResolvedValueOnce({ ok: false, error: 'limite atingido' })
      .mockResolvedValueOnce({ ok: true });
    const { result } = setup(submitter);
    await reachLastStep(result);
    await submit(result);
    await waitFor(() => expect(result.current.form.hasError).toBe(true));
    expect(result.current.delivered).toBeNull();
    expect(result.current.stage.currentStep).toBe(2);
    await submit(result);
    await waitFor(() => expect(result.current.delivered).not.toBeNull());
  });

  it('treats a submitter that throws as a delivery failure, not a crash', async () => {
    const submitter = vi.fn(async () => {
      throw new Error('rede caiu');
    });
    const { result } = setup(submitter);
    await reachLastStep(result);
    await submit(result);
    await waitFor(() => expect(result.current.form.hasError).toBe(true));
    expect(result.current.delivered).toBeNull();
  });

  it('starts over after sending another message', async () => {
    const { result } = setup();
    await reachLastStep(result);
    await submit(result);
    await waitFor(() => expect(result.current.delivered).not.toBeNull());
    act(() => result.current.onSendAnother());
    expect(result.current.delivered).toBeNull();
    expect(result.current.stage.currentStep).toBe(0);
    expect(result.current.form.hasValue).toBe(false);
  });

  it('only listens for Ctrl+Enter on the message step', async () => {
    const { result } = setup();
    expect(result.current.form.onKeyDown).toBeUndefined();
    type(result, 'name', 'Ana Souza');
    await submit(result);
    type(result, 'email', 'ana@empresa.com');
    await submit(result);
    expect(result.current.form.onKeyDown).toBeDefined();
  });
});
