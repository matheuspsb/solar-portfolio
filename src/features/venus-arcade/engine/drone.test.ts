import { describe, expect, it } from 'vitest';
import { DRONE_KEYBOARD_SPEED } from './constants';
import { aimDrone, createDrone, stepDrone } from './drone';
import type { Drone } from './drone';
import { getDroneBounds } from './play-field';

const field = { width: 1000, height: 600 };
const bounds = getDroneBounds(field);
const STEP_SECONDS = 1 / 60;
const NO_DIRECTION = { x: 0, y: 0 };

function stepFor(drone: Drone, seconds: number, direction = NO_DIRECTION): Drone {
  let current = drone;
  for (let frame = 0; frame < Math.round(seconds / STEP_SECONDS); frame += 1) {
    current = stepDrone({ drone: current, direction, deltaSeconds: STEP_SECONDS, field });
  }
  return current;
}

describe('createDrone', () => {
  it('starts centered, low on the screen and at rest', () => {
    const drone = createDrone(field);
    expect(drone.x).toBe(500);
    expect(drone.y).toBeCloseTo(468);
    expect(drone.targetX).toBe(drone.x);
    expect(drone.targetY).toBe(drone.y);
  });
});

describe('aimDrone', () => {
  it('moves only the target, clamped to the play area', () => {
    const drone = createDrone(field);
    const aimed = aimDrone(drone, { x: -50, y: 9999 }, field);
    expect(aimed.x).toBe(drone.x);
    expect(aimed.targetX).toBe(bounds.minimumX);
    expect(aimed.targetY).toBe(bounds.maximumY);
  });

  it('keeps the current target when the pointer position is not a number', () => {
    const drone = createDrone(field);
    const aimed = aimDrone(drone, { x: Number.NaN, y: Number.NaN }, field);
    expect(aimed.targetX).toBe(drone.targetX);
    expect(aimed.targetY).toBe(drone.targetY);
  });
});

describe('stepDrone with the pointer', () => {
  it('eases toward the target without overshooting', () => {
    const aimed = aimDrone(createDrone(field), { x: 800, y: 300 }, field);
    const afterOneFrame = stepDrone({
      drone: aimed,
      direction: NO_DIRECTION,
      deltaSeconds: STEP_SECONDS,
      field,
    });
    expect(afterOneFrame.x).toBeGreaterThan(500);
    expect(afterOneFrame.x).toBeLessThan(800);
    const settled = stepFor(aimed, 2);
    expect(settled.x).toBeCloseTo(800, 1);
    expect(settled.y).toBeCloseTo(300, 1);
  });

  it('reaches the target in a single huge step instead of flying past it', () => {
    const aimed = aimDrone(createDrone(field), { x: 800, y: 300 }, field);
    const stepped = stepDrone({
      drone: aimed,
      direction: NO_DIRECTION,
      deltaSeconds: 3600,
      field,
    });
    expect(stepped.x).toBeCloseTo(800, 5);
    expect(stepped.y).toBeCloseTo(300, 5);
  });

  it.each([0, -1, Number.NaN])('does not move on the step %s', (deltaSeconds) => {
    const aimed = aimDrone(createDrone(field), { x: 800, y: 300 }, field);
    const stepped = stepDrone({ drone: aimed, direction: NO_DIRECTION, deltaSeconds, field });
    expect(stepped.x).toBe(aimed.x);
    expect(stepped.y).toBe(aimed.y);
  });
});

describe('stepDrone with the keyboard', () => {
  it('moves at the keyboard speed and drags the target along', () => {
    const start = createDrone(field);
    const moved = stepFor(start, 0.25, { x: 1, y: 0 });
    expect(moved.x - start.x).toBeCloseTo(DRONE_KEYBOARD_SPEED * 0.25, 0);
    expect(moved.targetX).toBe(moved.x);
  });

  it('does not go faster along a diagonal', () => {
    const start = createDrone(field);
    const moved = stepFor(start, 0.25, { x: 1, y: -1 });
    const distance = Math.hypot(moved.x - start.x, moved.y - start.y);
    expect(distance).toBeCloseTo(DRONE_KEYBOARD_SPEED * 0.25, 0);
  });

  it('stops at the edges of the play area', () => {
    const moved = stepFor(createDrone(field), 10, { x: 1, y: 1 });
    expect(moved.x).toBe(bounds.maximumX);
    expect(moved.y).toBe(bounds.maximumY);
    const movedBack = stepFor(moved, 10, { x: -1, y: -1 });
    expect(movedBack.x).toBe(bounds.minimumX);
    expect(movedBack.y).toBe(bounds.minimumY);
  });

  it('ignores a direction that is not a number', () => {
    const start = createDrone(field);
    const stepped = stepDrone({
      drone: start,
      direction: { x: Number.NaN, y: Number.NaN },
      deltaSeconds: STEP_SECONDS,
      field,
    });
    expect(stepped.x).toBe(start.x);
    expect(stepped.y).toBe(start.y);
  });
});

describe('stepDrone when the field is resized', () => {
  it('pulls the drone back inside a field that became smaller', () => {
    const smallField = { width: 300, height: 300 };
    const stepped = stepDrone({
      drone: createDrone(field),
      direction: NO_DIRECTION,
      deltaSeconds: STEP_SECONDS,
      field: smallField,
    });
    const smallBounds = getDroneBounds(smallField);
    expect(stepped.x).toBeLessThanOrEqual(smallBounds.maximumX);
    expect(stepped.y).toBeLessThanOrEqual(smallBounds.maximumY);
  });
});
