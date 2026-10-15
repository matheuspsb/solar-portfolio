import {
  BEETLE_HIT_POINTS,
  BEETLE_POINTS,
  CRAWLER_HIT_POINTS,
  CRAWLER_POINTS,
  DATA_HIT_POINTS,
  DATA_POINTS,
  PATCH_FALL_SPEED,
  TEAR_ACTIVE_SECONDS,
  TEAR_WARNING_SECONDS,
} from './constants';

export const DATA_GLYPHS = ['0x', 'ERR', '??', '#!', 'NaN', '404'] as const;

export type BugKind = 'crawler' | 'beetle';

export type Bug = {
  kind: BugKind;
  x: number;
  y: number;
  laneX: number;
  speed: number;
  radius: number;
  hitPoints: number;
  points: number;
  amplitude: number;
  frequency: number;
  phase: number;
  age: number;
  flashSeconds: number;
};

export type CorruptedData = {
  kind: 'data';
  x: number;
  y: number;
  speed: number;
  radius: number;
  hitPoints: number;
  points: number;
  age: number;
  flashSeconds: number;
  glyph: string;
  glyphSeconds: number;
};

export type Shard = {
  kind: 'shard';
  x: number;
  y: number;
  speed: number;
  radius: number;
  age: number;
};

export type Tear = {
  kind: 'tear';
  y: number;
  height: number;
  age: number;
  warningSeconds: number;
  activeSeconds: number;
};

export type Patch = {
  kind: 'patch';
  x: number;
  y: number;
  speed: number;
  radius: number;
  age: number;
};

export type Entity = Bug | CorruptedData | Shard | Tear | Patch;

type BugSpec = {
  kind: BugKind;
  x: number;
  speed: number;
  radius: number;
  amplitude: number;
  frequency: number;
  phase: number;
};

type FallingSpec = { x: number; speed: number; radius: number };

export function createBug(spec: BugSpec): Bug {
  const isBeetle = spec.kind === 'beetle';
  return {
    ...spec,
    y: -spec.radius,
    laneX: spec.x,
    hitPoints: isBeetle ? BEETLE_HIT_POINTS : CRAWLER_HIT_POINTS,
    points: isBeetle ? BEETLE_POINTS : CRAWLER_POINTS,
    age: 0,
    flashSeconds: 0,
  };
}

export function createCorruptedData(spec: FallingSpec): CorruptedData {
  return {
    kind: 'data',
    ...spec,
    y: -spec.radius,
    hitPoints: DATA_HIT_POINTS,
    points: DATA_POINTS,
    age: 0,
    flashSeconds: 0,
    glyph: DATA_GLYPHS[0],
    glyphSeconds: 0,
  };
}

export function createShard(spec: FallingSpec): Shard {
  return { kind: 'shard', ...spec, y: -spec.radius, age: 0 };
}

export function createTear(spec: { y: number; height: number }): Tear {
  return {
    kind: 'tear',
    ...spec,
    age: 0,
    warningSeconds: TEAR_WARNING_SECONDS,
    activeSeconds: TEAR_ACTIVE_SECONDS,
  };
}

export function createPatch(spec: { x: number; y: number; radius: number }): Patch {
  return { kind: 'patch', ...spec, speed: PATCH_FALL_SPEED, age: 0 };
}

export function isTearActive(tear: Tear): boolean {
  return tear.age > tear.warningSeconds;
}

export function isBug(entity: Entity): entity is Bug {
  return entity.kind === 'crawler' || entity.kind === 'beetle';
}
