// Use case: the form posts a message to the server. The handler must re-validate (the browser can
// be bypassed), hand only valid trimmed data to the delivery integration, and when delivery breaks
// answer with a generic message: never the internal error, which could leak infrastructure details.
import { describe, expect, it, vi } from 'vitest';
import { createContactMessageHandler, unconfiguredContactDelivery } from './contact';

const valid = {
  name: ' Ana Souza ',
  email: 'ana@empresa.com',
  message: 'Gostei do seu portfólio, vamos conversar?',
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
    const result = await handle({ name: '', email: 'não-é-email', message: 'oi' });
    expect(result).toEqual({ ok: false, error: expect.stringContaining('Confira') });
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
    expect(result).toEqual({
      ok: false,
      error: expect.stringContaining('Não foi possível enviar'),
    });
    expect(JSON.stringify(result)).not.toContain('SMTP');
  });

  it('does not deliver twice for one call', async () => {
    const deliver = vi.fn(async () => undefined);
    await createContactMessageHandler({ deliver })(valid);
    expect(deliver).toHaveBeenCalledTimes(1);
  });
});

describe('unconfiguredContactDelivery', () => {
  it('accepts messages without doing anything yet (placeholder until integrated)', async () => {
    await expect(
      unconfiguredContactDelivery.deliver({ name: 'a', email: 'a@b.co', message: '1234567890' }),
    ).resolves.toBeUndefined();
  });
});
