import { useState, useSyncExternalStore } from 'react';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { getSessionStorage, hasSeenLoader, markLoaderSeen } from '@/lib/loader-seen';
import type { SeenStorage } from '@/lib/loader-seen';
import { AnimatedLoader } from './AnimatedLoader';
import { StaticLoader } from './StaticLoader';

type LoadingGateProps = {
  isSceneReady: boolean;
  storage?: SeenStorage | null;
  scheduler?: FrameScheduler;
};

const subscribeToNothing = () => () => undefined;

export function LoadingGate({
  isSceneReady,
  storage = getSessionStorage(),
  scheduler,
}: LoadingGateProps) {
  const hasSeen = useSyncExternalStore(
    subscribeToNothing,
    () => hasSeenLoader(storage),
    () => false,
  );
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isDone, setIsDone] = useState(false);
  if (hasSeen || isDone) return null;

  const finish = () => {
    markLoaderSeen(storage);
    setIsDone(true);
  };

  if (prefersReducedMotion) {
    return <StaticLoader isSceneReady={isSceneReady} onFinish={finish} />;
  }
  return <AnimatedLoader isSceneReady={isSceneReady} onFinish={finish} scheduler={scheduler} />;
}
