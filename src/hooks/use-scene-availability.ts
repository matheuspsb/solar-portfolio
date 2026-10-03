import { useState } from 'react';
import { detectWebGL } from '@/lib/webgl-support';
import { useWebGLSupport } from './use-webgl-support';

export type SceneStatus = 'working' | 'contextLost' | 'unavailable';

export type SceneAvailability = {
  status: SceneStatus;
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

export function useSceneAvailability(probeWebGL: () => boolean = detectWebGL): SceneAvailability {
  const webGLSupport = useWebGLSupport(probeWebGL);
  const [hasCrashed, setHasCrashed] = useState(false);
  const [isContextLost, setIsContextLost] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const hasWebGL = webGLSupport !== 'unsupported';

  return {
    status: resolveStatus(hasWebGL, hasCrashed, isContextLost),
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
