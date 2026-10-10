import { describe, expect, it, vi } from 'vitest';
import { createContactMessageHandler } from './contact';

const valid = {
  name: ' Ana Souza ',
  email: 'ana@empresa.com',
  message: 'Gostei do seu portfólio, vamos conversar?',
  homepage: '',
  elapsedMs: 9000,
};

describe('createContactMessageHandler', () => {
  it('delivers a valid message, trimmed, and reports success', async () => {
    const deliver = vi.fn(async () => undefined);
    const handle = createContactMessageHandler({ deliver });
    await expect(handle(valid)).resolves.toEqual({ ok: true });
    expect(deliver).toHaveBeenCalledOnce();
    expect(deliver).toHaveBeenCalledWith({
      name: 'Ana Souza',
      email: 'ana@empresa.com',
      message: 'Gostei do seu portfólio, vamos conversar?',
    });
  });

  it('rejects invalid input without calling the delivery', async () => {
    const deliver = vi.fn(async () => undefined);
    const handle = createContactMessageHandler({ deliver });
    const result = await handle({ ...valid, name: '', email: 'não-é-email' });
    expect(result.ok).toBe(false);
    expect(deliver).not.toHaveBeenCalled();
  });

  it.each([undefined, null, 'texto', 42])('rejects the non-form input %j', async (input) => {
    const deliver = vi.fn(async () => undefined);
    const result = await createContactMessageHandler({ deliver })(input);
    expect(result.ok).toBe(false);
    expect(deliver).not.toHaveBeenCalled();
  });

  it('answers with a generic message when the delivery fails, without leaking the cause', async () => {
    const handle = createContactMessageHandler({
      deliver: async () => {
        throw new Error('SMTP password rejected by smtp.internal.example');
      },
    });
    const result = await handle(valid);
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toContain('SMTP');
  });

  it('reports the real cause to the server logger, while the visitor only sees the generic message', async () => {
    const reportError = vi.fn();
    const cause = new Error('Invalid API key');
    const handle = createContactMessageHandler(
      {
        deliver: async () => {
          throw cause;
        },
      },
      { reportError },
    );
    const result = await handle(valid);
    expect(reportError).toHaveBeenCalledWith(cause);
    expect(JSON.stringify(result)).not.toContain('API key');
  });

  describe('bot protection', () => {
    it('pretends success but delivers nothing when the hidden field is filled', async () => {
      const deliver = vi.fn(async () => undefined);
      const reportBlocked = vi.fn();
      const handle = createContactMessageHandler({ deliver }, { reportBlocked });
      await expect(handle({ ...valid, homepage: 'http://spam.example' })).resolves.toEqual({
        ok: true,
      });
      expect(deliver).not.toHaveBeenCalled();
      expect(reportBlocked).toHaveBeenCalledWith('honeypot');
    });

    it('pretends success but delivers nothing when it came faster than a person can type', async () => {
      const deliver = vi.fn(async () => undefined);
      const reportBlocked = vi.fn();
      const handle = createContactMessageHandler({ deliver }, { reportBlocked });
      await expect(handle({ ...valid, elapsedMs: 100 })).resolves.toEqual({ ok: true });
      expect(deliver).not.toHaveBeenCalled();
      expect(reportBlocked).toHaveBeenCalledWith('too-fast');
    });

    it('pretends success but delivers nothing for a direct request that skipped the form', async () => {
      const deliver = vi.fn(async () => undefined);
      const handle = createContactMessageHandler({ deliver });
      const { name, email, message } = valid;
      await expect(handle({ name, email, message })).resolves.toEqual({ ok: true });
      expect(deliver).not.toHaveBeenCalled();
    });
  });
});
