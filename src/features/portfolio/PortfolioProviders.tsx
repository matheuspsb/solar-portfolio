'use client';

import type { ReactNode } from 'react';
import { ContactSubmitterProvider } from '@/features/content-panel';
import type { ContactMessageSubmitter } from '@/lib/contact-message';

type PortfolioProvidersProps = {
  contactSubmitter: ContactMessageSubmitter;
  children: ReactNode;
};

export function PortfolioProviders({ contactSubmitter, children }: PortfolioProvidersProps) {
  return (
    <ContactSubmitterProvider submitter={contactSubmitter}>{children}</ContactSubmitterProvider>
  );
}
