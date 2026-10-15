import { mix } from '@/lib/math';
import {
  BEETLES_START_SECONDS,
  BEETLE_AMPLITUDE_RANGE,
  BEETLE_BASE_CHANCE,
  BEETLE_CHANCE_GAIN,
  BEETLE_FREQUENCY_RANGE,
  BEETLE_RADIUS_PIXEL_UNITS,
  BEETLE_SPEED,
  BUG_INTERVAL_SECONDS,
  CRAWLER_AMPLITUDE_RANGE,
  CRAWLER_FREQUENCY_RANGE,
  CRAWLER_RADIUS_PIXEL_UNITS,
  CRAWLER_SPEED,
  DATA_INTERVAL_SECONDS,
  DATA_RADIUS_PIXEL_UNITS,
  DATA_SPEED_RANGE,
  FIRST_BUG_SECONDS,
  FIRST_DATA_SECONDS,
  FIRST_SHARD_SECONDS,
  FIRST_TEAR_SECONDS,
  LANE_MARGIN_PIXELS,
  PHASE_RANGE_RADIANS,
  SHARDS_START_SECONDS,
  SHARD_INTERVAL_SECONDS,
  SHARD_RADIUS_PIXEL_UNITS,
  SHARD_SPEED,
  TEARS_START_SECONDS,
  TEAR_BOTTOM_RATIO,
  TEAR_HEIGHT_PIXEL_UNITS,
  TEAR_INTERVAL_SECONDS,
  TEAR_TOP_RATIO,
} from './constants';
import { getDifficulty } from './difficulty';
import { createBug, createCorruptedData, createShard, createTear } from './entities';
import type { BugKind, Entity } from './entities';
import { getPixelScale } from './play-field';
import type { PlayField } from './play-field';
import { randomBetween } from './random';
import type { Random } from './random';
import { isValidStep } from './time-step';

export type SpawnTimers = {
  bugSeconds: number;
  dataSeconds: number;
  shardSeconds: number;
  tearSeconds: number;
};

type SpawnInput = {
  timers: SpawnTimers;
  entities: readonly Entity[];
  elapsedSeconds: number;
  deltaSeconds: number;
  field: PlayField;
  random: Random;
};

type SpawnResult = { timers: SpawnTimers; spawned: Entity[] };

type Interval = { start: number; end: number; jitter?: readonly [number, number] };

type Range = readonly [number, number];

export function createSpawnTimers(): SpawnTimers {
  return {
    bugSeconds: FIRST_BUG_SECONDS,
    dataSeconds: FIRST_DATA_SECONDS,
    shardSeconds: FIRST_SHARD_SECONDS,
    tearSeconds: FIRST_TEAR_SECONDS,
  };
}

function nextInterval(interval: Interval, difficulty: number, random: Random): number {
  const base = mix(interval.start, interval.end, difficulty);
  if (!interval.jitter) return base;
  return base * randomBetween(random, interval.jitter[0], interval.jitter[1]);
}

function inRange(random: Random, range: Range): number {
  return randomBetween(random, range[0], range[1]);
}

function randomLaneX(random: Random, width: number, radius: number, margin: number): number {
  const minimum = radius + margin;
  const maximum = width - radius - margin;
  if (minimum > maximum) return width / 2;
  return randomBetween(random, minimum, maximum);
}

function spawnBug(input: SpawnInput, difficulty: number): Entity {
  const { random, field, elapsedSeconds } = input;
  const pixelScale = getPixelScale(field.width);
  const beetleChance = BEETLE_BASE_CHANCE + BEETLE_CHANCE_GAIN * difficulty;
  const kind: BugKind =
    elapsedSeconds > BEETLES_START_SECONDS && random() < beetleChance ? 'beetle' : 'crawler';
  const isBeetle = kind === 'beetle';
  const radius = (isBeetle ? BEETLE_RADIUS_PIXEL_UNITS : CRAWLER_RADIUS_PIXEL_UNITS) * pixelScale;
  const speedSpec = isBeetle ? BEETLE_SPEED : CRAWLER_SPEED;
  return createBug({
    kind,
    x: randomLaneX(random, field.width, radius, LANE_MARGIN_PIXELS),
    speed: mix(speedSpec.start, speedSpec.end, difficulty) * inRange(random, speedSpec.jitter),
    radius,
    amplitude: inRange(random, isBeetle ? BEETLE_AMPLITUDE_RANGE : CRAWLER_AMPLITUDE_RANGE),
    frequency: inRange(random, isBeetle ? BEETLE_FREQUENCY_RANGE : CRAWLER_FREQUENCY_RANGE),
    phase: inRange(random, PHASE_RANGE_RADIANS),
  });
}

function spawnData(input: SpawnInput): Entity {
  const { random, field } = input;
  const radius = DATA_RADIUS_PIXEL_UNITS * getPixelScale(field.width);
  return createCorruptedData({
    x: randomLaneX(random, field.width, radius, LANE_MARGIN_PIXELS),
    speed: inRange(random, DATA_SPEED_RANGE),
    radius,
  });
}

function spawnShard(input: SpawnInput, difficulty: number): Entity {
  const { random, field } = input;
  const radius = SHARD_RADIUS_PIXEL_UNITS * getPixelScale(field.width);
  return createShard({
    x: randomLaneX(random, field.width, radius, 0),
    speed: mix(SHARD_SPEED.start, SHARD_SPEED.end, difficulty),
    radius,
  });
}

function spawnTear(input: SpawnInput): Entity {
  const { random, field } = input;
  return createTear({
    y: randomBetween(random, field.height * TEAR_TOP_RATIO, field.height * TEAR_BOTTOM_RATIO),
    height: TEAR_HEIGHT_PIXEL_UNITS * getPixelScale(field.width),
  });
}

export function spawnEntities(input: SpawnInput): SpawnResult {
  const { timers, elapsedSeconds, deltaSeconds, random } = input;
  if (!isValidStep(deltaSeconds)) return { timers, spawned: [] };

  const difficulty = getDifficulty(elapsedSeconds);
  const spawned: Entity[] = [];
  const next = { ...timers };

  next.bugSeconds -= deltaSeconds;
  if (next.bugSeconds <= 0) {
    next.bugSeconds = nextInterval(BUG_INTERVAL_SECONDS, difficulty, random);
    spawned.push(spawnBug(input, difficulty));
  }

  next.dataSeconds -= deltaSeconds;
  if (next.dataSeconds <= 0) {
    next.dataSeconds = nextInterval(DATA_INTERVAL_SECONDS, difficulty, random);
    spawned.push(spawnData(input));
  }

  if (elapsedSeconds > SHARDS_START_SECONDS) {
    next.shardSeconds -= deltaSeconds;
    if (next.shardSeconds <= 0) {
      next.shardSeconds = nextInterval(SHARD_INTERVAL_SECONDS, difficulty, random);
      spawned.push(spawnShard(input, difficulty));
    }
  }

  const hasTear = input.entities.some((entity) => entity.kind === 'tear');
  if (elapsedSeconds > TEARS_START_SECONDS) {
    next.tearSeconds -= deltaSeconds;
    if (next.tearSeconds <= 0 && !hasTear) {
      next.tearSeconds = nextInterval(TEAR_INTERVAL_SECONDS, difficulty, random);
      spawned.push(spawnTear(input));
    }
  }

  return { timers: next, spawned };
}
