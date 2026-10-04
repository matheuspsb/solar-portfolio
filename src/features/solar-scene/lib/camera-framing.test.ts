// Use case: the Sun must fit comfortably on any screen: a wide desktop, a tall phone, a phone
// rotated sideways. A fixed camera distance would make the Sun overflow a narrow phone or look
// tiny on an ultrawide monitor. Invalid sizes (0 before layout, NaN) must not send the camera to
// infinity or to the Sun's center.
import { describe, expect, it } from 'vitest';
import { getFramingDistance } from './camera-framing';

const RADIUS = 2.4;
const FIELD_OF_VIEW = 50;

function visibleHeightAt(distance: number): number {
  return 2 * distance * Math.tan((FIELD_OF_VIEW * Math.PI) / 360);
}

describe('getFramingDistance', () => {
  it('makes the Sun fill the requested fraction of the height on landscape screens', () => {
    const distance = getFramingDistance({
      radius: RADIUS,
      fieldOfViewDegrees: FIELD_OF_VIEW,
      aspectRatio: 16 / 9,
      screenFill: 0.5,
    });
    expect((2 * RADIUS) / visibleHeightAt(distance)).toBeCloseTo(0.5, 5);
  });

  it('makes the Sun fill the requested fraction of the width on portrait screens', () => {
    const aspectRatio = 9 / 19.5;
    const distance = getFramingDistance({
      radius: RADIUS,
      fieldOfViewDegrees: FIELD_OF_VIEW,
      aspectRatio,
      screenFill: 0.5,
    });
    expect((2 * RADIUS) / (visibleHeightAt(distance) * aspectRatio)).toBeCloseTo(0.5, 5);
  });

  it('moves the camera back for narrower screens', () => {
    const base = { radius: RADIUS, fieldOfViewDegrees: FIELD_OF_VIEW, screenFill: 0.5 };
    expect(getFramingDistance({ ...base, aspectRatio: 0.5 })).toBeGreaterThan(
      getFramingDistance({ ...base, aspectRatio: 1.6 }),
    );
  });

  it('does not change once the screen is wider than tall (height is the limit)', () => {
    const base = { radius: RADIUS, fieldOfViewDegrees: FIELD_OF_VIEW, screenFill: 0.5 };
    expect(getFramingDistance({ ...base, aspectRatio: 1.6 })).toBeCloseTo(
      getFramingDistance({ ...base, aspectRatio: 3 }),
      8,
    );
  });

  it('scales with the body radius', () => {
    const base = { fieldOfViewDegrees: FIELD_OF_VIEW, aspectRatio: 1.6, screenFill: 0.5 };
    expect(getFramingDistance({ ...base, radius: 4 })).toBeCloseTo(
      getFramingDistance({ ...base, radius: 2 }) * 2,
      8,
    );
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'treats an invalid aspect ratio (%s) as square',
    (aspectRatio) => {
      const square = getFramingDistance({
        radius: RADIUS,
        fieldOfViewDegrees: FIELD_OF_VIEW,
        aspectRatio: 1,
        screenFill: 0.5,
      });
      expect(
        getFramingDistance({
          radius: RADIUS,
          fieldOfViewDegrees: FIELD_OF_VIEW,
          aspectRatio,
          screenFill: 0.5,
        }),
      ).toBeCloseTo(square, 8);
    },
  );

  it.each([0, -3, Number.NaN, Number.POSITIVE_INFINITY])(
    'never returns a non-finite or non-positive distance for radius %s',
    (radius) => {
      const distance = getFramingDistance({
        radius,
        fieldOfViewDegrees: FIELD_OF_VIEW,
        aspectRatio: 1.6,
        screenFill: 0.5,
      });
      expect(Number.isFinite(distance)).toBe(true);
      expect(distance).toBeGreaterThan(0);
    },
  );

  it.each([0, -1, Number.NaN, 5])('clamps an unreasonable screen fill (%s)', (screenFill) => {
    const distance = getFramingDistance({
      radius: RADIUS,
      fieldOfViewDegrees: FIELD_OF_VIEW,
      aspectRatio: 1.6,
      screenFill,
    });
    expect(Number.isFinite(distance)).toBe(true);
    expect(distance).toBeGreaterThan(RADIUS);
  });

  it.each([0, 180, -10, Number.NaN])(
    'falls back to a sane field of view for %s',
    (fieldOfViewDegrees) => {
      const distance = getFramingDistance({
        radius: RADIUS,
        fieldOfViewDegrees,
        aspectRatio: 1.6,
        screenFill: 0.5,
      });
      expect(Number.isFinite(distance)).toBe(true);
      expect(distance).toBeGreaterThan(RADIUS);
    },
  );
});
