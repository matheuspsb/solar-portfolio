import { useSyncExternalStore } from 'react';

const SERVER_VIEWPORT_WIDTH = 0;

function subscribe(onChange: () => void): () => void {
  window.addEventListener('resize', onChange);
  window.addEventListener('orientationchange', onChange);
  return () => {
    window.removeEventListener('resize', onChange);
    window.removeEventListener('orientationchange', onChange);
  };
}

const getSnapshot = (): number => window.innerWidth;
const getServerSnapshot = (): number => SERVER_VIEWPORT_WIDTH;

export function useViewportWidth(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
