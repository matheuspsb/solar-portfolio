import { describe, expect, it, vi } from 'vitest';
import { createContactMessageHandler } from './contact';

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
});
