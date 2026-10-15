import { clamp } from '@/lib/math';

type Vector = { x: number; y: number; z: number };

export type CameraPose = { position: Vector; target: Vector };

const BEZIER_FIRST_X = 0.75;
const BEZIER_SECOND_X = 0.2;
const BEZIER_FIRST_Y = 0;
const BEZIER_SECOND_Y = 1;
const BISECTION_STEPS = 32;
const DEFAULT_FIELD_OF_VIEW_DEGREES = 50;
const MAX_HALF_ANGLE_RADIANS = Math.PI / 2 - 0.01;
const CLOSE_UP_FACTOR = 0.9;
const MIN_DISTANCE_PER_RADIUS = 1.05;
const DEFAULT_AXIS: Vector = { x: 0, y: 0, z: 1 };
const DEGREES_TO_RADIANS = Math.PI / 180;
const HALF = 0.5;

function sampleBezier(first: number, second: number, progress: number): number {
  const remaining = 1 - progress;
  return (
    3 * remaining * remaining * progress * first +
    3 * remaining * progress * progress * second +
    progress * progress * progress
  );
}

export function easeDive(progress: number): number {
  if (!Number.isFinite(progress)) return progress > 0 ? 1 : 0;
  const clamped = clamp(progress, 0, 1);
  if (clamped === 0 || clamped === 1) return clamped;
  let low = 0;
  let high = 1;
  for (let step = 0; step < BISECTION_STEPS; step += 1) {
    const middle = (low + high) * HALF;
    if (sampleBezier(BEZIER_FIRST_X, BEZIER_SECOND_X, middle) < clamped) low = middle;
    else high = middle;
  }
  const curveProgress = (low + high) * HALF;
  return sampleBezier(BEZIER_FIRST_Y, BEZIER_SECOND_Y, curveProgress);
}

type AdvanceInput = { progress: number; deltaSeconds: number; durationSeconds: number };

export function advanceDiveProgress({
  progress,
  deltaSeconds,
  durationSeconds,
}: AdvanceInput): number {
  const isDurationUsable = Number.isFinite(durationSeconds) && durationSeconds > 0;
  if (!isDurationUsable) return 1;
  const isStepUsable = Number.isFinite(deltaSeconds) && deltaSeconds > 0;
  if (!isStepUsable) return progress;
  return Math.min(1, progress + deltaSeconds / durationSeconds);
}

type FillDistanceInput = { radius: number; fieldOfViewDegrees: number; aspect: number };

export function getFillDistance({ radius, fieldOfViewDegrees, aspect }: FillDistanceInput): number {
  const fieldOfView = Number.isFinite(fieldOfViewDegrees)
    ? fieldOfViewDegrees
    : DEFAULT_FIELD_OF_VIEW_DEGREES;
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const halfVertical = fieldOfView * DEGREES_TO_RADIANS * HALF;
  const halfDiagonal = Math.min(
    MAX_HALF_ANGLE_RADIANS,
    Math.atan(Math.tan(halfVertical) * Math.hypot(1, safeAspect)),
  );
  const closeUp = (CLOSE_UP_FACTOR * radius) / Math.sin(halfDiagonal);
  return Math.max(closeUp, radius * MIN_DISTANCE_PER_RADIUS);
}

type EndPoseInput = { cameraPosition: Vector; bodyPosition: Vector; distance: number };

export function getDiveEndPose({
  cameraPosition,
  bodyPosition,
  distance,
}: EndPoseInput): CameraPose {
  const offset = {
    x: cameraPosition.x - bodyPosition.x,
    y: cameraPosition.y - bodyPosition.y,
    z: cameraPosition.z - bodyPosition.z,
  };
  const length = Math.hypot(offset.x, offset.y, offset.z);
  const direction =
    length > 0
      ? { x: offset.x / length, y: offset.y / length, z: offset.z / length }
      : DEFAULT_AXIS;
  return {
    position: {
      x: bodyPosition.x + direction.x * distance,
      y: bodyPosition.y + direction.y * distance,
      z: bodyPosition.z + direction.z * distance,
    },
    target: { ...bodyPosition },
  };
}

function mixVector(from: Vector, to: Vector, amount: number): Vector {
  return {
    x: from.x + (to.x - from.x) * amount,
    y: from.y + (to.y - from.y) * amount,
    z: from.z + (to.z - from.z) * amount,
  };
}

export function interpolatePose(from: CameraPose, to: CameraPose, amount: number): CameraPose {
  const safeAmount = Number.isFinite(amount) ? clamp(amount, 0, 1) : 0;
  return {
    position: mixVector(from.position, to.position, safeAmount),
    target: mixVector(from.target, to.target, safeAmount),
  };
}
