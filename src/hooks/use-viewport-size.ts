import { useSyncExternalStore } from 'react';

type ViewportSize = {
  width: number;
  height: number;
};

const SERVER_VIEWPORT_SIZE: ViewportSize = { width: 0, height: 0 };

let lastSize: ViewportSize = SERVER_VIEWPORT_SIZE;

function subscribe(onChange: () => void): () => void {
  window.addEventListener('resize', onChange);
  window.addEventListener('orientationchange', onChange);
  return () => {
    window.removeEventListener('resize', onChange);
    window.removeEventListener('orientationchange', onChange);
  };
}

function getSnapshot(): ViewportSize {
  const { innerWidth: width, innerHeight: height } = window;
  if (lastSize.width !== width || lastSize.height !== height) lastSize = { width, height };
  return lastSize;
}

const getServerSnapshot = (): ViewportSize => SERVER_VIEWPORT_SIZE;

export function useViewportSize(): ViewportSize {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
