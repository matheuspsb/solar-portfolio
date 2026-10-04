// Use case: phones must not render as many stars/pixels as a desktop, or the scene stutters
// and drains battery. Bad viewport values (0 while the layout is not measured yet, NaN) must
// fall back to the cheapest tier instead of crashing or picking the expensive one.
import { describe, expect, it } from 'vitest';
import { getSceneQuality } from './scene-quality';

describe('getSceneQuality', () => {
  it('gives the highest tier to desktop widths', () => {
    expect(getSceneQuality(1440).tier).toBe('high');
  });

  it('gives a medium tier to tablets', () => {
    expect(getSceneQuality(820).tier).toBe('medium');
  });

  it('gives the low tier to phones', () => {
    expect(getSceneQuality(375).tier).toBe('low');
  });

  it('renders fewer stars and lower pixel ratio as the tier drops', () => {
    const high = getSceneQuality(1920);
    const low = getSceneQuality(360);
    expect(low.starCount).toBeLessThan(high.starCount);
    expect(low.maxPixelRatio).toBeLessThan(high.maxPixelRatio);
  });

  it('never exceeds a pixel ratio of 2', () => {
    expect(getSceneQuality(3840).maxPixelRatio).toBeLessThanOrEqual(2);
  });

  it.each([0, -100, Number.NaN])('falls back to the low tier for width %s', (width) => {
    expect(getSceneQuality(width).tier).toBe('low');
  });

  it('treats an infinite width as the highest tier without breaking', () => {
    expect(getSceneQuality(Number.POSITIVE_INFINITY).tier).toBe('high');
  });
});
