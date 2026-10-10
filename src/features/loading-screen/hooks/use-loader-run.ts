import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { browserFrameScheduler } from '@/hooks/frame-scheduler';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import type { LoaderFrame } from '../lib/loader-frame';
import {
  advanceLoaderRun,
  createLoaderRun,
  getRunFrame,
  isLoaderRunFinished,
  skipLoaderRun,
} from '../lib/loader-run';

const MILLISECONDS_PER_SECOND = 1000;

type UseLoaderRunOptions = {
  isSceneReady: boolean;
  scheduler?: FrameScheduler;
};

export type LoaderRun = {
  frame: LoaderFrame;
  percent: number;
  isFinished: boolean;
  skip: () => void;
};

export function useLoaderRun({
  isSceneReady,
  scheduler = browserFrameScheduler,
}: UseLoaderRunOptions): LoaderRun {
  const [state, setState] = useState(createLoaderRun);
  const stateRef = useRef(state);
  const readSignals = useEffectEvent(() => ({ isSceneReady }));

  useEffect(() => {
    let handle = 0;
    let previousMs = scheduler.now();

    const tick = (nowMs: number) => {
      const deltaSeconds = (nowMs - previousMs) / MILLISECONDS_PER_SECOND;
      previousMs = nowMs;
      const next = advanceLoaderRun(stateRef.current, deltaSeconds, readSignals());
      stateRef.current = next;
      setState(next);
      if (!isLoaderRunFinished(next)) handle = scheduler.request(tick);
    };

    handle = scheduler.request(tick);
    return () => scheduler.cancel(handle);
  }, [scheduler]);

  const skip = () => {
    stateRef.current = skipLoaderRun(stateRef.current);
    setState(stateRef.current);
  };

  return {
    frame: getRunFrame(state),
    percent: state.percent,
    isFinished: isLoaderRunFinished(state),
    skip,
  };
}
