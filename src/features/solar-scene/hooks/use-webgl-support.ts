import { useSyncExternalStore } from 'react';
import { detectWebGL } from '../lib/webgl-support';

type WebGLSupport = 'unknown' | 'supported' | 'unsupported';

const resultByDetector = new WeakMap<() => boolean, boolean>();

function probeOnce(detect: () => boolean): boolean {
  const cachedResult = resultByDetector.get(detect);
  if (cachedResult !== undefined) return cachedResult;
  const result = detect();
  resultByDetector.set(detect, result);
  return result;
}

const subscribeToNothing = () => () => undefined;

export function useWebGLSupport(
  detect: () => boolean = detectWebGL,
  isEnabled: boolean = true,
): WebGLSupport {
  return useSyncExternalStore(
    subscribeToNothing,
    () => {
      if (!isEnabled) return 'unknown';
      return probeOnce(detect) ? 'supported' : 'unsupported';
    },
    () => 'unknown',
  );
}
