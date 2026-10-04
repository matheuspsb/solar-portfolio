import { dampValue } from './damp';

const FULL_TURN = Math.PI * 2;
const CENTER_EPSILON = 1e-3;

type Vec3 = { x: number; y: number; z: number };

export function wrapAngle(angle: number): number {
  if (!Number.isFinite(angle)) return 0;
  return angle - FULL_TURN * Math.ceil((angle - Math.PI) / FULL_TURN);
}

type StepAngleInput = {
  current: number;
  target: number;
  rate: number;
  deltaSeconds: number;
};

export function stepAngleToward({ current, target, rate, deltaSeconds }: StepAngleInput): number {
  if (!Number.isFinite(target)) return current;
  if (!Number.isFinite(current)) return target;
  const shortestDifference = wrapAngle(target - current);
  return current + dampValue({ current: 0, target: shortestDifference, rate, deltaSeconds });
}

type FocusAzimuthInput = {
  bodyPosition: { x: number; z: number };
  homeAzimuth: number;
  sideOffset: number;
};

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

export function getAzimuth({ x, z }: { x: number; z: number; y?: number }): number {
  return Math.atan2(z, x);
}

export function setAzimuth(position: Vec3, azimuth: number): Vec3 {
  const horizontalRadius = Math.hypot(position.x, position.z);
  if (!Number.isFinite(azimuth) || horizontalRadius < CENTER_EPSILON) return { ...position };
  return {
    x: horizontalRadius * Math.cos(azimuth),
    y: position.y,
    z: horizontalRadius * Math.sin(azimuth),
  };
}
