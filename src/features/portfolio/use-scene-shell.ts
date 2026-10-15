import { useState } from 'react';
import { useSceneAvailability } from '@/features/solar-scene';
import type { SceneStatus } from '@/features/solar-scene';
import { uiContent } from '@/content/ui';
import type { IdleScheduler } from '@/hooks/use-idle-ready';
import { createFrameChannel } from '@/lib/screen-frame';

const fallbackMessageByStatus: Record<SceneStatus, string | null> = {
  working: null,
  contextLost: uiContent.sceneFallback.contextLost,
  unavailable: uiContent.sceneFallback.unavailable,
};

type UseSceneShellInput = {
  probeWebGL: () => boolean;
  idleScheduler?: IdleScheduler;
};

export function useSceneShell({ probeWebGL, idleScheduler }: UseSceneShellInput) {
  const availability = useSceneAvailability(probeWebGL, idleScheduler);
  const [frameChannel] = useState(createFrameChannel);
  const [isSceneRevealed, setIsSceneRevealed] = useState(false);

  const isSceneUnavailable = availability.isChecked && availability.status === 'unavailable';

  return {
    availability,
    frameChannel,
    setIsSceneRevealed,
    canMountScene: availability.isChecked && !isSceneUnavailable,
    fallbackMessage: fallbackMessageByStatus[availability.status],
    isSceneReady: isSceneRevealed || isSceneUnavailable,
    retryHandler: availability.canRetry ? availability.retry : undefined,
  };
}
