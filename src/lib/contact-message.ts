import { z } from 'zod';
import type { BotSignals } from './bot-guard';

export const CONTACT_MESSAGE_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  messageMax: 500,
} as const;

const nameSchema = z
  .string({ error: 'Digite seu nome para continuar.' })
  .trim()
  .min(1, 'Digite seu nome para continuar.')
  .min(
    CONTACT_MESSAGE_LIMITS.nameMin,
    `Use pelo menos ${CONTACT_MESSAGE_LIMITS.nameMin} caracteres.`,
  )
  .max(
    CONTACT_MESSAGE_LIMITS.nameMax,
    `Use no máximo ${CONTACT_MESSAGE_LIMITS.nameMax} caracteres.`,
  );

const emailSchema = z
  .string({ error: 'Esse e-mail parece incompleto.' })
  .trim()
  .min(1, 'Esse e-mail parece incompleto.')
  .max(
    CONTACT_MESSAGE_LIMITS.emailMax,
    `Use no máximo ${CONTACT_MESSAGE_LIMITS.emailMax} caracteres.`,
  )
  .pipe(z.email('Esse e-mail parece incompleto.'));

const messageSchema = z
  .string({ error: 'Escreva uma mensagem antes de enviar.' })
  .trim()
  .min(1, 'Escreva uma mensagem antes de enviar.')
  .max(
    CONTACT_MESSAGE_LIMITS.messageMax,
    `Use no máximo ${CONTACT_MESSAGE_LIMITS.messageMax} caracteres.`,
  );

export const contactMessageSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  message: messageSchema,
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

export type ContactField = keyof ContactMessage;

const FIELD_SCHEMAS = {
  name: nameSchema,
  email: emailSchema,
  message: messageSchema,
} as const;

export function validateContactField(field: ContactField, value: unknown): string | null {
  const result = FIELD_SCHEMAS[field].safeParse(value);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? null;
}

type ParseResult =
  | { success: true; data: ContactMessage }
  | { success: false; fieldErrors: Partial<Record<ContactField, string>> };

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

export type ContactSubmitResult = { ok: true } | { ok: false; error: string };

export type ContactSubmission = ContactMessage & BotSignals;

export type ContactMessageSubmitter = (
  submission: ContactSubmission,
) => Promise<ContactSubmitResult>;
