import { useEffect, useState } from 'react';

export type IdleScheduler = {
  schedule: (callback: () => void) => number;
  cancel: (handle: number) => void;
};

const IDLE_TIMEOUT_MS = 1200;
const FALLBACK_DELAY_MS = 200;

export const browserIdleScheduler: IdleScheduler = {
  schedule: (callback) =>
    typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS })
      : window.setTimeout(callback, FALLBACK_DELAY_MS),
  cancel: (handle) => {
    if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
  },
};

/** False until the browser is idle after the first render; lets heavy work wait for first paint. */
export function useIdleReady(scheduler: IdleScheduler = browserIdleScheduler): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handle = scheduler.schedule(() => setIsReady(true));
    return () => scheduler.cancel(handle);
  }, [scheduler]);

  return isReady;
}
