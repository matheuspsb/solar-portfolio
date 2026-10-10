import { describe, expect, it } from 'vitest';
import {
  advanceLoaderRun,
  createLoaderRun,
  isLoaderRunFinished,
  skipLoaderRun,
} from './loader-run';
import type { LoaderRunState } from './loader-run';
import { HOLD_REAL_SECONDS, TOTAL_REAL_SECONDS } from './timeline';

const FRAME_SECONDS = 1 / 60;

type Signals = { isSceneReady: boolean };

function play(state: LoaderRunState, seconds: number, signals: Signals): LoaderRunState {
  let current = state;
  for (let frame = 0; frame < Math.round(seconds / FRAME_SECONDS); frame += 1) {
    current = advanceLoaderRun(current, FRAME_SECONDS, signals);
  }
  return current;
}

describe('advanceLoaderRun', () => {
  it('never lowers the percentage, even if the scene stops being ready', () => {
    const ready = play(createLoaderRun(), 3, { isSceneReady: true });
    const dropped = advanceLoaderRun(ready, FRAME_SECONDS, { isSceneReady: false });
    expect(dropped.percent).toBeGreaterThanOrEqual(ready.percent);
  });

  it('keeps the percentage under 100 while waiting for the scene, then completes', () => {
    const waiting = play(createLoaderRun(), HOLD_REAL_SECONDS + 2, { isSceneReady: false });
    expect(waiting.percent).toBe(99);
    expect(isLoaderRunFinished(waiting)).toBe(false);

    const done = play(waiting, TOTAL_REAL_SECONDS - HOLD_REAL_SECONDS + 0.2, {
      isSceneReady: true,
    });
    expect(done.percent).toBe(100);
    expect(isLoaderRunFinished(done)).toBe(true);
  });

  it('plays the whole animation even when the scene is ready from the first frame', () => {
    const early = play(createLoaderRun(), 2, { isSceneReady: true });
    expect(isLoaderRunFinished(early)).toBe(false);
  });
});

describe('skipLoaderRun', () => {
  it('jumps to the final stage and still finishes without waiting for the scene', () => {
    const skipped = skipLoaderRun(createLoaderRun());
    const done = play(skipped, TOTAL_REAL_SECONDS - HOLD_REAL_SECONDS + 0.2, {
      isSceneReady: false,
    });
    expect(isLoaderRunFinished(done)).toBe(true);
  });
});
