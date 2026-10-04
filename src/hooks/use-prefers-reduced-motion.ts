import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export type MediaQueryListLike = {
  matches: boolean;
  addEventListener: (eventName: 'change', listener: () => void) => void;
  removeEventListener: (eventName: 'change', listener: () => void) => void;
};

type MediaQueryProvider = (query: string) => MediaQueryListLike | null;

const defaultProvider: MediaQueryProvider = (query) =>
  typeof window.matchMedia === 'function' ? window.matchMedia(query) : null;

/** Follows the OS "reduce motion" setting live. Defaults to normal motion when it cannot be read. */
export function usePrefersReducedMotion(
  getMediaQuery: MediaQueryProvider = defaultProvider,
): boolean {
  const subscribe = (onChange: () => void) => {
    const mediaQuery = getMediaQuery(REDUCED_MOTION_QUERY);
    mediaQuery?.addEventListener('change', onChange);
    return () => mediaQuery?.removeEventListener('change', onChange);
  };
  const getSnapshot = () => getMediaQuery(REDUCED_MOTION_QUERY)?.matches ?? false;

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
