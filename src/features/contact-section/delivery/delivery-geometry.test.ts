import { describe, expect, it } from 'vitest';
import { DELIVERY_SCENE_WIDTH, getStarPositions, getWarpLines } from './delivery-geometry';
import { DELIVERY_HEIGHT } from '../journey/arc-geometry';

describe('getStarPositions', () => {
  it('creates the requested number of stars', () => {
    expect(getStarPositions(34)).toHaveLength(34);
  });

  it('keeps every star inside the scene', () => {
    for (const star of getStarPositions(34)) {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThan(DELIVERY_SCENE_WIDTH);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThan(DELIVERY_HEIGHT);
    }
  });

  it.each([0, -3, Number.NaN])('has no stars for the count %s', (count) => {
    expect(getStarPositions(count)).toEqual([]);
  });
});

describe('getWarpLines', () => {
  it('spreads the lines around the full circle', () => {
    const lines = getWarpLines(22);
    expect(lines).toHaveLength(22);
    const angles = lines.map((line) => line.angleDegrees);
    expect(Math.min(...angles)).toBeLessThan(10);
    expect(Math.max(...angles)).toBeGreaterThan(340);
  });

  it.each([0, -1, Number.NaN])('has no lines for the count %s', (count) => {
    expect(getWarpLines(count)).toEqual([]);
  });
});
