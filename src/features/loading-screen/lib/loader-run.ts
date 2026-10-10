import { getAmbientSeconds } from './ambient-seconds';
import {
  advanceLoaderClock,
  createLoaderClock,
  isLoaderFinished,
  skipLoaderClock,
} from './loader-clock';
import type { LoaderClock } from './loader-clock';
import { getLoaderFrame } from './loader-frame';
import type { LoaderFrame } from './loader-frame';
import { getLoaderProgress } from './loader-progress';
import { toDesignSeconds } from './time-warp';

export type LoaderRunState = {
  clock: LoaderClock;
  percent: number;
};

export type LoaderSignals = {
  isSceneReady: boolean;
};

function withProgress(
  clock: LoaderClock,
  previousPercent: number,
  signals: LoaderSignals,
): LoaderRunState {
  const percent = getLoaderProgress({
    designSeconds: toDesignSeconds(clock.elapsedSeconds),
    isSceneReady: signals.isSceneReady,
    previousPercent,
  });
  return { clock, percent };
}

export function createLoaderRun(): LoaderRunState {
  return { clock: createLoaderClock(), percent: 0 };
}

export function advanceLoaderRun(
  state: LoaderRunState,
  deltaSeconds: number,
  signals: LoaderSignals,
): LoaderRunState {
  const clock = advanceLoaderClock(state.clock, deltaSeconds, signals.isSceneReady);
  return withProgress(clock, state.percent, signals);
}

export function skipLoaderRun(state: LoaderRunState): LoaderRunState {
  return { ...state, clock: skipLoaderClock(state.clock) };
}

export function isLoaderRunFinished(state: LoaderRunState): boolean {
  return isLoaderFinished(state.clock);
}

export function getRunFrame(state: LoaderRunState): LoaderFrame {
  return getLoaderFrame(
    toDesignSeconds(state.clock.elapsedSeconds),
    getAmbientSeconds(state.clock),
  );
}
