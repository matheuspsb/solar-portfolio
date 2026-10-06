import { describe, expect, it, vi } from 'vitest';
import { createResendDelivery } from './resend-delivery';
import type { EmailClient } from './resend-delivery';

const message = {
  name: 'Ana Souza',
  email: 'ana@empresa.com',
  message: 'Gostei do seu portfólio, vamos conversar?',
};
const addresses = { from: 'onboarding@resend.dev', to: 'dono@exemplo.com' };

function createClient(response: Awaited<ReturnType<EmailClient['emails']['send']>>) {
  const send = vi.fn<EmailClient['emails']['send']>(async () => response);
  return { client: { emails: { send } } satisfies EmailClient, send };
}

describe('createResendDelivery', () => {
  it('sends the visitor message to the owner through the e-mail client', async () => {
    const { client, send } = createClient({ error: null });
    await createResendDelivery({ client, ...addresses }).deliver(message);

    expect(send).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: addresses.from,
        to: addresses.to,
        replyTo: message.email,
      }),
    );
  });

  it('fails when the provider answers with an error, so the visitor is told', async () => {
    const { client } = createClient({ error: { message: 'Invalid API key' } });
    await expect(createResendDelivery({ client, ...addresses }).deliver(message)).rejects.toThrow(
      'Invalid API key',
    );
  });
});
