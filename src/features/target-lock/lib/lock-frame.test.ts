import { describe, expect, it } from 'vitest';
import { getCornerSize } from './lock-frame';

describe('getCornerSize', () => {
  it('never goes below the small bracket or above the large one', () => {
    expect(getCornerSize(2)).toBe(14);
    expect(getCornerSize(5000)).toBe(20);
  });

  it.each([Number.NaN, -10])('falls back to the small bracket for the radius %s', (radius) => {
    expect(getCornerSize(radius)).toBe(14);
  });
});
