'use client';

import { createContext, use } from 'react';
import type { ReactNode } from 'react';
import type { ContactMessageSubmitter } from '@/domain/contact-message';

const ContactSubmitterContext = createContext<ContactMessageSubmitter | null>(null);

type ContactSubmitterProviderProps = {
  submitter: ContactMessageSubmitter;
  children: ReactNode;
};

export function ContactSubmitterProvider({ submitter, children }: ContactSubmitterProviderProps) {
  return <ContactSubmitterContext value={submitter}>{children}</ContactSubmitterContext>;
}

export function useContactSubmitter(): ContactMessageSubmitter {
  const submitter = use(ContactSubmitterContext);
  if (submitter === null) {
    throw new Error('useContactSubmitter must be used inside a ContactSubmitterProvider');
  }
  return submitter;
}
