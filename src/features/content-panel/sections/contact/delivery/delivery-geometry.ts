import { ARC_WIDTH, DELIVERY_HEIGHT } from '../journey/arc-geometry';
import type { Point } from '../journey/arc-geometry';

export const DELIVERY_SCENE_WIDTH = ARC_WIDTH;
export const DELIVERY_ROUTE = 'M 78 282 Q 104 96 318 104';
export const LAUNCH_POINT: Point = { x: 78, y: 282 };
export const MERCURY_CENTER: Point = { x: 318, y: 104 };
export const MERCURY_DIAMETER = 72;
export const MERCURY_ORBIT_RADIUS = 58;
export const STAMP_POSITION: Point = { x: 312, y: 196 };
export const WARP_ORIGIN: Point = { x: 225, y: 75 };

const STAR_X_STEP = 97;
const STAR_Y_STEP = 61;
const STAR_Y_OFFSET = 13;
const LARGE_STAR_EVERY = 5;
const TWINKLE_DURATION_VARIANTS = 4;
const TWINKLE_BASE_SECONDS = 2;
const TWINKLE_DELAY_VARIANTS = 7;
const TWINKLE_DELAY_STEP_SECONDS = 0.3;

const WARP_ANGLE_SKEW_DEGREES = 7;
const WARP_BASE_LENGTH = 40;
const WARP_LENGTH_VARIANTS = 3;
const WARP_LENGTH_STEP = 22;
const WARP_DELAY_VARIANTS = 4;
const WARP_DELAY_STEP_SECONDS = 0.06;

export type Star = {
  x: number;
  y: number;
  isLarge: boolean;
  durationSeconds: number;
  delaySeconds: number;
};

export type WarpLine = { angleDegrees: number; length: number; delaySeconds: number };

function toCount(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function getStarPositions(count: number): Star[] {
  return Array.from({ length: toCount(count) }, (_value, index) => ({
    x: (index * STAR_X_STEP) % DELIVERY_SCENE_WIDTH,
    y: (index * STAR_Y_STEP + STAR_Y_OFFSET) % DELIVERY_HEIGHT,
    isLarge: index % LARGE_STAR_EVERY === 0,
    durationSeconds: TWINKLE_BASE_SECONDS + (index % TWINKLE_DURATION_VARIANTS),
    delaySeconds: (index % TWINKLE_DELAY_VARIANTS) * TWINKLE_DELAY_STEP_SECONDS,
  }));
}

export function getWarpLines(count: number): WarpLine[] {
  const total = toCount(count);
  return Array.from({ length: total }, (_value, index) => ({
    angleDegrees: index * (360 / total) + (index % 2) * WARP_ANGLE_SKEW_DEGREES,
    length: WARP_BASE_LENGTH + (index % WARP_LENGTH_VARIANTS) * WARP_LENGTH_STEP,
    delaySeconds: (index % WARP_DELAY_VARIANTS) * WARP_DELAY_STEP_SECONDS,
  }));
}
