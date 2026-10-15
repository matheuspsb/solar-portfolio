import { describe, expect, it } from 'vitest';
import { getDroneBounds, getPixelScale } from './play-field';

describe('getPixelScale', () => {
  it('uses bigger pixels on wide screens and smaller ones on narrow screens', () => {
    expect(getPixelScale(1080)).toBe(4);
    expect(getPixelScale(560)).toBe(4);
    expect(getPixelScale(559)).toBe(3);
    expect(getPixelScale(320)).toBe(3);
  });

  it.each([0, -10, Number.NaN])('falls back to the small pixels for the width %s', (width) => {
    expect(getPixelScale(width)).toBe(3);
  });
});

describe('getDroneBounds', () => {
  it('keeps the drone away from the side edges and out of the top 14% of the screen', () => {
    const bounds = getDroneBounds({ width: 1000, height: 600 });
    expect(bounds.minimumX).toBeCloseTo(18);
    expect(bounds.maximumX).toBeCloseTo(982);
    expect(bounds.minimumY).toBeCloseTo(84);
    expect(bounds.maximumY).toBeCloseTo(582);
  });

  it('shrinks the margin with the pixel scale on narrow screens', () => {
    const bounds = getDroneBounds({ width: 400, height: 600 });
    expect(bounds.minimumX).toBeCloseTo(13.5);
    expect(bounds.maximumX).toBeCloseTo(386.5);
  });

  it('collapses to the center when the field is narrower than the drone', () => {
    const bounds = getDroneBounds({ width: 10, height: 600 });
    expect(bounds.minimumX).toBe(5);
    expect(bounds.maximumX).toBe(5);
  });

  it('collapses to the top limit when the field is shorter than the drone area', () => {
    const bounds = getDroneBounds({ width: 1000, height: 10 });
    expect(bounds.minimumY).toBe(bounds.maximumY);
  });
});
