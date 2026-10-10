import { judgeSubmission } from '@/domain/bot-guard';
import type { BotVerdict } from '@/domain/bot-guard';
import { parseContactMessage } from '@/domain/contact-message';
import type { ContactMessage, ContactSubmitResult } from '@/domain/contact-message';

export type ContactDelivery = {
  deliver: (message: ContactMessage) => Promise<void>;
};

export const unconfiguredContactDelivery: ContactDelivery = {
  deliver: async () => undefined,
};

const INVALID_MESSAGE = 'Confira os campos do formulário e tente novamente.';
const DELIVERY_FAILED_MESSAGE =
  'Não foi possível enviar agora. Tente novamente em instantes ou fale pelo LinkedIn.';

type HandlerReporters = {
  reportError?: (error: unknown) => void;
  reportBlocked?: (verdict: Exclude<BotVerdict, 'human'>) => void;
};

export function createContactMessageHandler(
  delivery: ContactDelivery,
  { reportError = () => undefined, reportBlocked = () => undefined }: HandlerReporters = {},
) {
  return async (input: unknown): Promise<ContactSubmitResult> => {
    const parsed = parseContactMessage(input);
    if (!parsed.success) return { ok: false, error: INVALID_MESSAGE };

    const verdict = judgeSubmission(input);
    if (verdict !== 'human') {
      reportBlocked(verdict);
      return { ok: true };
    }

    try {
      await delivery.deliver(parsed.data);
      return { ok: true };
    } catch (error) {
      reportError(error);
      return { ok: false, error: DELIVERY_FAILED_MESSAGE };
    }
  };
}
