import { describe, expect, it } from 'vitest';
import {
  advanceDiveProgress,
  easeDive,
  getDiveEndPose,
  getFillDistance,
  interpolatePose,
} from './camera-dive';

const origin = { x: 0, y: 0, z: 0 };

describe('easeDive', () => {
  it('starts at zero, ends at one and never goes backwards', () => {
    expect(easeDive(0)).toBe(0);
    expect(easeDive(1)).toBe(1);
    let previous = 0;
    for (let step = 1; step <= 100; step += 1) {
      const eased = easeDive(step / 100);
      expect(eased).toBeGreaterThanOrEqual(previous);
      previous = eased;
    }
  });

  it('starts slow and ends slow, with the middle in a hurry', () => {
    expect(easeDive(0.1)).toBeLessThan(0.05);
    expect(easeDive(0.9)).toBeGreaterThan(0.95);
    expect(easeDive(0.5)).toBeGreaterThan(0.4);
    expect(easeDive(0.5)).toBeLessThan(0.7);
  });

  it.each([-1, 2, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'keeps %s inside the range',
    (progress) => {
      const eased = easeDive(progress);
      expect(eased).toBeGreaterThanOrEqual(0);
      expect(eased).toBeLessThanOrEqual(1);
    },
  );
});

describe('advanceDiveProgress', () => {
  it('moves forward by the share of the duration that passed', () => {
    expect(advanceDiveProgress({ progress: 0, deltaSeconds: 0.5, durationSeconds: 2 })).toBe(0.25);
  });

  it('stops at one', () => {
    expect(advanceDiveProgress({ progress: 0.9, deltaSeconds: 5, durationSeconds: 1 })).toBe(1);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('ignores the step %s', (deltaSeconds) => {
    expect(advanceDiveProgress({ progress: 0.4, deltaSeconds, durationSeconds: 1 })).toBe(0.4);
  });

  it.each([0, -1, Number.NaN])('finishes at once for the duration %s', (durationSeconds) => {
    expect(advanceDiveProgress({ progress: 0, deltaSeconds: 0.1, durationSeconds })).toBe(1);
  });
});

describe('getFillDistance', () => {
  it('puts the camera closer for a narrower view and farther for a bigger planet', () => {
    const base = getFillDistance({ radius: 1, fieldOfViewDegrees: 50, aspect: 1.6 });
    expect(getFillDistance({ radius: 2, fieldOfViewDegrees: 50, aspect: 1.6 })).toBeCloseTo(
      base * 2,
    );
    expect(getFillDistance({ radius: 1, fieldOfViewDegrees: 30, aspect: 1.6 })).toBeGreaterThan(
      base,
    );
  });

  it('needs a wider planet view on a wide screen than on a square one', () => {
    const square = getFillDistance({ radius: 1, fieldOfViewDegrees: 50, aspect: 1 });
    const wide = getFillDistance({ radius: 1, fieldOfViewDegrees: 50, aspect: 2.4 });
    expect(wide).toBeLessThan(square);
  });

  it('never ends inside the planet, whatever the numbers', () => {
    for (const aspect of [0, Number.NaN, -3, 100]) {
      expect(getFillDistance({ radius: 1, fieldOfViewDegrees: 50, aspect })).toBeGreaterThan(1);
    }
    expect(getFillDistance({ radius: 1, fieldOfViewDegrees: 179, aspect: 1 })).toBeGreaterThan(1);
    expect(
      getFillDistance({ radius: 1, fieldOfViewDegrees: Number.NaN, aspect: 1 }),
    ).toBeGreaterThan(1);
  });
});

describe('getDiveEndPose', () => {
  it('stops in front of the planet on the line the camera came from, looking at it', () => {
    const pose = getDiveEndPose({
      cameraPosition: { x: 0, y: 0, z: 10 },
      bodyPosition: { x: 0, y: 0, z: 0 },
      distance: 3,
    });
    expect(pose.position).toEqual({ x: 0, y: 0, z: 3 });
    expect(pose.target).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('follows a planet that is not at the origin', () => {
    const pose = getDiveEndPose({
      cameraPosition: { x: 10, y: 0, z: 0 },
      bodyPosition: { x: 4, y: 0, z: 0 },
      distance: 2,
    });
    expect(pose.position).toEqual({ x: 6, y: 0, z: 0 });
  });

  it('backs away along a default axis when the camera sits on the planet', () => {
    const pose = getDiveEndPose({ cameraPosition: origin, bodyPosition: origin, distance: 2 });
    expect(Number.isFinite(pose.position.x + pose.position.y + pose.position.z)).toBe(true);
    expect(Math.hypot(pose.position.x, pose.position.y, pose.position.z)).toBeCloseTo(2);
  });
});

describe('interpolatePose', () => {
  const from = { position: { x: 0, y: 0, z: 0 }, target: { x: 0, y: 0, z: 0 } };
  const to = { position: { x: 10, y: 20, z: 30 }, target: { x: 1, y: 2, z: 3 } };

  it('returns each end at zero and one and the midpoint at a half', () => {
    expect(interpolatePose(from, to, 0)).toEqual(from);
    expect(interpolatePose(from, to, 1)).toEqual(to);
    expect(interpolatePose(from, to, 0.5).position).toEqual({ x: 5, y: 10, z: 15 });
    expect(interpolatePose(from, to, 0.5).target).toEqual({ x: 0.5, y: 1, z: 1.5 });
  });

  it('clamps an amount outside the range', () => {
    expect(interpolatePose(from, to, 3)).toEqual(to);
    expect(interpolatePose(from, to, -3)).toEqual(from);
    expect(interpolatePose(from, to, Number.NaN)).toEqual(from);
  });
});
