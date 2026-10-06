import type { ContactDelivery } from './contact';
import { buildContactEmail } from './contact-email';
import type { ContactEmail } from './contact-email';

export type EmailClient = {
  emails: {
    send: (email: ContactEmail) => Promise<{ error: { message: string } | null }>;
  };
};

type ResendDeliveryOptions = {
  client: EmailClient;
  from: string;
  to: string;
};

export function createResendDelivery({ client, from, to }: ResendDeliveryOptions): ContactDelivery {
  return {
    deliver: async (message) => {
      const { error } = await client.emails.send(buildContactEmail(message, { from, to }));
      if (error) throw new Error(error.message);
    },
  };
}
