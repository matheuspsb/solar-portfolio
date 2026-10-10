import { useEffect, useEffectEvent, useState } from 'react';
import { getLoaderFrame } from '../lib/loader-frame';
import { getLoaderProgress } from '../lib/loader-progress';
import { DESIGN_CUES } from '../lib/timeline';
import { LoaderOverlay } from './LoaderOverlay';

const STATIC_DESIGN_SECONDS = DESIGN_CUES.orbits + 2.5;
const STATIC_FRAME = getLoaderFrame(STATIC_DESIGN_SECONDS, STATIC_DESIGN_SECONDS);

type StaticLoaderProps = {
  isSceneReady: boolean;
  onFinish: () => void;
};

export function StaticLoader({ isSceneReady, onFinish }: StaticLoaderProps) {
  const [isSkipped, setIsSkipped] = useState(false);
  const notifyFinish = useEffectEvent(onFinish);
  const isFinished = isSkipped || isSceneReady;
  const percent = getLoaderProgress({
    designSeconds: STATIC_DESIGN_SECONDS,
    isSceneReady,
    previousPercent: 0,
  });

  useEffect(() => {
    if (isFinished) notifyFinish();
  }, [isFinished]);

  return (
    <LoaderOverlay
      frame={STATIC_FRAME}
      percent={percent}
      isSceneReady={isSceneReady}
      onSkip={() => setIsSkipped(true)}
    />
  );
}
