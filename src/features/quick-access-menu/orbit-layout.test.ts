// Use case: the quick-access destinations sit on an arc around the menu button's planet. The
// angles decide whether a label lands on screen or off its edge, so the placement must be exact for
// one item (today's case) and spread evenly for many (future planets); bad input must never produce
// NaN coordinates that would throw an item out of the page.
import { describe, expect, it } from 'vitest';
import {
  formatObjectCode,
  getOrbitDelaySeconds,
  getOrbitPositions,
  getOrbitRadius,
} from './orbit-layout';

const RADIUS = 200;

describe('getOrbitPositions', () => {
  it('places a single item at 138 degrees', () => {
    expect(getOrbitPositions({ count: 1, radius: RADIUS })).toEqual([{ x: -149, y: 134 }]);
  });

  it('spreads several items from 100 to 170 degrees, first to last', () => {
    const positions = getOrbitPositions({ count: 3, radius: RADIUS });
    expect(positions).toHaveLength(3);
    expect(positions[0]).toEqual({ x: -35, y: 197 });
    expect(positions[2]).toEqual({ x: -197, y: 35 });
  });

  it('keeps every item on the circle', () => {
    for (const { x, y } of getOrbitPositions({ count: 5, radius: RADIUS })) {
      // Positions are rounded to whole pixels, so allow one pixel of error.
      expect(Math.abs(Math.hypot(x, y) - RADIUS)).toBeLessThanOrEqual(1);
    }
  });

  it('puts every item on the lower-left of the anchor, so it stays inside a top-right corner', () => {
    for (const { x, y } of getOrbitPositions({ count: 4, radius: RADIUS })) {
      expect(x).toBeLessThan(0);
      expect(y).toBeGreaterThan(0);
    }
  });

  it('scales with the radius', () => {
    const small = getOrbitPositions({ count: 1, radius: 100 })[0]!;
    const large = getOrbitPositions({ count: 1, radius: 200 })[0]!;
    expect(Math.abs(large.x - small.x * 2)).toBeLessThanOrEqual(1);
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
  it('starts at 0.1 s and staggers each item by 0.08 s', () => {
    expect(getOrbitDelaySeconds(0)).toBeCloseTo(0.1);
    expect(getOrbitDelaySeconds(1)).toBeCloseTo(0.18);
    expect(getOrbitDelaySeconds(3)).toBeCloseTo(0.34);
  });

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

  it('is the full radius for an infinite width', () => {
    expect(getOrbitRadius(Number.POSITIVE_INFINITY)).toBe(200);
  });

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
