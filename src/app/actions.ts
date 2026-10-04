'use server';

import type { ContactSubmitResult } from '@/lib/contact-message';
import { createContactMessageHandler, unconfiguredContactDelivery } from '@/services/contact';

// TODO(integration): swap `unconfiguredContactDelivery` for a real `ContactDelivery` (e-mail, CRM...).
const handleContactMessage = createContactMessageHandler(unconfiguredContactDelivery);

/** Server Action called by the contact form. Input comes from the browser, so it is validated again. */
export async function sendContactMessage(input: unknown): Promise<ContactSubmitResult> {
  return handleContactMessage(input);
}
