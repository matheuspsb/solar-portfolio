import { clamp } from '@/lib/math';
import { DRONE_FOLLOW_RATE, DRONE_KEYBOARD_SPEED, DRONE_START_HEIGHT_RATIO } from './constants';
import { getDroneBounds } from './play-field';
import type { PlayField } from './play-field';
import { isValidStep } from './time-step';

export type Drone = { x: number; y: number; targetX: number; targetY: number };

export type Direction = { x: number; y: number };

type Point = { x: number; y: number };

type StepDroneInput = {
  drone: Drone;
  direction: Direction;
  deltaSeconds: number;
  field: PlayField;
};

function readAxis(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function clampDroneToField(drone: Drone, field: PlayField): Drone {
  const bounds = getDroneBounds(field);
  return {
    x: clamp(drone.x, bounds.minimumX, bounds.maximumX),
    y: clamp(drone.y, bounds.minimumY, bounds.maximumY),
    targetX: clamp(drone.targetX, bounds.minimumX, bounds.maximumX),
    targetY: clamp(drone.targetY, bounds.minimumY, bounds.maximumY),
  };
}

export function createDrone(field: PlayField): Drone {
  const centerX = field.width / 2;
  const startY = field.height * DRONE_START_HEIGHT_RATIO;
  return { x: centerX, y: startY, targetX: centerX, targetY: startY };
}

export function aimDrone(drone: Drone, point: Point, field: PlayField): Drone {
  const bounds = getDroneBounds(field);
  return {
    ...drone,
    targetX: Number.isFinite(point.x)
      ? clamp(point.x, bounds.minimumX, bounds.maximumX)
      : drone.targetX,
    targetY: Number.isFinite(point.y)
      ? clamp(point.y, bounds.minimumY, bounds.maximumY)
      : drone.targetY,
  };
}

export function stepDrone({ drone, direction, deltaSeconds, field }: StepDroneInput): Drone {
  if (!isValidStep(deltaSeconds)) return drone;

  const directionX = readAxis(direction.x);
  const directionY = readAxis(direction.y);
  const isUsingKeyboard = directionX !== 0 || directionY !== 0;

  if (isUsingKeyboard) {
    const length = Math.hypot(directionX, directionY);
    const distance = DRONE_KEYBOARD_SPEED * deltaSeconds;
    const nextX = drone.x + (directionX / length) * distance;
    const nextY = drone.y + (directionY / length) * distance;
    return clampDroneToField({ x: nextX, y: nextY, targetX: nextX, targetY: nextY }, field);
  }

  const followFactor = 1 - Math.exp(-deltaSeconds * DRONE_FOLLOW_RATE);
  return clampDroneToField(
    {
      ...drone,
      x: drone.x + (drone.targetX - drone.x) * followFactor,
      y: drone.y + (drone.targetY - drone.y) * followFactor,
    },
    field,
  );
}
