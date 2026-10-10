import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { ContactMessageSubmitter } from '@/domain/contact-message';
import { ContactSubmitterProvider, useContactSubmitter } from './contact-submitter';

describe('useContactSubmitter', () => {
  it('hands the provided submitter to whoever asks, however deep in the tree', () => {
    const submitter = vi.fn<ContactMessageSubmitter>(async () => ({ ok: true }));
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ContactSubmitterProvider submitter={submitter}>
        <div>
          <div>{children}</div>
        </div>
      </ContactSubmitterProvider>
    );
    const { result } = renderHook(() => useContactSubmitter(), { wrapper });
    expect(result.current).toBe(submitter);
  });

  it('fails loudly, saying what is missing, when used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useContactSubmitter())).toThrow(/ContactSubmitterProvider/);
    vi.restoreAllMocks();
  });
});
