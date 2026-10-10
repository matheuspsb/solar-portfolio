import { useEffect, useEffectEvent } from 'react';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { useLoaderRun } from '../hooks/use-loader-run';
import { LoaderOverlay } from './LoaderOverlay';

type AnimatedLoaderProps = {
  isSceneReady: boolean;
  onFinish: () => void;
  scheduler?: FrameScheduler;
};

export function AnimatedLoader({ isSceneReady, onFinish, scheduler }: AnimatedLoaderProps) {
  const run = useLoaderRun({ isSceneReady, scheduler });
  const notifyFinish = useEffectEvent(onFinish);

  useEffect(() => {
    if (run.isFinished) notifyFinish();
  }, [run.isFinished]);

  return (
    <LoaderOverlay
      frame={run.frame}
      percent={run.percent}
      isSceneReady={isSceneReady}
      onSkip={run.skip}
    />
  );
}
