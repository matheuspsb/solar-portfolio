import { describe, expect, it } from 'vitest';
import { clamp01, draw, enter, mix, pop, seg } from './easing';

describe('clamp01', () => {
  it.each([
    [-5, 0],
    [5, 1],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 1],
    [Number.NEGATIVE_INFINITY, 0],
  ])('maps %s to %s', (value, expected) => {
    expect(clamp01(value)).toBe(expected);
  });
});

describe('seg', () => {
  it('stays at the edges outside the window', () => {
    expect(seg(0, 1, 3)).toBe(0);
    expect(seg(9, 1, 3)).toBe(1);
    expect(seg(2, 1, 3)).toBe(0.5);
  });

  it.each([
    [1, 2],
    [3, 2],
  ])('treats an empty window as a step (time %s, edge %s)', (time, edge) => {
    expect(seg(time, edge, edge)).toBe(time >= edge ? 1 : 0);
  });

  it('returns 0 for a NaN time', () => {
    expect(seg(Number.NaN, 0, 1)).toBe(0);
  });
});

describe('easings', () => {
  it.each([
    ['enter', enter],
    ['draw', draw],
    ['pop', pop],
  ])('%s starts at 0 and ends at 1', (_name, easing) => {
    expect(easing(0)).toBe(0);
    expect(easing(1)).toBe(1);
  });

  it('pop overshoots before settling', () => {
    expect(pop(0.8)).toBeGreaterThan(1);
  });
});

describe('mix', () => {
  it('interpolates linearly between the ends', () => {
    expect(mix(10, 20, 0)).toBe(10);
    expect(mix(10, 20, 1)).toBe(20);
    expect(mix(10, 20, 0.5)).toBe(15);
  });
});
