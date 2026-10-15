import { describe, expect, it } from 'vitest';
import {
  formatObjectCode,
  getOrbitDelaySeconds,
  getMenuLayout,
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

  it('never puts an item right of or above the anchor, so it stays inside a top-right corner', () => {
    for (const { x, y } of getOrbitPositions({ count: 4, radius: RADIUS })) {
      expect(x).toBeLessThanOrEqual(0);
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
    expect(getOrbitRadius(414)).toBe(200);
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
});

type Box = { left: number; right: number; top: number; bottom: number };

const MODELED_CARD = { width: 144, height: 56, dotOverlap: 9 };
const ANCHOR_FROM_RIGHT = 42;
const TOGGLE_BOX: Box = { left: -148, right: 22, top: -22, bottom: 22 };

const cardBox = ({ x, y }: { x: number; y: number }): Box => ({
  left: x - MODELED_CARD.width + MODELED_CARD.dotOverlap,
  right: x + MODELED_CARD.dotOverlap,
  top: y - MODELED_CARD.height / 2,
  bottom: y + MODELED_CARD.height / 2,
});

const overlaps = (first: Box, second: Box): boolean =>
  first.left < second.right &&
  second.left < first.right &&
  first.top < second.bottom &&
  second.top < first.bottom;

describe('getMenuLayout', () => {
  it('lays the destinations on the orbit when the screen has room for the arc', () => {
    expect(getMenuLayout({ count: 3, viewportWidth: 1280 }).kind).toBe('arc');
    expect(getMenuLayout({ count: 3, viewportWidth: 375 }).kind).toBe('arc');
  });

  it('stacks the destinations in a column under the toggle on narrow phones', () => {
    const layout = getMenuLayout({ count: 3, viewportWidth: 320 });
    expect(layout.kind).toBe('column');
    const xs = layout.positions.map((position) => position.x);
    const ys = layout.positions.map((position) => position.y);
    expect(new Set(xs).size).toBe(1);
    expect(ys).toEqual([...ys].sort((first, second) => first - second));
  });

  it.each([0, Number.NaN])('uses the column before the screen is measured (width %s)', (width) => {
    expect(getMenuLayout({ count: 3, viewportWidth: width }).kind).toBe('column');
  });

  it('has no positions without destinations', () => {
    expect(getMenuLayout({ count: 0, viewportWidth: 1280 }).positions).toEqual([]);
  });

  it.each([320, 340, 360, 374, 375, 390, 414, 768, 1280])(
    'keeps every destination on screen and off the toggle at %spx',
    (width) => {
      for (const count of [1, 2, 3]) {
        for (const box of getMenuLayout({ count, viewportWidth: width }).positions.map(cardBox)) {
          expect(width - ANCHOR_FROM_RIGHT + box.left).toBeGreaterThanOrEqual(0);
          expect(overlaps(box, TOGGLE_BOX)).toBe(false);
        }
      }
    },
  );

  it('leaves a full card of space between destinations in the column', () => {
    const boxes = getMenuLayout({ count: 3, viewportWidth: 320 }).positions.map(cardBox);
    for (const [index, box] of boxes.slice(1).entries()) {
      expect(overlaps(box, boxes[index]!)).toBe(false);
    }
  });
});
