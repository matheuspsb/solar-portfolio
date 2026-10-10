import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDecodedText } from './use-decoded-text';

const TICK_MS = 30;
const alwaysFirst = () => 0;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function tick(times: number) {
  act(() => {
    vi.advanceTimersByTime(times * TICK_MS);
  });
}

describe('useDecodedText', () => {
  it('starts hidden behind a mask, never showing the final text at once', () => {
    const { result } = renderHook(() =>
      useDecodedText('MERCÚRIO', { isEnabled: true, random: alwaysFirst }),
    );
    expect(result.current).toBe('########');
  });

  it('ends on the real text and then stops its timer', () => {
    const { result } = renderHook(() =>
      useDecodedText('SOL', { isEnabled: true, random: alwaysFirst }),
    );
    tick(6);
    expect(result.current).toBe('SOL');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps the spaces of a name with several words', () => {
    const { result } = renderHook(() =>
      useDecodedText('A B', { isEnabled: true, random: alwaysFirst }),
    );
    expect(result.current).toBe('# #');
  });

  it('shows the real text at once, without timers, when motion is reduced', () => {
    const { result } = renderHook(() =>
      useDecodedText('MERCÚRIO', { isEnabled: false, random: alwaysFirst }),
    );
    expect(result.current).toBe('MERCÚRIO');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('starts over, masked, when the text changes', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useDecodedText(text, { isEnabled: true, random: alwaysFirst }),
      { initialProps: { text: 'SOL' } },
    );
    tick(6);
    expect(result.current).toBe('SOL');
    rerender({ text: 'MERCÚRIO' });
    expect(result.current).toBe('########');
    tick(2);
    expect(result.current).toBe('MAAAAAAA');
  });

  it('clears its timer when it unmounts in the middle of the decoding', () => {
    const { unmount } = renderHook(() =>
      useDecodedText('MERCÚRIO', { isEnabled: true, random: alwaysFirst }),
    );
    tick(2);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
