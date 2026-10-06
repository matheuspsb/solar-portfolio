import { unconfiguredContactDelivery } from './contact';
import type { ContactDelivery } from './contact';
import type { DeliveryConfig } from './delivery-config';
import { createResendDelivery } from './resend-delivery';
import type { EmailClient } from './resend-delivery';

export function createContactDelivery(
  config: DeliveryConfig,
  createClient: (apiKey: string) => EmailClient,
): ContactDelivery {
  switch (config.mode) {
    case 'resend':
      return createResendDelivery({
        client: createClient(config.apiKey),
        from: config.from,
        to: config.to,
      });
    case 'disabled':
      return unconfiguredContactDelivery;
    case 'missing':
      return {
        deliver: async () => {
          throw new Error(
            `Contact delivery is not configured. Missing: ${config.missing.join(', ')}`,
          );
        },
      };
  }
}
