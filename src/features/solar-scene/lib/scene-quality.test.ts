import { describe, expect, it } from 'vitest';
import { getSceneQuality } from './scene-quality';

describe('getSceneQuality', () => {
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
