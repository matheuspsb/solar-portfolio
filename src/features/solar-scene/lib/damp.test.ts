import { describe, expect, it } from 'vitest';
import { dampValue } from './damp';

describe('dampValue', () => {
  it('moves toward the target without overshooting', () => {
    const next = dampValue({ current: 1, target: 2, rate: 8, deltaSeconds: 0.016 });
    expect(next).toBeGreaterThan(1);
    expect(next).toBeLessThan(2);
  });

  it('is frame-rate independent: two half steps equal one full step', () => {
    const full = dampValue({ current: 0, target: 1, rate: 6, deltaSeconds: 0.2 });
    const half = dampValue({ current: 0, target: 1, rate: 6, deltaSeconds: 0.1 });
    const twice = dampValue({ current: half, target: 1, rate: 6, deltaSeconds: 0.1 });
    expect(twice).toBeCloseTo(full, 6);
  });

  it('stays put when delta is zero', () => {
    expect(dampValue({ current: 1.5, target: 3, rate: 5, deltaSeconds: 0 })).toBe(1.5);
  });

  it('snaps to the target when the rate is infinite (reduced motion)', () => {
    expect(
      dampValue({ current: 1, target: 2, rate: Number.POSITIVE_INFINITY, deltaSeconds: 0.016 }),
    ).toBe(2);
  });

  it('snaps to the target for a huge delta', () => {
    expect(dampValue({ current: 1, target: 2, rate: 8, deltaSeconds: 600 })).toBeCloseTo(2, 6);
  });

  it.each([-1, Number.NaN])('keeps the current value for invalid delta %s', (deltaSeconds) => {
    expect(dampValue({ current: 1.2, target: 2, rate: 8, deltaSeconds })).toBe(1.2);
  });

  it('keeps the current value for an invalid rate', () => {
    expect(dampValue({ current: 1.2, target: 2, rate: Number.NaN, deltaSeconds: 0.1 })).toBe(1.2);
    expect(dampValue({ current: 1.2, target: 2, rate: -3, deltaSeconds: 0.1 })).toBe(1.2);
  });

  it('recovers from a corrupted current value by jumping to the target', () => {
    expect(dampValue({ current: Number.NaN, target: 2, rate: 8, deltaSeconds: 0.1 })).toBe(2);
  });
});
