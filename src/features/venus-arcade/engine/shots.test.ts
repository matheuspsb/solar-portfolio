import { describe, expect, it } from 'vitest';
import {
  FIRST_SHOT_DELAY_SECONDS,
  HOTFIX_FIRE_INTERVAL_SECONDS,
  SHOT_SPEED,
  STANDARD_FIRE_INTERVAL_SECONDS,
} from './constants';
import { advanceShots, advanceWeapon, createWeapon, spawnShots } from './shots';
import type { FireMode, Weapon } from './shots';

const field = { width: 1000, height: 600 };
const drone = { x: 500, y: 400, targetX: 500, targetY: 400 };
const FINE_STEP_SECONDS = 1 / 240;
const MUZZLE_PIXEL_SCALE = 4;

function countShots(mode: FireMode, seconds: number): number {
  let weapon: Weapon = createWeapon();
  let shots = 0;
  for (let frame = 0; frame < Math.round(seconds / FINE_STEP_SECONDS); frame += 1) {
    const result = advanceWeapon(weapon, FINE_STEP_SECONDS, mode);
    weapon = result.weapon;
    if (result.hasFired) shots += 1;
  }
  return shots;
}

function expectedShots(intervalSeconds: number, seconds: number): number {
  return Math.floor((seconds - FIRST_SHOT_DELAY_SECONDS) / intervalSeconds) + 1;
}

function expectCloseToIdeal(shots: number, ideal: number): void {
  expect(shots).toBeLessThanOrEqual(ideal);
  expect(shots).toBeGreaterThan(ideal * 0.9);
}

describe('advanceWeapon', () => {
  it('waits before the first shot', () => {
    const weapon = createWeapon();
    expect(weapon.cooldownSeconds).toBe(FIRST_SHOT_DELAY_SECONDS);
    expect(advanceWeapon(weapon, FIRST_SHOT_DELAY_SECONDS / 2, 'standard').hasFired).toBe(false);
    expect(advanceWeapon(weapon, FIRST_SHOT_DELAY_SECONDS, 'standard').hasFired).toBe(true);
  });

  it('fires at the standard cadence', () => {
    expectCloseToIdeal(countShots('standard', 3), expectedShots(STANDARD_FIRE_INTERVAL_SECONDS, 3));
  });

  it('fires faster in hotfix mode', () => {
    const hotfixShots = countShots('hotfix', 3);
    expect(hotfixShots).toBeGreaterThan(countShots('standard', 3));
    expectCloseToIdeal(hotfixShots, expectedShots(HOTFIX_FIRE_INTERVAL_SECONDS, 3));
  });

  it('fires at most once per step, even after a huge pause', () => {
    const result = advanceWeapon(createWeapon(), 3600, 'standard');
    expect(result.hasFired).toBe(true);
    expect(result.weapon.cooldownSeconds).toBe(STANDARD_FIRE_INTERVAL_SECONDS);
  });

  it.each([0, -1, Number.NaN])('does not count the step %s', (deltaSeconds) => {
    const weapon = createWeapon();
    const result = advanceWeapon(weapon, deltaSeconds, 'standard');
    expect(result.hasFired).toBe(false);
    expect(result.weapon.cooldownSeconds).toBe(weapon.cooldownSeconds);
  });
});

describe('spawnShots', () => {
  it('shoots one bolt straight up from the front of the drone in standard mode', () => {
    const shots = spawnShots(drone, 'standard', MUZZLE_PIXEL_SCALE);
    expect(shots).toHaveLength(1);
    expect(shots[0]).toEqual({ x: 500, y: 400 - 4 * MUZZLE_PIXEL_SCALE, vx: 0, vy: -SHOT_SPEED });
  });

  it('shoots three bolts in a fan in hotfix mode, all at the same speed', () => {
    const shots = spawnShots(drone, 'hotfix', MUZZLE_PIXEL_SCALE);
    expect(shots).toHaveLength(3);
    expect(shots[0]!.vx).toBeLessThan(0);
    expect(shots[1]!.vx).toBeCloseTo(0);
    expect(shots[2]!.vx).toBeGreaterThan(0);
    for (const shot of shots) expect(Math.hypot(shot.vx, shot.vy)).toBeCloseTo(SHOT_SPEED);
  });
});

describe('advanceShots', () => {
  it('moves each bolt by its velocity', () => {
    const [moved] = advanceShots([{ x: 100, y: 300, vx: 0, vy: -780 }], 0.1, field);
    expect(moved!.y).toBeCloseTo(300 - 78);
    expect(moved!.x).toBe(100);
  });

  it('drops bolts that left the top or the sides of the field', () => {
    const shots = [
      { x: 100, y: -19, vx: 0, vy: -780 },
      { x: -19, y: 300, vx: -780, vy: 0 },
      { x: 1019, y: 300, vx: 780, vy: 0 },
      { x: 500, y: 300, vx: 0, vy: -780 },
    ];
    const advanced = advanceShots(shots, 0.1, field);
    expect(advanced).toHaveLength(1);
    expect(advanced[0]!.x).toBe(500);
  });

  it('keeps a bolt that is still inside the margin', () => {
    const advanced = advanceShots([{ x: 100, y: 10, vx: 0, vy: -780 }], 0.01, field);
    expect(advanced).toHaveLength(1);
  });

  it.each([0, -1, Number.NaN])('does not move the bolts on the step %s', (deltaSeconds) => {
    const shot = { x: 100, y: 300, vx: 0, vy: -780 };
    expect(advanceShots([shot], deltaSeconds, field)).toEqual([shot]);
  });

  it('returns an empty list for no bolts', () => {
    expect(advanceShots([], 0.1, field)).toEqual([]);
  });

  it('does not change the list it was given', () => {
    const shots = [{ x: 100, y: 300, vx: 0, vy: -780 }];
    advanceShots(shots, 0.1, field);
    expect(shots[0]!.y).toBe(300);
  });
});
