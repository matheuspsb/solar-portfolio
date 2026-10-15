import { HONEYPOT_FIELD } from '@/domain/bot-guard';
import type {
  ContactMessageSubmitter,
  ContactSubmission,
  ContactSubmitResult,
} from '@/domain/contact-message';

export const UNEXPECTED_FAILURE = 'Não foi possível enviar agora. Tente novamente em instantes.';

export function readHoneypot(form: HTMLFormElement | null): string {
  const value = form ? new FormData(form).get(HONEYPOT_FIELD) : null;
  return typeof value === 'string' ? value : '';
}

export async function deliverSafely(
  submit: ContactMessageSubmitter,
  message: ContactSubmission,
): Promise<ContactSubmitResult> {
  try {
    return await submit(message);
  } catch {
    return { ok: false, error: UNEXPECTED_FAILURE };
  }
}
