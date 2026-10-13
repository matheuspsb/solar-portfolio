import { z } from 'zod';
import { CONTACT_MESSAGE_LIMITS, validateContactField } from '@/domain/contact-message';
import type { ContactField, ContactMessage } from '@/domain/contact-message';
import type { ContactStepIndex } from '../question/contact-flow';

const DAY_MS = 24 * 60 * 60 * 1000;
export const CONTACT_DRAFT_TTL_MS = 7 * DAY_MS;
const CONTACT_DRAFT_VERSION = 1;
const STEP_INDEXES: readonly ContactStepIndex[] = [0, 1, 2];

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

export type ContactDraft = {
  version: typeof CONTACT_DRAFT_VERSION;
  savedAt: number;
  startedAt: number;
  step: ContactStepIndex;
  values: ContactMessage;
};

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

export function createContactDraft(fields: Omit<ContactDraft, 'version'>): ContactDraft {
  return { version: CONTACT_DRAFT_VERSION, ...fields };
}

export function serializeContactDraft(draft: ContactDraft): string {
  return JSON.stringify(draft);
}

export function hasAnyAnswer(values: ContactMessage): boolean {
  return Object.values(values).some((value) => value.trim().length > 0);
}

export function getResumeStep(
  draft: ContactDraft,
  fieldOrder: readonly ContactField[],
): ContactStepIndex {
  const isAnswerInvalid = (step: ContactStepIndex): boolean => {
    const field = fieldOrder[step];
    return field !== undefined && validateContactField(field, draft.values[field]) !== null;
  };
  const firstInvalidStep = STEP_INDEXES.find((step) => step < draft.step && isAnswerInvalid(step));
  return firstInvalidStep ?? draft.step;
}
