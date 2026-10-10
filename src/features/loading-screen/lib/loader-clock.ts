import { HOLD_REAL_SECONDS, TOTAL_REAL_SECONDS } from './timeline';

export type LoaderClock = {
  elapsedSeconds: number;
  freeSeconds: number;
  isReleased: boolean;
};

export const MAX_FRAME_DELTA_SECONDS = 0.1;
export const MAX_LOADER_SECONDS = 15;

export function createLoaderClock(): LoaderClock {
  return { elapsedSeconds: 0, freeSeconds: 0, isReleased: false };
}

function sanitizeDelta(deltaSeconds: number): number {
  if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return 0;
  return Math.min(deltaSeconds, MAX_FRAME_DELTA_SECONDS);
}

export function advanceLoaderClock(
  clock: LoaderClock,
  deltaSeconds: number,
  isSceneReady: boolean,
): LoaderClock {
  const safeDelta = sanitizeDelta(deltaSeconds);
  const freeSeconds = clock.freeSeconds + safeDelta;
  const isReleased = clock.isReleased || freeSeconds >= MAX_LOADER_SECONDS;
  const ceilingSeconds = isReleased || isSceneReady ? TOTAL_REAL_SECONDS : HOLD_REAL_SECONDS;
  const elapsedSeconds = Math.max(
    clock.elapsedSeconds,
    Math.min(clock.elapsedSeconds + safeDelta, ceilingSeconds),
  );
  return { elapsedSeconds, freeSeconds, isReleased };
}

export function skipLoaderClock(clock: LoaderClock): LoaderClock {
  return {
    ...clock,
    elapsedSeconds: Math.max(clock.elapsedSeconds, HOLD_REAL_SECONDS),
    isReleased: true,
  };
}

export function isLoaderFinished(clock: LoaderClock): boolean {
  return clock.elapsedSeconds >= TOTAL_REAL_SECONDS;
}
