import {
  DRONE_HALF_WIDTH_PIXEL_UNITS,
  NARROW_PIXEL_SCALE,
  NARROW_SCREEN_MAX_WIDTH_PIXELS,
  PLAY_AREA_TOP_RATIO,
  WIDE_PIXEL_SCALE,
} from './constants';

export type PlayField = { width: number; height: number };

export type DroneBounds = {
  minimumX: number;
  maximumX: number;
  minimumY: number;
  maximumY: number;
};

export function getPixelScale(width: number): number {
  return width >= NARROW_SCREEN_MAX_WIDTH_PIXELS ? WIDE_PIXEL_SCALE : NARROW_PIXEL_SCALE;
}

export function getDroneBounds(field: PlayField): DroneBounds {
  const margin = DRONE_HALF_WIDTH_PIXEL_UNITS * getPixelScale(field.width);
  const minimumX = margin;
  const maximumX = field.width - margin;
  const minimumY = field.height * PLAY_AREA_TOP_RATIO;
  const maximumY = field.height - margin;

  const isTooNarrow = minimumX > maximumX;
  const isTooShort = minimumY > maximumY;
  return {
    minimumX: isTooNarrow ? field.width / 2 : minimumX,
    maximumX: isTooNarrow ? field.width / 2 : maximumX,
    minimumY,
    maximumY: isTooShort ? minimumY : maximumY,
  };
}
