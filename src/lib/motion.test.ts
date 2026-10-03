// Use case: visitors with prefers-reduced-motion must get no automatic rotation and no long
// camera transitions. If these helpers returned the wrong value, motion-sensitive users could
// get nauseous or the camera would not move at all.
import { describe, expect, it } from 'vitest';
import {
  INSTANT_EASING_RATE,
  getFrameloop,
  getHighlightEasingRate,
  getRotationPeriodForMotion,
  getTransitionSeconds,
} from './motion';

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

describe('getHighlightEasingRate', () => {
  it('eases smoothly when motion is allowed', () => {
    const rate = getHighlightEasingRate(false);
    expect(rate).toBeGreaterThan(0);
    expect(Number.isFinite(rate)).toBe(true);
  });

  it('applies changes instantly when reduced motion is preferred', () => {
    expect(getHighlightEasingRate(true)).toBe(INSTANT_EASING_RATE);
    expect(INSTANT_EASING_RATE).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('getFrameloop', () => {
  it('renders continuously while the Sun is visible and motion is allowed', () => {
    expect(getFrameloop({ prefersReducedMotion: false, isSceneActive: true })).toBe('always');
  });

  it('renders on demand when reduced motion is preferred (nothing moves by itself)', () => {
    expect(getFrameloop({ prefersReducedMotion: true, isSceneActive: true })).toBe('demand');
  });

  it('renders on demand while a panel covers the scene, saving GPU and battery', () => {
    expect(getFrameloop({ prefersReducedMotion: false, isSceneActive: false })).toBe('demand');
  });

  it('renders on demand when both apply', () => {
    expect(getFrameloop({ prefersReducedMotion: true, isSceneActive: false })).toBe('demand');
  });
});
