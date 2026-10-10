'use client';

import type { ReactNode } from 'react';
import type { ContactMessageSubmitter } from '@/domain/contact-message';
import { ContactSubmitterProvider } from '@/hooks/contact-submitter';

type PortfolioProvidersProps = {
  contactSubmitter: ContactMessageSubmitter;
  children: ReactNode;
};

export function PortfolioProviders({ contactSubmitter, children }: PortfolioProvidersProps) {
  return (
    <ContactSubmitterProvider submitter={contactSubmitter}>{children}</ContactSubmitterProvider>
  );
}
