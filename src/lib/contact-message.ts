import { z } from 'zod';

export const CONTACT_MESSAGE_LIMITS = {
  nameMax: 100,
  emailMax: 254,
  messageMin: 10,
  messageMax: 2000,
} as const;

const nameSchema = z
  .string({ error: 'Informe seu nome.' })
  .trim()
  .min(1, 'Informe seu nome.')
  .max(
    CONTACT_MESSAGE_LIMITS.nameMax,
    `Use no máximo ${CONTACT_MESSAGE_LIMITS.nameMax} caracteres.`,
  );

const emailSchema = z
  .string({ error: 'Informe seu e-mail.' })
  .trim()
  .min(1, 'Informe seu e-mail.')
  .max(
    CONTACT_MESSAGE_LIMITS.emailMax,
    `Use no máximo ${CONTACT_MESSAGE_LIMITS.emailMax} caracteres.`,
  )
  .pipe(z.email('Informe um e-mail válido.'));

const messageSchema = z
  .string({ error: 'Escreva uma mensagem.' })
  .trim()
  .min(1, 'Escreva uma mensagem.')
  .min(
    CONTACT_MESSAGE_LIMITS.messageMin,
    `Escreva pelo menos ${CONTACT_MESSAGE_LIMITS.messageMin} caracteres.`,
  )
  .max(
    CONTACT_MESSAGE_LIMITS.messageMax,
    `Use no máximo ${CONTACT_MESSAGE_LIMITS.messageMax} caracteres.`,
  );

/** Shared by the browser form (friendly errors) and the server (which never trusts the client). */
export const contactMessageSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  message: messageSchema,
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

export type ContactField = keyof ContactMessage;

type ParseResult =
  | { success: true; data: ContactMessage }
  | { success: false; fieldErrors: Partial<Record<ContactField, string>> };

/** Validates an unknown input and reports at most one readable message per field. */
export function parseContactMessage(input: unknown): ParseResult {
  const result = contactMessageSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const fieldErrors: Partial<Record<ContactField, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (
      typeof field === 'string' &&
      field in contactMessageSchema.shape &&
      !(field in fieldErrors)
    ) {
      fieldErrors[field as ContactField] = issue.message;
    }
  }
  return { success: false, fieldErrors };
}

/** What the page-level handler reports back to the form. */
export type ContactSubmitResult = { ok: true } | { ok: false; error: string };

/** Sends a validated message somewhere (a server action in the app). Injected into the form. */
export type ContactMessageSubmitter = (message: ContactMessage) => Promise<ContactSubmitResult>;
