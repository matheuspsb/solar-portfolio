import { browserFrameScheduler } from '@/hooks/frame-scheduler';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { chaseTail, getTweenFrame } from './comet-motion';
import type { CometStore } from './comet-store';

const FALLBACK_FRAME_MS = 1000 / 60;
const MILLISECONDS_PER_SECOND = 1000;

type Tween = {
  from: number;
  to: number;
  startedAt: number;
  durationMs: number;
  settle: (hasArrived: boolean) => void;
};

type CometEngineOptions = {
  store: CometStore;
  scheduler?: FrameScheduler;
  isReducedMotion: boolean;
};

export type CometEngine = {
  travelTo: (target: number, durationMs: number, from?: number) => Promise<boolean>;
  setReducedMotion: (isReducedMotion: boolean) => void;
  dispose: () => void;
};

export function createCometEngine({
  store,
  scheduler = browserFrameScheduler,
  isReducedMotion: initialReducedMotion,
}: CometEngineOptions): CometEngine {
  let isReducedMotion = initialReducedMotion;
  let tween: Tween | null = null;
  let frameHandle: number | null = null;
  let lastFrameTime: number | null = null;

  const finishTween = (hasArrived: boolean) => {
    const finished = tween;
    tween = null;
    finished?.settle(hasArrived);
  };

  const runFrame = (now: number) => {
    frameHandle = null;
    const previousTime = lastFrameTime ?? now - FALLBACK_FRAME_MS;
    lastFrameTime = now;

    let head = store.getSnapshot().head;
    if (tween) {
      const frame = getTweenFrame({ ...tween, now });
      head = frame.value;
      if (frame.isFinished) finishTween(true);
    }
    const tail = chaseTail({
      tail: store.getSnapshot().tail,
      head,
      deltaSeconds: (now - previousTime) / MILLISECONDS_PER_SECOND,
    });
    store.set({ head, tail });

    if (tween !== null || tail !== head) {
      frameHandle = scheduler.request(runFrame);
    } else {
      lastFrameTime = null;
    }
  };

  const travelTo = (target: number, durationMs: number, from?: number): Promise<boolean> => {
    finishTween(false);
    if (isReducedMotion || !(durationMs > 0)) {
      store.set({ head: target, tail: target });
      return Promise.resolve(true);
    }
    const startingPoint = from ?? store.getSnapshot().head;
    if (from !== undefined) store.set({ head: from, tail: from });

    return new Promise<boolean>((settle) => {
      tween = { from: startingPoint, to: target, startedAt: scheduler.now(), durationMs, settle };
      if (frameHandle === null) frameHandle = scheduler.request(runFrame);
    });
  };

  const setReducedMotion = (next: boolean) => {
    isReducedMotion = next;
    if (!next || !tween) return;
    store.set({ head: tween.to, tail: tween.to });
    finishTween(true);
  };

  const dispose = () => {
    if (frameHandle !== null) scheduler.cancel(frameHandle);
    frameHandle = null;
    finishTween(false);
  };

  return { travelTo, setReducedMotion, dispose };
}
