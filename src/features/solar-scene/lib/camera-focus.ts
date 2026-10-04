import { dampValue } from './damp';

const FULL_TURN = Math.PI * 2;
/** Below this horizontal distance a body counts as being at the center (it has no azimuth). */
const CENTER_EPSILON = 1e-3;

type Vec3 = { x: number; y: number; z: number };

/** Wraps an angle into (-PI, PI]; corrupted values become 0. */
export function wrapAngle(angle: number): number {
  if (!Number.isFinite(angle)) return 0;
  return angle - FULL_TURN * Math.ceil((angle - Math.PI) / FULL_TURN);
}

type StepAngleInput = {
  current: number;
  target: number;
  /** Larger is snappier; `Infinity` arrives immediately. */
  rate: number;
  deltaSeconds: number;
};

/** Eases `current` toward `target` along the shortest arc, independent of the frame rate. */
export function stepAngleToward({ current, target, rate, deltaSeconds }: StepAngleInput): number {
  if (!Number.isFinite(target)) return current;
  if (!Number.isFinite(current)) return target;
  const shortestDifference = wrapAngle(target - current);
  return current + dampValue({ current: 0, target: shortestDifference, rate, deltaSeconds });
}

type FocusAzimuthInput = {
  bodyPosition: { x: number; z: number };
  /** Where the camera sits when nothing (or the central star) is focused. */
  homeAzimuth: number;
  /** Extra swing so the focused body appears beside the center instead of hiding the star. */
  sideOffset: number;
};

/** The azimuth the camera should take to bring a body into view in front of the star. */
export function getFocusAzimuth({
  bodyPosition,
  homeAzimuth,
  sideOffset,
}: FocusAzimuthInput): number {
  const { x, z } = bodyPosition;
  if (!Number.isFinite(x) || !Number.isFinite(z)) return homeAzimuth;
  if (Math.hypot(x, z) < CENTER_EPSILON) return homeAzimuth;
  return Math.atan2(z, x) + sideOffset;
}

/** Angle of a position in the horizontal plane: 0 on +x, a quarter turn on +z. */
export function getAzimuth({ x, z }: { x: number; z: number; y?: number }): number {
  return Math.atan2(z, x);
}

/** Rotates a position around the vertical axis to the given azimuth, keeping radius and height. */
export function setAzimuth(position: Vec3, azimuth: number): Vec3 {
  const horizontalRadius = Math.hypot(position.x, position.z);
  if (!Number.isFinite(azimuth) || horizontalRadius < CENTER_EPSILON) return { ...position };
  return {
    x: horizontalRadius * Math.cos(azimuth),
    y: position.y,
    z: horizontalRadius * Math.sin(azimuth),
  };
}
