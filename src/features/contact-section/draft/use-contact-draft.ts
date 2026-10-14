import { useState } from 'react';
import type { ContactMessage } from '@/domain/contact-message';
import { readStorageItem, removeStorageItem, writeStorageItem } from '@/lib/safe-storage';
import type { KeyValueStorage } from '@/lib/safe-storage';
import type { ContactStepIndex } from '../question/contact-flow';
import {
  EMPTY_CONTACT_MESSAGE,
  hasAnyAnswer,
  parseContactDraft,
  serializeContactDraft,
} from './contact-draft';
import type { ContactDraft } from './contact-draft';

export const CONTACT_DRAFT_KEY = 'contactDraft';

type UseContactDraftOptions = {
  storage: KeyValueStorage | null;
  getNow: () => Date;
};

type RestoredDraft = Pick<ContactDraft, 'values' | 'step' | 'startedAt'>;

type ContactDraftSession = RestoredDraft & {
  save: (values: ContactMessage, step: ContactStepIndex) => void;
  clear: () => void;
};

function restoreDraft({ storage, getNow }: UseContactDraftOptions): RestoredDraft {
  const nowMs = getNow().getTime();
  const draft = parseContactDraft(readStorageItem(storage, CONTACT_DRAFT_KEY), nowMs);
  return draft ?? { values: EMPTY_CONTACT_MESSAGE, step: 0, startedAt: nowMs };
}

export function useContactDraft(options: UseContactDraftOptions): ContactDraftSession {
  const { storage, getNow } = options;
  const [{ values, step, startedAt }] = useState(() => restoreDraft(options));

  const clear = () => {
    removeStorageItem(storage, CONTACT_DRAFT_KEY);
  };

  const save = (answers: ContactMessage, currentStep: ContactStepIndex) => {
    if (!hasAnyAnswer(answers)) {
      clear();
      return;
    }
    const savedAt = getNow().getTime();
    const draft = serializeContactDraft({ savedAt, startedAt, step: currentStep, values: answers });
    writeStorageItem(storage, CONTACT_DRAFT_KEY, draft);
  };

  return { values, step, startedAt, save, clear };
}
