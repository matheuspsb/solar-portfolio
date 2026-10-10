import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { browserFrameScheduler } from '@/hooks/frame-scheduler';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { chaseTail, getTweenFrame } from './comet-motion';

const FALLBACK_FRAME_MS = 1000 / 60;
const MILLISECONDS_PER_SECOND = 1000;

type Tween = {
  from: number;
  to: number;
  startedAt: number;
  durationMs: number;
  settle: (hasArrived: boolean) => void;
};

type CometPosition = { head: number; tail: number };

type UseCometOptions = {
  initialProgress: number;
  reducedMotion: boolean;
  entry?: { target: number; durationMs: number };
  scheduler?: FrameScheduler;
};

export type CometState = CometPosition & {
  travelTo: (target: number, durationMs: number, from?: number) => Promise<boolean>;
};

export function useComet({
  initialProgress,
  reducedMotion,
  entry,
  scheduler = browserFrameScheduler,
}: UseCometOptions): CometState {
  const [position, setPosition] = useState<CometPosition>({
    head: initialProgress,
    tail: initialProgress,
  });
  const positionRef = useRef(position);
  const tweenRef = useRef<Tween | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const isMountedRef = useRef(false);

  const commit = (next: CometPosition) => {
    positionRef.current = next;
    if (isMountedRef.current) setPosition(next);
  };

  const finishTween = (hasArrived: boolean) => {
    const tween = tweenRef.current;
    tweenRef.current = null;
    tween?.settle(hasArrived);
  };

  const runFrame = (now: number) => {
    frameRef.current = null;
    const previousTime = lastFrameTimeRef.current ?? now - FALLBACK_FRAME_MS;
    lastFrameTimeRef.current = now;

    let head = positionRef.current.head;
    const tween = tweenRef.current;
    if (tween) {
      const frame = getTweenFrame({ ...tween, now });
      head = frame.value;
      if (frame.isFinished) finishTween(true);
    }
    const tail = chaseTail({
      tail: positionRef.current.tail,
      head,
      deltaSeconds: (now - previousTime) / MILLISECONDS_PER_SECOND,
    });
    commit({ head, tail });

    if (tweenRef.current !== null || tail !== head) {
      frameRef.current = scheduler.request(runFrame);
    } else {
      lastFrameTimeRef.current = null;
    }
  };

  const travelTo = (target: number, durationMs: number, from?: number): Promise<boolean> => {
    finishTween(false);
    if (reducedMotion || !(durationMs > 0)) {
      commit({ head: target, tail: target });
      return Promise.resolve(true);
    }
    const startingPoint = from ?? positionRef.current.head;
    if (from !== undefined) commit({ head: from, tail: from });

    return new Promise<boolean>((settle) => {
      tweenRef.current = {
        from: startingPoint,
        to: target,
        startedAt: scheduler.now(),
        durationMs,
        settle,
      };
      if (frameRef.current === null) frameRef.current = scheduler.request(runFrame);
    });
  };

  const settleForReducedMotion = () => {
    const tween = tweenRef.current;
    if (!reducedMotion || !tween) return;
    commit({ head: tween.to, tail: tween.to });
    finishTween(true);
  };

  useEffect(settleForReducedMotion, [reducedMotion]);

  const startEntry = useEffectEvent(() => {
    if (entry) void travelTo(entry.target, entry.durationMs);
  });

  useEffect(() => {
    startEntry();
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (frameRef.current !== null) scheduler.cancel(frameRef.current);
      frameRef.current = null;
      finishTween(false);
    };
  }, [scheduler]);

  return { head: position.head, tail: position.tail, travelTo };
}
