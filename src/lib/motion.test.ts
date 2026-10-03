// Use case: visitors with prefers-reduced-motion must get no automatic rotation and no long
// camera transitions. If these helpers returned the wrong value, motion-sensitive users could
// get nauseous or the camera would not move at all.
import { describe, expect, it } from 'vitest';
import { getRotationPeriodForMotion, getTransitionSeconds } from './motion';

describe('getTransitionSeconds', () => {
  it('returns the base duration when motion is allowed', () => {
    expect(getTransitionSeconds(1.2, false)).toBe(1.2);
  });

  it('returns zero when reduced motion is preferred', () => {
    expect(getTransitionSeconds(1.2, true)).toBe(0);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    'never returns an invalid duration for base %s',
    (base) => {
      expect(getTransitionSeconds(base, false)).toBe(0);
    },
  );
});

describe('getRotationPeriodForMotion', () => {
  it('keeps the period when motion is allowed', () => {
    expect(getRotationPeriodForMotion(180, false)).toBe(180);
  });

  it('returns null (no automatic rotation) when reduced motion is preferred', () => {
    expect(getRotationPeriodForMotion(180, true)).toBeNull();
  });
});
