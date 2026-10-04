'use server';

import type { ContactSubmitResult } from '@/lib/contact-message';
import { createContactMessageHandler, unconfiguredContactDelivery } from '@/services/contact';

// TODO(integration): swap `unconfiguredContactDelivery` for a real `ContactDelivery` (e-mail, CRM...).
const handleContactMessage = createContactMessageHandler(unconfiguredContactDelivery);

export async function sendContactMessage(input: unknown): Promise<ContactSubmitResult> {
  return handleContactMessage(input);
}
