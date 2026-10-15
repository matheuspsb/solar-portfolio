import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMediaQuery } from './use-media-query';

describe('useMediaQuery', () => {
  it('asks for the query it was given', () => {
    const provider = vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const { result } = renderHook(() => useMediaQuery('(pointer: coarse)', provider));
    expect(result.current).toBe(true);
    expect(provider).toHaveBeenCalledWith('(pointer: coarse)');
  });

  it('is false when the browser cannot answer media queries', () => {
    const { result } = renderHook(() => useMediaQuery('(pointer: coarse)', () => null));
    expect(result.current).toBe(false);
  });
});
