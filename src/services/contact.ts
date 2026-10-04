import { parseContactMessage } from '@/lib/contact-message';
import type { ContactMessage, ContactSubmitResult } from '@/lib/contact-message';

export type ContactDelivery = {
  deliver: (message: ContactMessage) => Promise<void>;
};

export const unconfiguredContactDelivery: ContactDelivery = {
  deliver: async () => undefined,
};

const INVALID_MESSAGE = 'Confira os campos do formulário e tente novamente.';
const DELIVERY_FAILED_MESSAGE =
  'Não foi possível enviar agora. Tente novamente em instantes ou fale pelo LinkedIn.';

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
