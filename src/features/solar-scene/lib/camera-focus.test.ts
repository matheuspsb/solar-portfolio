import { describe, expect, it } from 'vitest';
import {
  getAzimuth,
  getFocusAzimuth,
  setAzimuth,
  stepAngleToward,
  wrapAngle,
} from './camera-focus';

describe('wrapAngle', () => {
  it('keeps angles already in (-PI, PI]', () => {
    expect(wrapAngle(1)).toBeCloseTo(1);
    expect(wrapAngle(-2)).toBeCloseTo(-2);
  });

  it('wraps larger angles into range', () => {
    expect(wrapAngle(Math.PI * 2 + 0.5)).toBeCloseTo(0.5);
    expect(wrapAngle(-Math.PI * 2 - 0.5)).toBeCloseTo(-0.5);
    expect(wrapAngle(Math.PI * 7)).toBeCloseTo(Math.PI);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'returns 0 for %s',
    (angle) => {
      expect(wrapAngle(angle)).toBe(0);
    },
  );
});

describe('stepAngleToward', () => {
  it('moves toward the target without overshooting', () => {
    const next = stepAngleToward({ current: 0, target: 1, rate: 8, deltaSeconds: 0.05 });
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
  });

  it('takes the short way round across the +-PI seam', () => {
    const next = stepAngleToward({ current: 3, target: -3, rate: 8, deltaSeconds: 0.05 });
    expect(wrapAngle(next - 3)).toBeGreaterThan(0);
    expect(Math.abs(wrapAngle(next - 3))).toBeLessThan(0.3);
  });

  it('arrives exactly with an infinite rate (reduced motion)', () => {
    const next = stepAngleToward({
      current: 0.2,
      target: 2.5,
      rate: Number.POSITIVE_INFINITY,
      deltaSeconds: 0.016,
    });
    expect(wrapAngle(next - 2.5)).toBeCloseTo(0, 6);
  });

  it('stays put for a zero delta', () => {
    expect(stepAngleToward({ current: 1.2, target: 2, rate: 8, deltaSeconds: 0 })).toBeCloseTo(1.2);
  });

  it('converges after enough time', () => {
    let angle = 0;
    for (let frame = 0; frame < 300; frame += 1) {
      angle = stepAngleToward({ current: angle, target: 2, rate: 6, deltaSeconds: 0.016 });
    }
    expect(angle).toBeCloseTo(2, 3);
  });

  it('jumps to the target when the current angle is corrupted', () => {
    const next = stepAngleToward({ current: Number.NaN, target: 1, rate: 8, deltaSeconds: 0.05 });
    expect(next).toBeCloseTo(1);
  });

  it('keeps the current angle when the target is invalid', () => {
    expect(stepAngleToward({ current: 1, target: Number.NaN, rate: 8, deltaSeconds: 0.05 })).toBe(
      1,
    );
  });
});

describe('getFocusAzimuth', () => {
  const options = { sideOffset: 0.5 };

  it('places the camera at the planet azimuth plus the side offset', () => {
    const azimuth = getFocusAzimuth({ bodyPosition: { x: 0, z: 4 }, ...options });
    expect(azimuth).toBeCloseTo(Math.PI / 2 + 0.5);
  });

  it('follows a planet anywhere on its orbit', () => {
    const azimuth = getFocusAzimuth({ bodyPosition: { x: -3, z: -3 }, ...options });
    expect(azimuth).toBeCloseTo(Math.atan2(-3, -3) + 0.5);
  });

  it('has no azimuth for a body at the center (the star): the camera stays put', () => {
    expect(getFocusAzimuth({ bodyPosition: { x: 0, z: 0 }, ...options })).toBeNull();
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    'has no azimuth for an invalid position (%s)',
    (value) => {
      expect(getFocusAzimuth({ bodyPosition: { x: value, z: 1 }, ...options })).toBeNull();
    },
  );
});

describe('getAzimuth and setAzimuth', () => {
  it('reads the angle in the horizontal plane (0 on +x, a quarter turn on +z)', () => {
    expect(getAzimuth({ x: 1, y: 5, z: 0 })).toBeCloseTo(0);
    expect(getAzimuth({ x: 0, y: -2, z: 3 })).toBeCloseTo(Math.PI / 2);
  });

  it('rotates a position around the vertical axis keeping radius and height', () => {
    const rotated = setAzimuth({ x: 3, y: 4, z: 4 }, 0);
    expect(rotated.x).toBeCloseTo(Math.hypot(3, 4));
    expect(rotated.z).toBeCloseTo(0);
    expect(rotated.y).toBe(4);
  });

  it('leaves a position on the vertical axis untouched (no defined azimuth)', () => {
    expect(setAzimuth({ x: 0, y: 7, z: 0 }, 2)).toEqual({ x: 0, y: 7, z: 0 });
  });

  it('round-trips with getAzimuth', () => {
    const rotated = setAzimuth({ x: 1, y: 1, z: 2 }, 2.2);
    expect(getAzimuth(rotated)).toBeCloseTo(2.2);
  });
});
