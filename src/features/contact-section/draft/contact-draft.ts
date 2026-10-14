import { z } from 'zod';
import { CONTACT_MESSAGE_LIMITS } from '@/domain/contact-message';
import type { ContactMessage } from '@/domain/contact-message';

const DAY_MS = 24 * 60 * 60 * 1000;
export const CONTACT_DRAFT_TTL_MS = 7 * DAY_MS;
const CONTACT_DRAFT_VERSION = 1;

export const EMPTY_CONTACT_MESSAGE: ContactMessage = { name: '', email: '', message: '' };

const contactDraftSchema = z.object({
  version: z.literal(CONTACT_DRAFT_VERSION),
  savedAt: z.number(),
  startedAt: z.number(),
  step: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  values: z.object({
    name: z.string().max(CONTACT_MESSAGE_LIMITS.nameMax),
    email: z.string().max(CONTACT_MESSAGE_LIMITS.emailMax),
    message: z.string().max(CONTACT_MESSAGE_LIMITS.messageMax),
  }),
});

export type ContactDraft = z.infer<typeof contactDraftSchema>;

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function parseContactDraft(raw: string | null, nowMs: number): ContactDraft | null {
  if (!raw) return null;
  const result = contactDraftSchema.safeParse(parseJson(raw));
  if (!result.success) return null;
  const isExpired = nowMs - result.data.savedAt > CONTACT_DRAFT_TTL_MS;
  return isExpired ? null : result.data;
}

export function serializeContactDraft(draft: Omit<ContactDraft, 'version'>): string {
  return JSON.stringify({ version: CONTACT_DRAFT_VERSION, ...draft });
}

export function hasAnyAnswer(values: ContactMessage): boolean {
  return Object.values(values).some((value) => value.trim().length > 0);
}
