import { useEffect, useEffectEvent, useState } from 'react';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { createCometEngine } from './comet-engine';
import { createCometStore } from './comet-store';
import type { CometStore } from './comet-store';

type UseCometOptions = {
  initialProgress: number;
  reducedMotion: boolean;
  entry?: { target: number; durationMs: number };
  scheduler?: FrameScheduler;
};

export type CometState = {
  position: CometStore;
  travelTo: (target: number, durationMs: number, from?: number) => Promise<boolean>;
};

export function useComet({
  initialProgress,
  reducedMotion,
  entry,
  scheduler,
}: UseCometOptions): CometState {
  const [position] = useState(() =>
    createCometStore({ head: initialProgress, tail: initialProgress }),
  );
  const [engine] = useState(() =>
    createCometEngine({ store: position, scheduler, isReducedMotion: reducedMotion }),
  );

  useEffect(() => engine.setReducedMotion(reducedMotion), [engine, reducedMotion]);

  const startEntry = useEffectEvent(() => {
    if (entry) void engine.travelTo(entry.target, entry.durationMs);
  });

  useEffect(() => {
    startEntry();
  }, []);

  useEffect(() => () => engine.dispose(), [engine]);

  return { position, travelTo: engine.travelTo };
}
