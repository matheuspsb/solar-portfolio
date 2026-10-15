import { describe, expect, it, vi } from 'vitest';
import { HONEYPOT_FIELD } from '@/domain/bot-guard';
import type { ContactSubmission } from '@/domain/contact-message';
import { deliverSafely, readHoneypot } from './submit-message';

const submission: ContactSubmission = {
  name: 'Ana Souza',
  email: 'ana@empresa.com',
  message: 'Gostei do seu portfólio, vamos conversar?',
  homepage: '',
  elapsedMs: 9000,
};

function formWith(value: string | null): HTMLFormElement {
  const form = document.createElement('form');
  if (value !== null) {
    const input = document.createElement('input');
    input.name = HONEYPOT_FIELD;
    input.value = value;
    form.append(input);
  }
  return form;
}

describe('deliverSafely', () => {
  it('passes the message to the submitter and returns its answer', async () => {
    const submit = vi.fn(async () => ({ ok: true as const }));
    await expect(deliverSafely(submit, submission)).resolves.toEqual({ ok: true });
    expect(submit).toHaveBeenCalledWith(submission);
  });

  it('turns a submitter that throws into a failed result instead of a rejection', async () => {
    const submit = vi.fn(async () => {
      throw new Error('rede caiu');
    });
    const result = await deliverSafely(submit, submission);
    expect(result.ok).toBe(false);
  });

  it('keeps the error the submitter reported', async () => {
    const submit = vi.fn(async () => ({ ok: false as const, error: 'limite atingido' }));
    await expect(deliverSafely(submit, submission)).resolves.toEqual({
      ok: false,
      error: 'limite atingido',
    });
  });
});

describe('readHoneypot', () => {
  it('reads what a bot typed into the hidden field', () => {
    expect(readHoneypot(formWith('http://spam.example'))).toBe('http://spam.example');
  });

  it('is empty when nobody touched the field, when it is missing or when there is no form', () => {
    expect(readHoneypot(formWith(''))).toBe('');
    expect(readHoneypot(formWith(null))).toBe('');
    expect(readHoneypot(null)).toBe('');
  });
});
