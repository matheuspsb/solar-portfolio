import { describe, expect, it } from 'vitest';
import {
  formatObjectCode,
  getOrbitDelaySeconds,
  getOrbitPositions,
  getOrbitRadius,
} from './orbit-layout';

const RADIUS = 200;

describe('getOrbitPositions', () => {
  it('keeps every item on the circle', () => {
    for (const { x, y } of getOrbitPositions({ count: 5, radius: RADIUS })) {
      expect(Math.abs(Math.hypot(x, y) - RADIUS)).toBeLessThanOrEqual(1);
    }
  });

  it('puts every item on the lower-left of the anchor, so it stays inside a top-right corner', () => {
    for (const { x, y } of getOrbitPositions({ count: 4, radius: RADIUS })) {
      expect(x).toBeLessThan(0);
      expect(y).toBeGreaterThan(0);
    }
  });

  it.each([0, -2, Number.NaN])('returns no positions for count %s', (count) => {
    expect(getOrbitPositions({ count, radius: RADIUS })).toEqual([]);
  });

  it.each([0, -50, Number.NaN, Number.POSITIVE_INFINITY])(
    'collapses everything onto the anchor for radius %s',
    (radius) => {
      expect(getOrbitPositions({ count: 2, radius })).toEqual([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ]);
    },
  );

  it('floors a fractional count', () => {
    expect(getOrbitPositions({ count: 2.9, radius: RADIUS })).toHaveLength(2);
  });
});

describe('getOrbitDelaySeconds', () => {
  it.each([-1, Number.NaN])('never delays by a negative or invalid amount (%s)', (index) => {
    expect(getOrbitDelaySeconds(index)).toBeCloseTo(0.1);
  });
});

describe('formatObjectCode', () => {
  it('numbers destinations from OBJ-001, zero padded', () => {
    expect(formatObjectCode(0)).toBe('OBJ-001');
    expect(formatObjectCode(8)).toBe('OBJ-009');
    expect(formatObjectCode(11)).toBe('OBJ-012');
  });

  it('does not truncate beyond three digits', () => {
    expect(formatObjectCode(999)).toBe('OBJ-1000');
  });

  it.each([-5, Number.NaN, Number.POSITIVE_INFINITY])('falls back to OBJ-001 for %s', (index) => {
    expect(formatObjectCode(index)).toBe('OBJ-001');
  });
});

describe('getOrbitRadius', () => {
  it('uses the full radius on screens wide enough for the whole arc', () => {
    expect(getOrbitRadius(1280)).toBe(200);
    expect(getOrbitRadius(390)).toBe(200);
  });

  it('shrinks on narrow phones so the left-most label stays on screen', () => {
    expect(getOrbitRadius(360)).toBeLessThan(200);
    expect(getOrbitRadius(320)).toBeLessThan(getOrbitRadius(360));
  });

  it('keeps a minimum radius so items never pile on the toggle', () => {
    expect(getOrbitRadius(200)).toBe(getOrbitRadius(100));
    expect(getOrbitRadius(100)).toBeGreaterThan(0);
  });

  it.each([0, -50, Number.NaN])(
    'falls back to the minimum for width %s (before measuring)',
    (width) => {
      expect(getOrbitRadius(width)).toBe(getOrbitRadius(100));
    },
  );

  it('keeps the farthest label inside the screen for any phone width', () => {
    const labelAndMargin = 137;
    const anchorFromRight = 42;
    for (const width of [320, 340, 360, 375, 390]) {
      const farthest = getOrbitPositions({ count: 2, radius: getOrbitRadius(width) })[1]!;
      const leftEdge = width - anchorFromRight + farthest.x - labelAndMargin;
      expect(leftEdge).toBeGreaterThanOrEqual(0);
    }
  });
});
