import { useSyncExternalStore } from 'react';

export type MediaQueryListLike = {
  matches: boolean;
  addEventListener: (eventName: 'change', listener: () => void) => void;
  removeEventListener: (eventName: 'change', listener: () => void) => void;
};

export type MediaQueryProvider = (query: string) => MediaQueryListLike | null;

const defaultProvider: MediaQueryProvider = (query) =>
  typeof window.matchMedia === 'function' ? window.matchMedia(query) : null;

export function useMediaQuery(
  query: string,
  getMediaQuery: MediaQueryProvider = defaultProvider,
): boolean {
  const subscribe = (onChange: () => void) => {
    const mediaQuery = getMediaQuery(query);
    mediaQuery?.addEventListener('change', onChange);
    return () => mediaQuery?.removeEventListener('change', onChange);
  };
  const getSnapshot = () => getMediaQuery(query)?.matches ?? false;

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
