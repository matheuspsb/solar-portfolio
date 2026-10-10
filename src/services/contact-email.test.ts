import { describe, expect, it } from 'vitest';
import { buildContactEmail } from './contact-email';

const addresses = { from: 'onboarding@resend.dev', to: 'dono@exemplo.com' };
const message = {
  name: 'Ana Souza',
  email: 'ana@empresa.com',
  message: 'Gostei do seu portfólio, vamos conversar?',
};

describe('buildContactEmail', () => {
  it('sends from and to the configured addresses and lets the owner reply to the visitor', () => {
    const email = buildContactEmail(message, addresses);
    expect(email.from).toBe('onboarding@resend.dev');
    expect(email.to).toBe('dono@exemplo.com');
    expect(email.replyTo).toBe('ana@empresa.com');
  });

  it('keeps the subject on a single line even if the name contains line breaks', () => {
    const email = buildContactEmail({ ...message, name: 'Ana\r\nBcc: alguem@mal.com' }, addresses);
    expect(email.subject).not.toMatch(/[\r\n]/);
  });

  it('escapes html so a visitor cannot inject markup into the owner inbox', () => {
    const email = buildContactEmail(
      { ...message, name: '<b>Ana</b>', message: '<script>alert("x")</script> & mais' },
      addresses,
    );
    expect(email.html).not.toContain('<script>');
    expect(email.html).not.toContain('<b>Ana</b>');
    expect(email.html).toContain('&lt;script&gt;');
    expect(email.html).toContain('&amp; mais');
  });
});
