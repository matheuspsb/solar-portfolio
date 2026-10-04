import { useState } from 'react';
import { detectWebGL } from '@/lib/webgl-support';
import { browserIdleScheduler, useIdleReady } from './use-idle-ready';
import type { IdleScheduler } from './use-idle-ready';
import { useWebGLSupport } from './use-webgl-support';

export type SceneStatus = 'working' | 'contextLost' | 'unavailable';

type SceneAvailability = {
  status: SceneStatus;
  /** False until the WebGL probe has run (it waits for the browser to be idle). */
  isChecked: boolean;
  /** Retrying only helps when WebGL exists; without it the scene can never run. */
  canRetry: boolean;
  /** Pass to the error boundary so a retry remounts the scene. */
  resetKey: number;
  markCrashed: () => void;
  markContextLost: () => void;
  markContextRestored: () => void;
  retry: () => void;
};

function resolveStatus(
  hasWebGL: boolean,
  hasCrashed: boolean,
  isContextLost: boolean,
): SceneStatus {
  if (!hasWebGL || hasCrashed) return 'unavailable';
  return isContextLost ? 'contextLost' : 'working';
}

export function useSceneAvailability(
  probeWebGL: () => boolean = detectWebGL,
  scheduler: IdleScheduler = browserIdleScheduler,
): SceneAvailability {
  const isIdle = useIdleReady(scheduler);
  const webGLSupport = useWebGLSupport(probeWebGL, isIdle);
  const [hasCrashed, setHasCrashed] = useState(false);
  const [isContextLost, setIsContextLost] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const hasWebGL = webGLSupport !== 'unsupported';

  return {
    status: resolveStatus(hasWebGL, hasCrashed, isContextLost),
    isChecked: webGLSupport !== 'unknown',
    canRetry: hasWebGL,
    resetKey,
    markCrashed: () => setHasCrashed(true),
    markContextLost: () => setIsContextLost(true),
    markContextRestored: () => setIsContextLost(false),
    retry: () => {
      setHasCrashed(false);
      setIsContextLost(false);
      setResetKey((previousKey) => previousKey + 1);
    },
  };
}
