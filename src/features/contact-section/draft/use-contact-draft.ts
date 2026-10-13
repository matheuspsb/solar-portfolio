import { useRef, useState } from 'react';
import type { ContactField, ContactMessage } from '@/domain/contact-message';
import type { ContactStepIndex } from '../question/contact-flow';
import {
  createContactDraft,
  getResumeStep,
  hasAnyAnswer,
  parseContactDraft,
  serializeContactDraft,
} from './contact-draft';
import { readStoredText, removeStoredText, writeStoredText } from './draft-storage';
import type { DraftStorage } from './draft-storage';

export const CONTACT_DRAFT_KEY = 'contactDraft';

const EMPTY_VALUES: ContactMessage = { name: '', email: '', message: '' };

type UseContactDraftOptions = {
  storage: DraftStorage | null;
  fieldOrder: readonly ContactField[];
  getNow: () => Date;
};

type RestoredDraft = {
  values: ContactMessage;
  step: ContactStepIndex;
  startedAt: number;
};

type ContactDraftSession = RestoredDraft & {
  save: (values: ContactMessage, step: ContactStepIndex) => void;
  clear: () => void;
};

function restoreDraft({ storage, fieldOrder, getNow }: UseContactDraftOptions): RestoredDraft {
  const nowMs = getNow().getTime();
  const draft = parseContactDraft(readStoredText(storage, CONTACT_DRAFT_KEY), nowMs);
  if (draft === null) return { values: EMPTY_VALUES, step: 0, startedAt: nowMs };
  return {
    values: draft.values,
    step: getResumeStep(draft, fieldOrder),
    startedAt: draft.startedAt,
  };
}

export function useContactDraft(options: UseContactDraftOptions): ContactDraftSession {
  const { storage, getNow } = options;
  const [restored] = useState(() => restoreDraft(options));
  const lastSavedRef = useRef<string | null>(null);

  const save = (values: ContactMessage, step: ContactStepIndex) => {
    if (!hasAnyAnswer(values)) {
      clear();
      return;
    }
    const savedContent = JSON.stringify({ values, step });
    if (savedContent === lastSavedRef.current) return;
    lastSavedRef.current = savedContent;
    const draft = createContactDraft({
      savedAt: getNow().getTime(),
      startedAt: restored.startedAt,
      step,
      values,
    });
    writeStoredText(storage, CONTACT_DRAFT_KEY, serializeContactDraft(draft));
  };

  const clear = () => {
    lastSavedRef.current = null;
    removeStoredText(storage, CONTACT_DRAFT_KEY);
  };

  return { ...restored, save, clear };
}
