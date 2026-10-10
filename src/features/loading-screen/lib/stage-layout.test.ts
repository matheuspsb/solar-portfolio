import { describe, expect, it } from 'vitest';
import { getPixelRatio, getStageScale } from './stage-layout';

describe('getStageScale', () => {
  it('covers the viewport: the larger ratio wins, so a phone in portrait keeps the sun big', () => {
    expect(getStageScale(1920, 1080)).toBe(1);
    expect(getStageScale(390, 844)).toBeCloseTo(844 / 1080, 10);
    expect(getStageScale(3840, 1080)).toBe(2);
  });

  it.each([
    [0, 0],
    [Number.NaN, 600],
    [Number.POSITIVE_INFINITY, 600],
    [-10, -10],
  ])('falls back to a neutral scale for the viewport %s x %s', (width, height) => {
    expect(getStageScale(width, height)).toBe(1);
  });
});

describe('getPixelRatio', () => {
  it.each([
    [0.5, 1],
    [1.5, 1.5],
    [3, 2],
    [Number.NaN, 1],
    [Number.POSITIVE_INFINITY, 1],
  ])('turns the device ratio %s into %s', (deviceRatio, expected) => {
    expect(getPixelRatio(deviceRatio)).toBe(expected);
  });
});
