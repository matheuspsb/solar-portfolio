import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HIDE_DELAY_MS, SHOW_DELAY_MS, useIntentTarget } from './use-intent-target';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

describe('useIntentTarget', () => {
  it('waits a moment before showing a target, so a cursor just passing by does not flash it', () => {
    const { result } = renderHook(() => useIntentTarget('sun'));
    advance(SHOW_DELAY_MS - 1);
    expect(result.current).toBeNull();
    advance(1);
    expect(result.current).toBe('sun');
  });

  it('never shows a target the cursor left before the delay', () => {
    const { result, rerender } = renderHook(({ target }) => useIntentTarget(target), {
      initialProps: { target: 'sun' as string | null },
    });
    advance(SHOW_DELAY_MS - 10);
    rerender({ target: null });
    advance(1000);
    expect(result.current).toBeNull();
  });

  it('keeps the target a little after the cursor leaves, then hides it', () => {
    const { result, rerender } = renderHook(({ target }) => useIntentTarget(target), {
      initialProps: { target: 'sun' as string | null },
    });
    advance(SHOW_DELAY_MS);
    rerender({ target: null });
    advance(HIDE_DELAY_MS - 1);
    expect(result.current).toBe('sun');
    advance(1);
    expect(result.current).toBeNull();
  });

  it('keeps the target when the cursor comes back before it was hidden', () => {
    const { result, rerender } = renderHook(({ target }) => useIntentTarget(target), {
      initialProps: { target: 'sun' as string | null },
    });
    advance(SHOW_DELAY_MS);
    rerender({ target: null });
    advance(HIDE_DELAY_MS - 50);
    rerender({ target: 'sun' });
    advance(1000);
    expect(result.current).toBe('sun');
  });

  it('moves straight to another target, without waiting and without an exit in between', () => {
    const { result, rerender } = renderHook(({ target }) => useIntentTarget(target), {
      initialProps: { target: 'sun' as string | null },
    });
    advance(SHOW_DELAY_MS);
    rerender({ target: 'mercury' });
    advance(1);
    expect(result.current).toBe('mercury');
  });

  it('does not leave timers behind when it unmounts', () => {
    const { unmount } = renderHook(() => useIntentTarget('sun'));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
