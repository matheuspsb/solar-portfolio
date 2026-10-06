import { describe, expect, it } from 'vitest';
import { readDeliveryConfig } from './delivery-config';

const complete = {
  RESEND_API_KEY: 're_123',
  CONTACT_FROM_EMAIL: 'onboarding@resend.dev',
  CONTACT_TO_EMAIL: 'dono@exemplo.com',
};

describe('readDeliveryConfig', () => {
  it('reads a complete Resend configuration', () => {
    expect(readDeliveryConfig(complete)).toEqual({
      mode: 'resend',
      apiKey: 're_123',
      from: 'onboarding@resend.dev',
      to: 'dono@exemplo.com',
    });
  });

  it('trims stray spaces pasted into the values', () => {
    const config = readDeliveryConfig({ ...complete, RESEND_API_KEY: '  re_123 \n' });
    expect(config).toMatchObject({ mode: 'resend', apiKey: 're_123' });
  });

  it('lists every missing variable by name, without echoing any value', () => {
    const config = readDeliveryConfig({ RESEND_API_KEY: '   ', CONTACT_FROM_EMAIL: 'a@b.co' });
    expect(config).toEqual({ mode: 'missing', missing: ['RESEND_API_KEY', 'CONTACT_TO_EMAIL'] });
  });

  it('can be switched off explicitly for local work and tests', () => {
    expect(readDeliveryConfig({ CONTACT_DELIVERY: 'disabled' })).toEqual({ mode: 'disabled' });
  });

  it('prefers the explicit off switch over a complete configuration', () => {
    expect(readDeliveryConfig({ ...complete, CONTACT_DELIVERY: 'disabled' })).toEqual({
      mode: 'disabled',
    });
  });
});
