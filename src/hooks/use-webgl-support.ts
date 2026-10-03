import { useSyncExternalStore } from 'react';
import { detectWebGL } from '@/lib/webgl-support';

export type WebGLSupport = 'unknown' | 'supported' | 'unsupported';

const resultByDetector = new WeakMap<() => boolean, boolean>();

function probeOnce(detect: () => boolean): boolean {
  const cachedResult = resultByDetector.get(detect);
  if (cachedResult !== undefined) return cachedResult;
  const result = detect();
  resultByDetector.set(detect, result);
  return result;
}

const subscribeToNothing = () => () => undefined;

/** `unknown` on the server and during hydration; the real probe result in the browser. */
export function useWebGLSupport(detect: () => boolean = detectWebGL): WebGLSupport {
  return useSyncExternalStore(
    subscribeToNothing,
    () => (probeOnce(detect) ? 'supported' : 'unsupported'),
    () => 'unknown',
  );
}
