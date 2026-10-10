import { describe, expect, it } from 'vitest';
import { getAnimatedPercent, getLoaderProgress } from './loader-progress';
import { DESIGN_CUES } from './timeline';

const FINISHED_DESIGN_SECONDS = DESIGN_CUES.ignition + 5;

function progressFor(overrides: Partial<Parameters<typeof getLoaderProgress>[0]>): number {
  return getLoaderProgress({
    designSeconds: 0,
    isSceneReady: false,
    previousPercent: 0,
    ...overrides,
  });
}

describe('getAnimatedPercent', () => {
  it('goes from 0 to 100 without decreasing', () => {
    expect(getAnimatedPercent(0)).toBe(0);
    expect(getAnimatedPercent(FINISHED_DESIGN_SECONDS)).toBe(100);
    let previous = 0;
    for (let step = 0; step <= 1400; step += 1) {
      const current = getAnimatedPercent(step / 100);
      expect(current).toBeGreaterThanOrEqual(previous);
      previous = current;
    }
  });
});

describe('getLoaderProgress', () => {
  it('stops at 99 while the scene is not ready', () => {
    expect(progressFor({ designSeconds: FINISHED_DESIGN_SECONDS })).toBe(99);
  });

  it('reaches 100 once the animation finished and the scene is ready', () => {
    const percent = progressFor({
      designSeconds: FINISHED_DESIGN_SECONDS,
      isSceneReady: true,
      previousPercent: 99,
    });
    expect(percent).toBe(100);
  });

  it('does not run ahead of the animation when the scene is ready early', () => {
    const middle = DESIGN_CUES.nebula + 0.5;
    expect(progressFor({ designSeconds: middle, isSceneReady: true })).toBe(
      getAnimatedPercent(middle),
    );
  });

  it('never goes below the previous value', () => {
    expect(progressFor({ previousPercent: 80 })).toBe(80);
  });

  it('ignores a NaN previous value', () => {
    expect(progressFor({ previousPercent: Number.NaN })).toBe(0);
  });
});
