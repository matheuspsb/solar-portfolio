import {
  BODY_CONTACT_FACTOR,
  DRONE_RADIUS_PIXEL_UNITS,
  HIT_FLASH_SECONDS,
  INVULNERABLE_SECONDS,
  PATCH_BONUS_POINTS,
  PATCH_PICKUP_EXTRA_PIXELS,
  SHOT_HIT_RADIUS_PIXELS,
  STARTING_INTEGRITY,
  TEAR_CONTACT_FACTOR,
} from './constants';
import type { Drone } from './drone';
import { isBug } from './entities';
import type { Bug, CorruptedData, Entity, Patch, Tear } from './entities';
import type { RunStats } from './scoring';
import type { Shot } from './shots';
import { isTearActive } from './entities';
import { isValidStep } from '@/lib/time-step';

type Shootable = Bug | CorruptedData;

type ShotHitsInput = { shots: readonly Shot[]; entities: readonly Entity[] };

type ShotHitsResult = { shots: Shot[]; entities: Entity[]; destroyed: Shootable[] };

type ContactsInput = {
  drone: Drone;
  entities: readonly Entity[];
  stats: RunStats;
  deltaSeconds: number;
  pixelScale: number;
};

type ContactsResult = {
  entities: Entity[];
  stats: RunStats;
  hasHurt: boolean;
  collectedPatches: Patch[];
};

function isShootable(entity: Entity): entity is Shootable {
  return isBug(entity) || entity.kind === 'data';
}

function distanceSquared(
  first: { x: number; y: number },
  second: { x: number; y: number },
): number {
  return (first.x - second.x) ** 2 + (first.y - second.y) ** 2;
}

function isShotOnTarget(shot: Shot, target: Shootable): boolean {
  return distanceSquared(shot, target) < (target.radius + SHOT_HIT_RADIUS_PIXELS) ** 2;
}

export function resolveShotHits({ shots, entities }: ShotHitsInput): ShotHitsResult {
  const survivors: Entity[] = [...entities];
  const keptShots: Shot[] = [];
  const destroyed: Shootable[] = [];

  for (const shot of shots) {
    const index = survivors.findIndex(
      (entity) => isShootable(entity) && isShotOnTarget(shot, entity),
    );
    const target = survivors[index];
    if (target === undefined || !isShootable(target)) {
      keptShots.push(shot);
      continue;
    }

    const hitPoints = target.hitPoints - 1;
    if (hitPoints <= 0) {
      survivors.splice(index, 1);
      destroyed.push(target);
    } else {
      survivors[index] = { ...target, hitPoints, flashSeconds: HIT_FLASH_SECONDS };
    }
  }

  return { shots: keptShots, entities: survivors, destroyed };
}

function isTearOnDrone(tear: Tear, drone: Drone, droneRadius: number): boolean {
  return (
    isTearActive(tear) &&
    Math.abs(drone.y - tear.y) < tear.height / 2 + droneRadius * TEAR_CONTACT_FACTOR
  );
}

function isBodyOnDrone(entity: Exclude<Entity, Tear | Patch>, drone: Drone, droneRadius: number) {
  const reach = entity.radius * BODY_CONTACT_FACTOR + droneRadius;
  return distanceSquared(entity, drone) < reach ** 2;
}

function isPatchOnDrone(patch: Patch, drone: Drone, droneRadius: number): boolean {
  const reach = patch.radius + droneRadius + PATCH_PICKUP_EXTRA_PIXELS;
  return distanceSquared(patch, drone) < reach ** 2;
}

function collectPatch(stats: RunStats): RunStats {
  if (stats.integrity < STARTING_INTEGRITY) return { ...stats, integrity: stats.integrity + 1 };
  return { ...stats, score: stats.score + PATCH_BONUS_POINTS };
}

function hurtDrone(stats: RunStats): RunStats {
  return {
    ...stats,
    integrity: stats.integrity - 1,
    invulnerableSeconds: INVULNERABLE_SECONDS,
    combo: 0,
    comboSeconds: 0,
  };
}

export function resolveDroneContacts({
  drone,
  entities,
  stats,
  deltaSeconds,
  pixelScale,
}: ContactsInput): ContactsResult {
  const droneRadius = DRONE_RADIUS_PIXEL_UNITS * pixelScale;
  const coolingDown = isValidStep(deltaSeconds)
    ? Math.max(0, stats.invulnerableSeconds - deltaSeconds)
    : stats.invulnerableSeconds;
  let current: RunStats = { ...stats, invulnerableSeconds: coolingDown };
  let hasHurt = false;
  const survivors: Entity[] = [];
  const collectedPatches: Patch[] = [];

  for (const entity of entities) {
    if (entity.kind === 'patch') {
      if (isPatchOnDrone(entity, drone, droneRadius)) {
        collectedPatches.push(entity);
        current = collectPatch(current);
      } else {
        survivors.push(entity);
      }
      continue;
    }

    const canHurt = current.invulnerableSeconds <= 0;
    const isTouching =
      entity.kind === 'tear'
        ? isTearOnDrone(entity, drone, droneRadius)
        : isBodyOnDrone(entity, drone, droneRadius);
    if (!canHurt || !isTouching) {
      survivors.push(entity);
      continue;
    }

    current = hurtDrone(current);
    hasHurt = true;
    if (entity.kind === 'tear' || entity.kind === 'shard') survivors.push(entity);
  }

  return { entities: survivors, stats: current, hasHurt, collectedPatches };
}
