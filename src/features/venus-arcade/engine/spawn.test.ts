import { describe, expect, it } from 'vitest';
import { isBug } from './entities';
import type { Entity } from './entities';
import { getPixelScale } from './play-field';
import { createSpawnTimers, spawnEntities } from './spawn';
import type { SpawnTimers } from './spawn';

const field = { width: 1000, height: 600 };
const pixelScale = getPixelScale(field.width);
const STEP_SECONDS = 1 / 60;

const middleRandom = () => 0.5;
const lowestRandom = () => 0;
const highestRandom = () => 1;

type Window = {
  startSeconds: number;
  endSeconds: number;
  random?: () => number;
  field?: typeof field;
};

function spawnDuring({
  startSeconds,
  endSeconds,
  random = middleRandom,
  field: fieldOverride = field,
}: Window): Entity[] {
  let timers: SpawnTimers = createSpawnTimers();
  let entities: Entity[] = [];
  for (let elapsed = startSeconds; elapsed < endSeconds; elapsed += STEP_SECONDS) {
    const result = spawnEntities({
      timers,
      entities,
      elapsedSeconds: elapsed,
      deltaSeconds: STEP_SECONDS,
      field: fieldOverride,
      random,
    });
    timers = result.timers;
    entities = [...entities, ...result.spawned];
  }
  return entities;
}

const ofKind = (entities: Entity[], kind: Entity['kind']) =>
  entities.filter((entity) => entity.kind === kind);

describe('spawnEntities timing', () => {
  it('spawns the first bug about half a second in, not before', () => {
    expect(ofKind(spawnDuring({ startSeconds: 0, endSeconds: 0.4 }), 'crawler')).toHaveLength(0);
    expect(
      ofKind(spawnDuring({ startSeconds: 0, endSeconds: 0.7 }), 'crawler').length,
    ).toBeGreaterThan(0);
  });

  it('spawns bugs faster as the match goes on', () => {
    const early = spawnDuring({ startSeconds: 0, endSeconds: 5 });
    const late = spawnDuring({ startSeconds: 40, endSeconds: 45 });
    const bugs = (entities: Entity[]) =>
      ofKind(entities, 'crawler').length + ofKind(entities, 'beetle').length;
    expect(bugs(late)).toBeGreaterThan(bugs(early));
  });

  it('spawns corrupted data every few seconds', () => {
    expect(
      ofKind(spawnDuring({ startSeconds: 0, endSeconds: 10 }), 'data').length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('keeps shards out until the sixth second', () => {
    expect(ofKind(spawnDuring({ startSeconds: 0, endSeconds: 6 }), 'shard')).toHaveLength(0);
    expect(
      ofKind(spawnDuring({ startSeconds: 6, endSeconds: 10 }), 'shard').length,
    ).toBeGreaterThan(0);
  });

  it('keeps tears out until the fourteenth second and allows only one at a time', () => {
    expect(ofKind(spawnDuring({ startSeconds: 0, endSeconds: 14 }), 'tear')).toHaveLength(0);
    expect(ofKind(spawnDuring({ startSeconds: 14, endSeconds: 40 }), 'tear')).toHaveLength(1);
  });

  it('keeps beetles out until the tenth second', () => {
    const beforeTen = spawnDuring({ startSeconds: 0, endSeconds: 10, random: lowestRandom });
    expect(ofKind(beforeTen, 'beetle')).toHaveLength(0);
    const afterTen = spawnDuring({ startSeconds: 10, endSeconds: 15, random: lowestRandom });
    expect(ofKind(afterTen, 'beetle').length).toBeGreaterThan(0);
  });
});

describe('spawnEntities stats', () => {
  it('gives each kind the hit points and points from the rules', () => {
    const entities = spawnDuring({ startSeconds: 12, endSeconds: 30, random: lowestRandom });
    const crawler = spawnDuring({ startSeconds: 0, endSeconds: 2 }).find(
      (entity) => entity.kind === 'crawler',
    );
    expect(crawler).toMatchObject({ hitPoints: 1, points: 10 });
    expect(ofKind(entities, 'beetle')[0]).toMatchObject({ hitPoints: 3, points: 40 });
    expect(ofKind(entities, 'data')[0]).toMatchObject({ hitPoints: 2, points: 25 });
    expect('hitPoints' in ofKind(entities, 'shard')[0]!).toBe(false);
  });

  it('sizes the sprites by the pixel scale', () => {
    const entities = spawnDuring({ startSeconds: 12, endSeconds: 30, random: lowestRandom });
    expect(ofKind(entities, 'beetle')[0]).toMatchObject({ radius: 5.5 * pixelScale });
    expect(ofKind(entities, 'data')[0]).toMatchObject({ radius: 4.5 * pixelScale });
    expect(ofKind(entities, 'shard')[0]).toMatchObject({ radius: 3.5 * pixelScale });
  });

  it('makes bugs fall faster as the difficulty rises', () => {
    const speedOfFirstCrawler = (startSeconds: number, endSeconds: number) => {
      const crawler = spawnDuring({ startSeconds, endSeconds }).find(isBug);
      if (!crawler) throw new Error('a crawler should have spawned');
      return crawler.speed;
    };
    expect(speedOfFirstCrawler(44, 45)).toBeGreaterThan(speedOfFirstCrawler(0, 2));
  });

  it.each([
    ['lowest', lowestRandom],
    ['highest', highestRandom],
  ])('keeps every spawned entity inside the field with the %s random value', (_name, random) => {
    const entities = spawnDuring({ startSeconds: 0, endSeconds: 45, random });
    expect(entities.length).toBeGreaterThan(0);
    for (const entity of entities) {
      if (entity.kind === 'tear') {
        expect(entity.y).toBeGreaterThanOrEqual(0);
        expect(entity.y).toBeLessThanOrEqual(field.height);
      } else {
        expect(entity.x).toBeGreaterThanOrEqual(0);
        expect(entity.x).toBeLessThanOrEqual(field.width);
      }
    }
  });

  it('copes with a field narrower than a sprite', () => {
    const entities = spawnDuring({
      startSeconds: 0,
      endSeconds: 20,
      field: { width: 20, height: 300 },
    });
    for (const entity of entities) {
      if (entity.kind !== 'tear') expect(Number.isFinite(entity.x)).toBe(true);
    }
  });
});

describe('spawnEntities with odd time steps', () => {
  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'does nothing on the step %s',
    (deltaSeconds) => {
      const timers = createSpawnTimers();
      const result = spawnEntities({
        timers,
        entities: [],
        elapsedSeconds: 20,
        deltaSeconds,
        field,
        random: middleRandom,
      });
      expect(result.spawned).toEqual([]);
      expect(result.timers).toEqual(timers);
    },
  );

  it('spawns at most one of each kind after a huge pause', () => {
    const result = spawnEntities({
      timers: createSpawnTimers(),
      entities: [],
      elapsedSeconds: 20,
      deltaSeconds: 3600,
      field,
      random: middleRandom,
    });
    for (const kind of ['crawler', 'data', 'shard', 'tear'] as const) {
      expect(ofKind(result.spawned, kind).length).toBeLessThanOrEqual(1);
    }
    expect(result.spawned.length).toBeGreaterThan(0);
  });
});
