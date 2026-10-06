import { describe, expect, it } from 'vitest';
import {
  INSTANT_EASING_RATE,
  getFrameloop,
  getHighlightEasingRate,
  getRotationPeriodForMotion,
  getTransitionRate,
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
  it('returns null (no automatic rotation) when reduced motion is preferred', () => {
    expect(getRotationPeriodForMotion(180, true)).toBeNull();
  });
});

describe('getHighlightEasingRate', () => {
  it('applies changes instantly when reduced motion is preferred', () => {
    expect(getHighlightEasingRate(true)).toBe(INSTANT_EASING_RATE);
    expect(INSTANT_EASING_RATE).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('getFrameloop', () => {
  it('renders continuously while motion is allowed, even with a panel open (planets keep orbiting)', () => {
    expect(getFrameloop(false)).toBe('always');
  });

  it('renders on demand when reduced motion is preferred (nothing moves by itself)', () => {
    expect(getFrameloop(true)).toBe('demand');
  });
});

describe('getTransitionRate', () => {
  it('is faster for shorter transitions', () => {
    expect(getTransitionRate(0.3)).toBeGreaterThan(getTransitionRate(1.2));
  });

  it('is instant for a zero-length transition (reduced motion)', () => {
    expect(getTransitionRate(0)).toBe(INSTANT_EASING_RATE);
  });

  it.each([-1, Number.NaN])('is instant for invalid duration %s', (seconds) => {
    expect(getTransitionRate(seconds)).toBe(INSTANT_EASING_RATE);
  });
});
