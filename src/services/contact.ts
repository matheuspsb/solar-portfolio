import { parseContactMessage } from '@/lib/contact-message';
import type { ContactMessage, ContactSubmitResult } from '@/lib/contact-message';

/**
 * Where a validated contact message goes (e-mail, CRM, Slack, a database...). Implement this
 * interface and pass it to `createContactMessageHandler` in `app/actions.ts` to go live.
 */
export type ContactDelivery = {
  deliver: (message: ContactMessage) => Promise<void>;
};

/** Placeholder: accepts every message and drops it. Replace it before the form is meant to be read. */
export const unconfiguredContactDelivery: ContactDelivery = {
  deliver: async () => undefined,
};

const INVALID_MESSAGE = 'Confira os campos do formulário e tente novamente.';
const DELIVERY_FAILED_MESSAGE =
  'Não foi possível enviar agora. Tente novamente em instantes ou fale pelo LinkedIn.';

/** Builds the function the form calls: validate again on the server, deliver, never leak internals. */
export function createContactMessageHandler(delivery: ContactDelivery) {
  return async (input: unknown): Promise<ContactSubmitResult> => {
    const parsed = parseContactMessage(input);
    if (!parsed.success) return { ok: false, error: INVALID_MESSAGE };

    try {
      await delivery.deliver(parsed.data);
      return { ok: true };
    } catch {
      return { ok: false, error: DELIVERY_FAILED_MESSAGE };
    }
  };
}
