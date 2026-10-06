'use server';

import { Resend } from 'resend';
import type { ContactSubmitResult } from '@/lib/contact-message';
import { createContactMessageHandler } from '@/services/contact';
import { createContactDelivery } from '@/services/contact-delivery';
import { readDeliveryConfig } from '@/services/delivery-config';

function logDeliveryFailure(error: unknown) {
  // eslint-disable-next-line no-console
  console.error('Contact message could not be delivered', error);
}

export async function sendContactMessage(input: unknown): Promise<ContactSubmitResult> {
  const delivery = createContactDelivery(
    readDeliveryConfig(process.env),
    (apiKey) => new Resend(apiKey),
  );
  return createContactMessageHandler(delivery, logDeliveryFailure)(input);
}
