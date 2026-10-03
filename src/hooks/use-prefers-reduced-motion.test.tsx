// Use case: a visitor with vestibular sensitivity enables "reduce motion" in their OS, possibly
// while the site is open. The Sun must stop rotating and easing right away, and start again if
// they turn it off. Browsers without matchMedia must default to normal motion, not crash.
import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { usePrefersReducedMotion } from './use-prefers-reduced-motion';
import type { MediaQueryListLike } from './use-prefers-reduced-motion';

function createFakeMediaQuery(initialMatches: boolean) {
  const listeners = new Set<() => void>();
  const mediaQuery: MediaQueryListLike = {
    matches: initialMatches,
    addEventListener: (_eventName, listener) => listeners.add(listener),
    removeEventListener: (_eventName, listener) => listeners.delete(listener),
  };
  return {
    mediaQuery,
    listeners,
    change(matches: boolean) {
      mediaQuery.matches = matches;
      listeners.forEach((listener) => listener());
    },
  };
}

function Probe() {
  return <p>{String(usePrefersReducedMotion(() => createFakeMediaQuery(true).mediaQuery))}</p>;
}

describe('usePrefersReducedMotion', () => {
  it('reflects the current preference', () => {
    const reduced = createFakeMediaQuery(true);
    const { result } = renderHook(() => usePrefersReducedMotion(() => reduced.mediaQuery));
    expect(result.current).toBe(true);
  });

  it('is false when the user did not ask to reduce motion', () => {
    const allowed = createFakeMediaQuery(false);
    const { result } = renderHook(() => usePrefersReducedMotion(() => allowed.mediaQuery));
    expect(result.current).toBe(false);
  });

  it('updates when the preference is toggled at runtime, both ways', () => {
    const fake = createFakeMediaQuery(false);
    const { result } = renderHook(() => usePrefersReducedMotion(() => fake.mediaQuery));
    act(() => fake.change(true));
    expect(result.current).toBe(true);
    act(() => fake.change(false));
    expect(result.current).toBe(false);
  });

  it('stops listening on unmount', () => {
    const fake = createFakeMediaQuery(false);
    const { unmount } = renderHook(() => usePrefersReducedMotion(() => fake.mediaQuery));
    expect(fake.listeners.size).toBe(1);
    unmount();
    expect(fake.listeners.size).toBe(0);
  });

  it('defaults to normal motion when matchMedia is not available', () => {
    const { result } = renderHook(() => usePrefersReducedMotion(() => null));
    expect(result.current).toBe(false);
  });

  it('defaults to normal motion on the server without touching the browser', () => {
    const getMediaQuery = vi.fn();
    function ServerProbe() {
      return <p>{String(usePrefersReducedMotion(getMediaQuery))}</p>;
    }
    expect(renderToString(<ServerProbe />)).toContain('false');
    expect(getMediaQuery).not.toHaveBeenCalled();
    expect(renderToString(<Probe />)).toContain('false');
  });
});
