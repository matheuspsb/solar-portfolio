import { useEffect, useReducer, useState } from 'react';
import { browserFrameScheduler } from '@/hooks/frame-scheduler';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import type { NavigationDirection } from '@/lib/circular-navigation';
import { arcadeFlowReducer, createArcadeFlow } from './arcade-flow';
import type { ArcadeFlow } from './arcade-flow';
import { getBootProgress } from './boot-timeline';
import type { BootProgress } from './boot-timeline';
import type { CartridgeId } from './cartridges';

export const REJECTION_VISIBLE_MS = 1100;

const MILLISECONDS_PER_SECOND = 1000;

type UseArcadeFlowOptions = {
  isRootUnlocked: boolean;
  scheduler?: FrameScheduler;
};

type ArcadeFlowApi = {
  flow: ArcadeFlow;
  bootProgress: BootProgress;
  finishBoot: () => void;
  select: (id: CartridgeId) => void;
  move: (direction: NavigationDirection) => void;
  insert: (id: CartridgeId) => void;
  leaveGame: () => void;
};

const BOOT_START = getBootProgress(0);

function isSameProgress(first: BootProgress, second: BootProgress): boolean {
  return (
    first.visibleLines === second.visibleLines &&
    first.isTitleVisible === second.isTitleVisible &&
    first.isDone === second.isDone
  );
}

export function useArcadeFlow({
  isRootUnlocked,
  scheduler = browserFrameScheduler,
}: UseArcadeFlowOptions): ArcadeFlowApi {
  const [flow, dispatch] = useReducer(arcadeFlowReducer, undefined, createArcadeFlow);
  const [bootProgress, setBootProgress] = useState(BOOT_START);
  const isBooting = flow.screen === 'boot';

  useEffect(() => {
    if (!isBooting) return;
    const startMs = scheduler.now();
    let handle = 0;

    const tick = (nowMs: number) => {
      const progress = getBootProgress((nowMs - startMs) / MILLISECONDS_PER_SECOND);
      setBootProgress((previous) => (isSameProgress(previous, progress) ? previous : progress));
      if (progress.isDone) dispatch({ type: 'finishBoot' });
      else handle = scheduler.request(tick);
    };

    handle = scheduler.request(tick);
    return () => scheduler.cancel(handle);
  }, [isBooting, scheduler]);

  const { rejection } = flow;
  useEffect(() => {
    if (rejection === null) return;
    const timer = setTimeout(() => dispatch({ type: 'clearRejection' }), REJECTION_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [rejection]);

  return {
    flow,
    bootProgress,
    finishBoot: () => dispatch({ type: 'finishBoot' }),
    select: (id) => dispatch({ type: 'select', id }),
    move: (direction) => dispatch({ type: 'move', direction }),
    insert: (id) => dispatch({ type: 'insert', id, isRootUnlocked }),
    leaveGame: () => dispatch({ type: 'leaveGame' }),
  };
}
