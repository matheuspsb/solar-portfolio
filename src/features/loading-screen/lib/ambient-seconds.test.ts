import { describe, expect, it } from 'vitest';
import { getAmbientSeconds } from './ambient-seconds';
import { toDesignSeconds } from './time-warp';
import { HOLD_REAL_SECONDS } from './timeline';

describe('getAmbientSeconds', () => {
  it('matches the design time while the clock is not held back', () => {
    const clock = { elapsedSeconds: 3, freeSeconds: 3, isReleased: false };
    expect(getAmbientSeconds(clock)).toBeCloseTo(toDesignSeconds(3), 10);
  });

  it('keeps growing while the clock is held, so the planets keep orbiting', () => {
    const held = {
      elapsedSeconds: HOLD_REAL_SECONDS,
      freeSeconds: HOLD_REAL_SECONDS,
      isReleased: false,
    };
    const later = { ...held, freeSeconds: HOLD_REAL_SECONDS + 2 };
    expect(getAmbientSeconds(later)).toBeGreaterThan(getAmbientSeconds(held));
  });

  it('never goes below the design time, even with a free clock behind the elapsed one', () => {
    const clock = { elapsedSeconds: 3, freeSeconds: 1, isReleased: false };
    expect(getAmbientSeconds(clock)).toBeCloseTo(toDesignSeconds(3), 10);
  });
});
