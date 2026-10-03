// Use case: the Sun spins slowly, driven by frame time. Visitors must never see it jump, freeze
// or turn NaN (which would make the mesh vanish). The pure function guards against a tab that
// stayed in background for minutes (huge delta), zero delta, and corrupted inputs.
import { describe, expect, it } from 'vitest';
import { FULL_TURN_RADIANS, MAX_FRAME_DELTA_SECONDS, advanceRotation } from './rotation';

describe('advanceRotation', () => {
  it('advances proportionally to elapsed time', () => {
    // period 1s, delta 0.05s (below the clamp) => 5% of a turn
    const next = advanceRotation({ angle: 0, deltaSeconds: 0.05, periodSeconds: 1 });
    expect(next).toBeCloseTo(FULL_TURN_RADIANS * 0.05);
  });

  it('keeps the angle unchanged when delta is zero', () => {
    expect(advanceRotation({ angle: 1.5, deltaSeconds: 0, periodSeconds: 10 })).toBe(1.5);
  });

  it('wraps the angle into [0, 2π)', () => {
    const next = advanceRotation({
      angle: FULL_TURN_RADIANS - 0.01,
      deltaSeconds: 0.1,
      periodSeconds: 1,
    });
    expect(next).toBeGreaterThanOrEqual(0);
    expect(next).toBeLessThan(FULL_TURN_RADIANS);
  });

  it('clamps a huge delta (background tab) to the maximum frame delta', () => {
    const huge = advanceRotation({ angle: 0, deltaSeconds: 600, periodSeconds: 10 });
    const clamped = advanceRotation({
      angle: 0,
      deltaSeconds: MAX_FRAME_DELTA_SECONDS,
      periodSeconds: 10,
    });
    expect(huge).toBeCloseTo(clamped);
  });

  it.each([-1, Number.NaN, Number.NEGATIVE_INFINITY])(
    'ignores invalid delta %s',
    (deltaSeconds) => {
      expect(advanceRotation({ angle: 2, deltaSeconds, periodSeconds: 10 })).toBe(2);
    },
  );

  it('treats an infinite delta as a clamped frame, not as a freeze or NaN', () => {
    const next = advanceRotation({
      angle: 0,
      deltaSeconds: Number.POSITIVE_INFINITY,
      periodSeconds: 10,
    });
    expect(Number.isFinite(next)).toBe(true);
    expect(next).toBeGreaterThan(0);
  });

  it.each([0, -3, Number.NaN, Number.POSITIVE_INFINITY])(
    'does not rotate with invalid period %s',
    (periodSeconds) => {
      expect(advanceRotation({ angle: 2, deltaSeconds: 0.016, periodSeconds })).toBe(2);
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY])('recovers from a corrupted angle %s', (angle) => {
    const next = advanceRotation({ angle, deltaSeconds: 0.016, periodSeconds: 10 });
    expect(Number.isFinite(next)).toBe(true);
  });

  it('normalizes a negative starting angle', () => {
    const next = advanceRotation({ angle: -1, deltaSeconds: 0, periodSeconds: 10 });
    expect(next).toBeGreaterThanOrEqual(0);
    expect(next).toBeLessThan(FULL_TURN_RADIANS);
  });
});
