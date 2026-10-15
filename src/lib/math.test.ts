import { describe, expect, it } from 'vitest';
import { clamp, mix } from './math';

describe('clamp', () => {
  it.each([
    [5, 0, 10, 5],
    [-3, 0, 10, 0],
    [42, 0, 10, 10],
    [Number.POSITIVE_INFINITY, 0, 10, 10],
    [Number.NEGATIVE_INFINITY, 0, 10, 0],
  ])('keeps %s inside [%s, %s] as %s', (value, minimum, maximum, expected) => {
    expect(clamp(value, minimum, maximum)).toBe(expected);
  });

  it('falls back to the minimum for NaN', () => {
    expect(clamp(Number.NaN, 2, 10)).toBe(2);
  });

  it('collapses to the minimum when the range is inverted', () => {
    expect(clamp(5, 8, 3)).toBe(8);
  });
});

describe('mix', () => {
  it('interpolates linearly between the ends', () => {
    expect(mix(10, 20, 0)).toBe(10);
    expect(mix(10, 20, 1)).toBe(20);
    expect(mix(10, 20, 0.5)).toBe(15);
  });

  it('extrapolates outside [0, 1] instead of clamping', () => {
    expect(mix(0, 10, 2)).toBe(20);
  });
});
