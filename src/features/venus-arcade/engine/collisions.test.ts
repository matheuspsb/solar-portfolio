import { describe, expect, it } from 'vitest';
import { resolveDroneContacts, resolveShotHits } from './collisions';
import { INVULNERABLE_SECONDS, STARTING_INTEGRITY } from './constants';
import { createBug, createCorruptedData, createPatch, createShard, createTear } from './entities';
import type { Bug, CorruptedData, Entity } from './entities';
import { createRunStats } from './scoring';
import type { RunStats } from './scoring';
import type { Shot } from './shots';

const PIXEL_SCALE = 4;
const droneRadius = 3.2 * PIXEL_SCALE;
const drone = { x: 500, y: 450, targetX: 500, targetY: 450 };

function crawlerAt(positionX: number, positionY: number): Bug {
  return {
    ...createBug({
      kind: 'crawler',
      x: positionX,
      speed: 100,
      radius: 16,
      amplitude: 0,
      frequency: 1,
      phase: 0,
    }),
    y: positionY,
  };
}

function beetleAt(positionX: number, positionY: number): Bug {
  return {
    ...createBug({
      kind: 'beetle',
      x: positionX,
      speed: 60,
      radius: 22,
      amplitude: 0,
      frequency: 1,
      phase: 0,
    }),
    y: positionY,
  };
}

function dataAt(positionX: number, positionY: number): CorruptedData {
  return { ...createCorruptedData({ x: positionX, speed: 50, radius: 18 }), y: positionY };
}

function shotAt(positionX: number, positionY: number): Shot {
  return { x: positionX, y: positionY, vx: 0, vy: -780 };
}

function statsWith(overrides: Partial<RunStats>): RunStats {
  return { ...createRunStats(), ...overrides };
}

describe('resolveShotHits', () => {
  it('spends the shot and destroys a one-hit bug it touches', () => {
    const crawler = crawlerAt(300, 200);
    const result = resolveShotHits({ shots: [shotAt(300, 200)], entities: [crawler] });
    expect(result.shots).toEqual([]);
    expect(result.entities).toEqual([]);
    expect(result.destroyed).toEqual([crawler]);
  });

  it('wounds a beetle three times before it dies, flashing on each hit', () => {
    let entities: Entity[] = [beetleAt(300, 200)];
    for (const expectedHitPoints of [2, 1]) {
      const result = resolveShotHits({ shots: [shotAt(300, 200)], entities });
      entities = result.entities;
      expect(result.destroyed).toEqual([]);
      expect(entities[0]).toMatchObject({ hitPoints: expectedHitPoints, flashSeconds: 0.08 });
    }
    const last = resolveShotHits({ shots: [shotAt(300, 200)], entities });
    expect(last.entities).toEqual([]);
    expect(last.destroyed).toHaveLength(1);
  });

  it('lets two shots in the same step finish corrupted data', () => {
    const result = resolveShotHits({
      shots: [shotAt(300, 200), shotAt(302, 200)],
      entities: [dataAt(300, 200)],
    });
    expect(result.destroyed).toHaveLength(1);
    expect(result.shots).toEqual([]);
  });

  it('spends a shot on a single target even when two overlap', () => {
    const result = resolveShotHits({
      shots: [shotAt(300, 200)],
      entities: [crawlerAt(300, 200), crawlerAt(305, 200)],
    });
    expect(result.destroyed).toHaveLength(1);
    expect(result.entities).toHaveLength(1);
  });

  it('keeps the shots that miss and does not touch the entities', () => {
    const entities = [crawlerAt(300, 200)];
    const result = resolveShotHits({ shots: [shotAt(600, 200)], entities });
    expect(result.shots).toHaveLength(1);
    expect(result.entities).toEqual(entities);
    expect(result.destroyed).toEqual([]);
  });

  it('touches only when the distance is under the radius plus the shot size', () => {
    const crawler = crawlerAt(300, 200);
    expect(
      resolveShotHits({ shots: [shotAt(300 + 18, 200)], entities: [crawler] }).destroyed,
    ).toHaveLength(1);
    expect(
      resolveShotHits({ shots: [shotAt(300 + 19.5, 200)], entities: [crawler] }).destroyed,
    ).toHaveLength(0);
  });

  it('flies through shards, tears and patches', () => {
    const entities: Entity[] = [
      { ...createShard({ x: 300, speed: 200, radius: 14 }), y: 200 },
      { ...createTear({ y: 200, height: 28 }), age: 1.5 },
      createPatch({ x: 300, y: 200, radius: 12 }),
    ];
    const result = resolveShotHits({ shots: [shotAt(300, 200)], entities });
    expect(result.shots).toHaveLength(1);
    expect(result.entities).toEqual(entities);
  });

  it('copes with no shots and no entities', () => {
    expect(resolveShotHits({ shots: [], entities: [] })).toEqual({
      shots: [],
      entities: [],
      destroyed: [],
    });
  });

  it('does not change the lists it was given', () => {
    const crawler = crawlerAt(300, 200);
    const shots = [shotAt(300, 200)];
    const entities = [crawler];
    resolveShotHits({ shots, entities });
    expect(shots).toHaveLength(1);
    expect(entities).toEqual([crawler]);
    expect(crawler.hitPoints).toBe(1);
  });
});

describe('resolveDroneContacts', () => {
  const touchDistance = 16 * 0.8 + droneRadius;

  function contact(entities: Entity[], stats = createRunStats(), deltaSeconds = 1 / 60) {
    return resolveDroneContacts({ drone, entities, stats, deltaSeconds, pixelScale: PIXEL_SCALE });
  }

  it('hurts the drone, breaks the combo, grants invulnerability and removes the bug', () => {
    const result = contact([crawlerAt(500, 450)], statsWith({ combo: 9 }));
    expect(result.hasHurt).toBe(true);
    expect(result.stats).toMatchObject({
      integrity: STARTING_INTEGRITY - 1,
      combo: 0,
      invulnerableSeconds: INVULNERABLE_SECONDS,
    });
    expect(result.entities).toEqual([]);
  });

  it('does not touch an entity that is out of reach', () => {
    const entities = [crawlerAt(500 + touchDistance + 1, 450)];
    const result = contact(entities);
    expect(result.hasHurt).toBe(false);
    expect(result.stats).toEqual(createRunStats());
    expect(result.entities).toEqual(entities);
  });

  it('hurts only once per step even with two bugs on top of the drone', () => {
    const result = contact([crawlerAt(500, 450), beetleAt(505, 450)]);
    expect(result.stats.integrity).toBe(STARTING_INTEGRITY - 1);
    expect(result.entities).toHaveLength(1);
  });

  it('leaves everything alone while the drone is invulnerable', () => {
    const entities = [crawlerAt(500, 450)];
    const result = contact(entities, statsWith({ invulnerableSeconds: 1 }));
    expect(result.hasHurt).toBe(false);
    expect(result.stats.integrity).toBe(STARTING_INTEGRITY);
    expect(result.entities).toEqual(entities);
  });

  it('counts the invulnerability down before looking at the contacts', () => {
    const almostOver = statsWith({ invulnerableSeconds: 0.01 });
    const result = contact([crawlerAt(500, 450)], almostOver, 0.05);
    expect(result.hasHurt).toBe(true);
  });

  it('lets a shard hurt the drone without breaking the shard', () => {
    const shard = { ...createShard({ x: 500, speed: 200, radius: 14 }), y: 450 };
    const result = contact([shard]);
    expect(result.hasHurt).toBe(true);
    expect(result.entities).toEqual([shard]);
  });

  it('lets an active tear hurt the drone only inside its band', () => {
    const active = { ...createTear({ y: 450, height: 28 }), age: 1.5 };
    expect(contact([active]).hasHurt).toBe(true);
    const farAway = { ...active, y: 300 };
    expect(contact([farAway]).hasHurt).toBe(false);
  });

  it('does not hurt with a tear that is only a warning', () => {
    const warning = { ...createTear({ y: 450, height: 28 }), age: 0.3 };
    expect(contact([warning]).hasHurt).toBe(false);
  });

  it('restores one integrity when a patch is collected after a hit', () => {
    const patch = createPatch({ x: 500, y: 450, radius: 12 });
    const result = contact([patch], statsWith({ integrity: 2 }));
    expect(result.stats.integrity).toBe(3);
    expect(result.collectedPatches).toEqual([patch]);
    expect(result.entities).toEqual([]);
  });

  it('pays 50 points instead when the integrity is already full, without the multiplier', () => {
    const patch = createPatch({ x: 500, y: 450, radius: 12 });
    const result = contact([patch], statsWith({ integrity: 3, combo: 12 }));
    expect(result.stats).toMatchObject({ integrity: 3, score: 50 });
  });

  it('collects a patch from a bit further away than a bug can hurt', () => {
    const patch = createPatch({ x: 500 + 12 + droneRadius + 7, y: 450, radius: 12 });
    expect(contact([patch], statsWith({ integrity: 2 })).collectedPatches).toHaveLength(1);
    const tooFar = createPatch({ x: 500 + 12 + droneRadius + 9, y: 450, radius: 12 });
    expect(contact([tooFar], statsWith({ integrity: 2 })).collectedPatches).toHaveLength(0);
  });

  it('collects a patch even while invulnerable, and even in the step the drone was hurt', () => {
    const patch = createPatch({ x: 500, y: 450, radius: 12 });
    const whileInvulnerable = contact([patch], statsWith({ integrity: 2, invulnerableSeconds: 1 }));
    expect(whileInvulnerable.stats.integrity).toBe(3);
    const sameStep = contact([crawlerAt(500, 450), patch], statsWith({ integrity: 3 }));
    expect(sameStep.hasHurt).toBe(true);
    expect(sameStep.collectedPatches).toHaveLength(1);
  });

  it('copes with no entities', () => {
    const result = contact([]);
    expect(result.entities).toEqual([]);
    expect(result.hasHurt).toBe(false);
  });

  it('does not change the stats or the entities it was given', () => {
    const stats = createRunStats();
    const crawler = crawlerAt(500, 450);
    const entities = [crawler];
    contact(entities, stats);
    expect(stats.integrity).toBe(STARTING_INTEGRITY);
    expect(entities).toEqual([crawler]);
  });
});
