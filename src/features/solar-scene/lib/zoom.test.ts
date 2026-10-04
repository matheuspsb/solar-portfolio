import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MAX_ZOOM_DISTANCE,
  getMaxZoomDistance,
  getZoomKeyDirection,
  getZoomedDistance,
} from './zoom';

const limits = { minDistance: 5, maxDistance: 20 };

describe('getZoomKeyDirection', () => {
  it.each(['+', '='])('maps %s to zooming in', (key) => {
    expect(getZoomKeyDirection(key)).toBe('in');
  });

  it.each(['-', '_'])('maps %s to zooming out', (key) => {
    expect(getZoomKeyDirection(key)).toBe('out');
  });

  it.each(['a', 'Enter', 'ArrowUp', '', '++'])('ignores %j', (key) => {
    expect(getZoomKeyDirection(key)).toBeNull();
  });
});

describe('getZoomedDistance', () => {
  it('moves closer when zooming in', () => {
    expect(getZoomedDistance({ ...limits, current: 10, direction: 'in' })).toBeLessThan(10);
  });

  it('moves away when zooming out', () => {
    expect(getZoomedDistance({ ...limits, current: 10, direction: 'out' })).toBeGreaterThan(10);
  });

  it('zooming in then out returns to the same distance', () => {
    const closer = getZoomedDistance({ ...limits, current: 10, direction: 'in' });
    expect(getZoomedDistance({ ...limits, current: closer, direction: 'out' })).toBeCloseTo(10, 8);
  });

  it('never goes below the minimum or above the maximum', () => {
    expect(getZoomedDistance({ ...limits, current: 5.2, direction: 'in' })).toBe(5);
    expect(getZoomedDistance({ ...limits, current: 19.5, direction: 'out' })).toBe(20);
  });

  it('pulls a distance that is already out of range back inside', () => {
    expect(getZoomedDistance({ ...limits, current: 2, direction: 'out' })).toBeGreaterThanOrEqual(
      5,
    );
    expect(getZoomedDistance({ ...limits, current: 100, direction: 'in' })).toBeLessThanOrEqual(20);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, 0, -4])(
    'recovers from an invalid current distance %s',
    (current) => {
      const next = getZoomedDistance({ ...limits, current, direction: 'in' });
      expect(Number.isFinite(next)).toBe(true);
      expect(next).toBeGreaterThanOrEqual(5);
      expect(next).toBeLessThanOrEqual(20);
    },
  );

  it('returns the current distance when the limits are inverted or invalid', () => {
    expect(
      getZoomedDistance({ current: 10, minDistance: 20, maxDistance: 5, direction: 'in' }),
    ).toBe(10);
    expect(
      getZoomedDistance({ current: 10, minDistance: Number.NaN, maxDistance: 5, direction: 'in' }),
    ).toBe(10);
  });
});

describe('getMaxZoomDistance', () => {
  it('keeps the default limit when the framing distance is small', () => {
    expect(getMaxZoomDistance(10)).toBe(DEFAULT_MAX_ZOOM_DISTANCE);
  });

  it('allows backing off further than the framing distance on tall screens', () => {
    expect(getMaxZoomDistance(40)).toBeGreaterThan(40);
  });

  it.each([Number.NaN, -3, 0])(
    'falls back to the default for invalid framing distance %s',
    (distance) => {
      expect(getMaxZoomDistance(distance)).toBe(DEFAULT_MAX_ZOOM_DISTANCE);
    },
  );
});
