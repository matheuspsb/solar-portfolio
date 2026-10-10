import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { useContactSubmitter } from '@/hooks/contact-submitter';
import { PortfolioProviders } from './PortfolioProviders';

const contactSubmitter = async () => ({ ok: true as const });

describe('PortfolioProviders', () => {
  it('gives every part of the experience the contact submitter', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <PortfolioProviders contactSubmitter={contactSubmitter}>{children}</PortfolioProviders>
    );
    const { result } = renderHook(() => useContactSubmitter(), { wrapper });
    expect(result.current).toBe(contactSubmitter);
  });
});
