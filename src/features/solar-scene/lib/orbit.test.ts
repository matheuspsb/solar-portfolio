import { describe, expect, it } from 'vitest';
import { getOrbitPosition } from './orbit';

describe('getOrbitPosition', () => {
  it('starts on the +x axis at angle zero', () => {
    const { x, z } = getOrbitPosition({ radius: 5, angle: 0 });
    expect(x).toBeCloseTo(5);
    expect(z).toBeCloseTo(0);
  });

  it('reaches +z a quarter turn later (towards the camera)', () => {
    const { x, z } = getOrbitPosition({ radius: 5, angle: Math.PI / 2 });
    expect(x).toBeCloseTo(0);
    expect(z).toBeCloseTo(5);
  });

  it.each([0.3, 2, -4, 12345.678])('stays on the circle for angle %s', (angle) => {
    const { x, z } = getOrbitPosition({ radius: 4.6, angle });
    expect(Math.hypot(x, z)).toBeCloseTo(4.6, 6);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    'falls back to angle zero for angle %s',
    (angle) => {
      expect(getOrbitPosition({ radius: 3, angle })).toEqual(
        getOrbitPosition({ radius: 3, angle: 0 }),
      );
    },
  );

  it.each([0, -2, Number.NaN, Number.POSITIVE_INFINITY])(
    'collapses to the center for an invalid radius (%s)',
    (radius) => {
      expect(getOrbitPosition({ radius, angle: 1 })).toEqual({ x: 0, z: 0 });
    },
  );
});
