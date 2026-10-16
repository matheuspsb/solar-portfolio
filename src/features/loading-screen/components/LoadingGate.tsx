import { useEffect, useEffectEvent, useState, useSyncExternalStore } from 'react';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { hasSeenLoader, markLoaderSeen } from '@/lib/loader-seen';
import { getSessionStorage } from '@/lib/safe-storage';
import type { SeenStorage } from '@/lib/loader-seen';
import { AnimatedLoader } from './AnimatedLoader';
import { StaticLoader } from './StaticLoader';

type LoadingGateProps = {
  isSceneReady: boolean;
  onActiveChange?: (isActive: boolean) => void;
  storage?: SeenStorage | null;
  scheduler?: FrameScheduler;
};

const subscribeToNothing = () => () => undefined;

export function LoadingGate({
  isSceneReady,
  onActiveChange,
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
  const isActive = !hasSeen && !isDone;
  const reportActive = useEffectEvent((active: boolean) => onActiveChange?.(active));
  useEffect(() => {
    reportActive(isActive);
  }, [isActive]);

  if (!isActive) return null;

  const finish = () => {
    markLoaderSeen(storage);
    setIsDone(true);
  };

  if (prefersReducedMotion) {
    return <StaticLoader isSceneReady={isSceneReady} onFinish={finish} />;
  }
  return <AnimatedLoader isSceneReady={isSceneReady} onFinish={finish} scheduler={scheduler} />;
}
