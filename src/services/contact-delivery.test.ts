import { describe, expect, it, vi } from 'vitest';
import { createContactDelivery } from './contact-delivery';
import type { EmailClient } from './resend-delivery';

const message = {
  name: 'Ana Souza',
  email: 'ana@empresa.com',
  message: 'Gostei do seu portfólio, vamos conversar?',
};

describe('createContactDelivery', () => {
  it('delivers through Resend when the configuration is complete', async () => {
    const send = vi.fn<EmailClient['emails']['send']>(async () => ({ error: null }));
    const createClient = vi.fn(() => ({ emails: { send } }));
    const delivery = createContactDelivery(
      { mode: 'resend', apiKey: 're_123', from: 'a@b.co', to: 'c@d.co' },
      createClient,
    );

    await delivery.deliver(message);

    expect(createClient).toHaveBeenCalledWith('re_123');
    expect(send).toHaveBeenCalledOnce();
  });

  it('accepts and drops the message when delivery is switched off, without touching the provider', async () => {
    const createClient = vi.fn();
    const delivery = createContactDelivery({ mode: 'disabled' }, createClient);
    await expect(delivery.deliver(message)).resolves.toBeUndefined();
    expect(createClient).not.toHaveBeenCalled();
  });

  it('fails loudly, naming what is missing, instead of silently losing messages', async () => {
    const createClient = vi.fn();
    const delivery = createContactDelivery(
      { mode: 'missing', missing: ['RESEND_API_KEY', 'CONTACT_TO_EMAIL'] },
      createClient,
    );
    await expect(delivery.deliver(message)).rejects.toThrow('RESEND_API_KEY, CONTACT_TO_EMAIL');
    expect(createClient).not.toHaveBeenCalled();
  });
});
