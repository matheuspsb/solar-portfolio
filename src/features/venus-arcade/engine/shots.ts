import {
  FIRST_SHOT_DELAY_SECONDS,
  HOTFIX_FIRE_INTERVAL_SECONDS,
  HOTFIX_SHOT_ANGLES_RADIANS,
  SHOT_CULL_MARGIN_PIXELS,
  SHOT_MUZZLE_OFFSET_PIXEL_UNITS,
  SHOT_SPEED,
  STANDARD_FIRE_INTERVAL_SECONDS,
  STANDARD_SHOT_ANGLES_RADIANS,
} from './constants';
import type { Drone } from './drone';
import type { PlayField } from './play-field';
import { isValidStep } from '@/lib/time-step';

export type FireMode = 'standard' | 'hotfix';

export type Weapon = { cooldownSeconds: number };

export type Shot = { x: number; y: number; vx: number; vy: number };

type WeaponStep = { weapon: Weapon; hasFired: boolean };

function getFireInterval(mode: FireMode): number {
  return mode === 'hotfix' ? HOTFIX_FIRE_INTERVAL_SECONDS : STANDARD_FIRE_INTERVAL_SECONDS;
}

export function createWeapon(): Weapon {
  return { cooldownSeconds: FIRST_SHOT_DELAY_SECONDS };
}

export function advanceWeapon(weapon: Weapon, deltaSeconds: number, mode: FireMode): WeaponStep {
  if (!isValidStep(deltaSeconds)) return { weapon, hasFired: false };

  const cooldownSeconds = weapon.cooldownSeconds - deltaSeconds;
  if (cooldownSeconds > 0) return { weapon: { cooldownSeconds }, hasFired: false };
  return { weapon: { cooldownSeconds: getFireInterval(mode) }, hasFired: true };
}

export function spawnShots(drone: Drone, mode: FireMode, pixelScale: number): Shot[] {
  const angles = mode === 'hotfix' ? HOTFIX_SHOT_ANGLES_RADIANS : STANDARD_SHOT_ANGLES_RADIANS;
  return angles.map((angle) => ({
    x: drone.x,
    y: drone.y - SHOT_MUZZLE_OFFSET_PIXEL_UNITS * pixelScale,
    vx: Math.sin(angle) * SHOT_SPEED,
    vy: -Math.cos(angle) * SHOT_SPEED,
  }));
}

function isInsideField(shot: Shot, field: PlayField): boolean {
  return (
    shot.y > -SHOT_CULL_MARGIN_PIXELS &&
    shot.x > -SHOT_CULL_MARGIN_PIXELS &&
    shot.x < field.width + SHOT_CULL_MARGIN_PIXELS
  );
}

export function advanceShots(
  shots: readonly Shot[],
  deltaSeconds: number,
  field: PlayField,
): Shot[] {
  const step = isValidStep(deltaSeconds) ? deltaSeconds : 0;
  return shots
    .map((shot) => ({ ...shot, x: shot.x + shot.vx * step, y: shot.y + shot.vy * step }))
    .filter((shot) => isInsideField(shot, field));
}
