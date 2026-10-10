import { describe, expect, it } from 'vitest';
import {
  MAX_FRAME_DELTA_SECONDS,
  MAX_LOADER_SECONDS,
  advanceLoaderClock,
  createLoaderClock,
  isLoaderFinished,
  skipLoaderClock,
} from './loader-clock';
import type { LoaderClock } from './loader-clock';
import { HOLD_REAL_SECONDS, TOTAL_REAL_SECONDS } from './timeline';

const FRAME_SECONDS = 1 / 60;

function run(clock: LoaderClock, seconds: number, isSceneReady: boolean): LoaderClock {
  let current = clock;
  const frames = Math.round(seconds / FRAME_SECONDS);
  for (let frame = 0; frame < frames; frame += 1) {
    current = advanceLoaderClock(current, FRAME_SECONDS, isSceneReady);
  }
  return current;
}

describe('advanceLoaderClock', () => {
  it('runs at real speed even when the scene is ready from the start', () => {
    const clock = run(createLoaderClock(), 2, true);
    expect(clock.elapsedSeconds).toBeCloseTo(2, 1);
  });

  it.each([Number.NaN, -1, 0, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'ignores the frame delta %s',
    (delta) => {
      const clock = advanceLoaderClock(createLoaderClock(), delta, true);
      expect(clock.elapsedSeconds).toBe(0);
      expect(clock.freeSeconds).toBe(0);
    },
  );

  it('limits a huge delta from a background tab to one short step', () => {
    const clock = advanceLoaderClock(createLoaderClock(), 600, true);
    expect(clock.elapsedSeconds).toBe(MAX_FRAME_DELTA_SECONDS);
  });

  it('holds before the final stage while the scene is not ready and keeps the free clock running', () => {
    const clock = run(createLoaderClock(), HOLD_REAL_SECONDS + 3, false);
    expect(clock.elapsedSeconds).toBe(HOLD_REAL_SECONDS);
    expect(clock.freeSeconds).toBeCloseTo(HOLD_REAL_SECONDS + 3, 1);
    expect(isLoaderFinished(clock)).toBe(false);
  });

  it('plays the final stage once the scene becomes ready', () => {
    const held = run(createLoaderClock(), HOLD_REAL_SECONDS + 1, false);
    const finished = run(held, TOTAL_REAL_SECONDS - HOLD_REAL_SECONDS + 0.2, true);
    expect(isLoaderFinished(finished)).toBe(true);
  });

  it('never goes past the end', () => {
    const clock = run(createLoaderClock(), TOTAL_REAL_SECONDS + 5, true);
    expect(clock.elapsedSeconds).toBe(TOTAL_REAL_SECONDS);
  });

  it('releases the hold when the safety limit is reached', () => {
    const clock = run(createLoaderClock(), MAX_LOADER_SECONDS + 2, false);
    expect(isLoaderFinished(clock)).toBe(true);
  });

  it('does not release the hold before the safety limit', () => {
    const clock = run(createLoaderClock(), MAX_LOADER_SECONDS - 2, false);
    expect(isLoaderFinished(clock)).toBe(false);
  });
});

describe('skipLoaderClock', () => {
  it('jumps to the final stage and ignores a scene that is not ready', () => {
    const skipped = skipLoaderClock(run(createLoaderClock(), 1, false));
    expect(skipped.elapsedSeconds).toBe(HOLD_REAL_SECONDS);
    const finished = run(skipped, TOTAL_REAL_SECONDS - HOLD_REAL_SECONDS + 0.2, false);
    expect(isLoaderFinished(finished)).toBe(true);
  });

  it('does not move a clock that is already further along', () => {
    const finished = run(createLoaderClock(), TOTAL_REAL_SECONDS + 1, true);
    expect(skipLoaderClock(finished).elapsedSeconds).toBe(TOTAL_REAL_SECONDS);
  });
});
