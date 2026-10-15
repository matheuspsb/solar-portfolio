import { describe, expect, it } from 'vitest';
import { advanceEntities } from './entity-motion';
import {
  DATA_GLYPHS,
  createBug,
  createCorruptedData,
  createPatch,
  createShard,
  createTear,
  isBug,
  isTearActive,
} from './entities';
import type { Entity } from './entities';

const field = { width: 1000, height: 600 };
const middleRandom = () => 0.5;

function advance(entities: Entity[], deltaSeconds: number, random = middleRandom) {
  return advanceEntities({ entities, deltaSeconds, field, random });
}

function makeCrawler(overrides: Partial<Parameters<typeof createBug>[0]> = {}) {
  return createBug({
    kind: 'crawler',
    x: 500,
    speed: 100,
    radius: 16,
    amplitude: 0,
    frequency: 2,
    phase: 0,
    ...overrides,
  });
}

describe('advanceEntities with bugs', () => {
  it('lowers a bug by its speed', () => {
    const { entities } = advance([makeCrawler()], 0.5);
    expect(entities[0]).toMatchObject({ y: expect.closeTo(-16 + 50, 5) });
  });

  it('weaves around its lane and never leaves the field', () => {
    let entities: Entity[] = [makeCrawler({ x: 20, amplitude: 400, speed: 10 })];
    for (let frame = 0; frame < 200; frame += 1) {
      entities = advance(entities, 1 / 60).entities;
      const [bug] = entities;
      if (!bug || !isBug(bug)) throw new Error('the crawler should still be on screen');
      expect(bug.x).toBeGreaterThanOrEqual(16);
      expect(bug.x).toBeLessThanOrEqual(984);
    }
  });

  it('removes a bug that passes the bottom and reports it as a leak', () => {
    const lowBug = { ...makeCrawler(), y: 595 };
    const result = advance([lowBug], 1);
    expect(result.entities).toHaveLength(0);
    expect(result.leakedBugs).toBe(1);
  });

  it('counts a leaking beetle too', () => {
    const lowBeetle = {
      ...createBug({
        kind: 'beetle',
        x: 500,
        speed: 100,
        radius: 22,
        amplitude: 0,
        frequency: 1,
        phase: 0,
      }),
      y: 599,
    };
    expect(advance([lowBeetle], 1).leakedBugs).toBe(1);
  });

  it('counts every bug that leaks in the same step', () => {
    const lowBugs = [
      { ...makeCrawler(), y: 595 },
      { ...makeCrawler({ x: 200 }), y: 595 },
    ];
    expect(advance(lowBugs, 1).leakedBugs).toBe(2);
  });
});

describe('advanceEntities with corrupted data', () => {
  it('falls slowly and is removed below the bottom without counting as a leak', () => {
    const data = { ...createCorruptedData({ x: 300, speed: 50, radius: 18 }), y: 640 };
    const result = advance([data], 1);
    expect(result.entities).toHaveLength(0);
    expect(result.leakedBugs).toBe(0);
  });

  it('keeps swapping its glyph among the known ones', () => {
    let entities: Entity[] = [createCorruptedData({ x: 300, speed: 5, radius: 18 })];
    const seen = new Set<string>();
    let sequence = 0;
    const walkingRandom = () => {
      sequence = (sequence + 0.17) % 1;
      return sequence;
    };
    for (let frame = 0; frame < 600; frame += 1) {
      entities = advance(entities, 1 / 60, walkingRandom).entities;
      const [data] = entities;
      if (data?.kind === 'data') seen.add(data.glyph);
    }
    expect(seen.size).toBeGreaterThan(1);
    for (const glyph of seen) expect(DATA_GLYPHS).toContain(glyph);
  });
});

describe('advanceEntities with shards and patches', () => {
  it('drops a shard and removes it once it is well below the bottom', () => {
    const shard = createShard({ x: 400, speed: 300, radius: 14 });
    expect(advance([shard], 0.1).entities[0]).toMatchObject({ y: expect.closeTo(-14 + 30, 5) });
    const gone = advance([{ ...shard, y: 620 }], 0.1);
    expect(gone.entities).toHaveLength(0);
  });

  it('drops a patch at its own speed', () => {
    const patch = createPatch({ x: 400, y: 100, radius: 12 });
    expect(advance([patch], 1).entities[0]).toMatchObject({ y: 190 });
  });
});

describe('advanceEntities with tears', () => {
  it('warns first, becomes active after the warning and disappears after its life', () => {
    const tear = createTear({ y: 300, height: 28 });
    expect(isTearActive(tear)).toBe(false);
    const warning = advance([tear], 0.5).entities[0]!;
    expect(warning.kind === 'tear' && isTearActive(warning)).toBe(false);
    const active = advance([warning], 0.5).entities[0]!;
    expect(active.kind === 'tear' && isTearActive(active)).toBe(true);
    expect(advance([active], 1.2).entities).toHaveLength(0);
  });

  it('does not move while it lasts', () => {
    const tear = createTear({ y: 300, height: 28 });
    expect(advance([tear], 0.5).entities[0]).toMatchObject({ y: 300 });
  });
});

describe('advanceEntities flash timer', () => {
  it('counts the hit flash down and stops at zero', () => {
    const flashing = { ...makeCrawler(), flashSeconds: 0.08 };
    const once = advance([flashing], 0.05).entities[0]!;
    expect(once.kind === 'crawler' && once.flashSeconds).toBeCloseTo(0.03);
    const twice = advance([once], 0.5).entities[0]!;
    expect(twice.kind === 'crawler' && twice.flashSeconds).toBe(0);
  });
});

describe('advanceEntities with odd input', () => {
  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'leaves everything alone on the step %s',
    (deltaSeconds) => {
      const entities = [makeCrawler(), createTear({ y: 300, height: 28 })];
      const result = advance(entities, deltaSeconds);
      expect(result.entities).toEqual(entities);
      expect(result.leakedBugs).toBe(0);
    },
  );

  it('handles an empty list', () => {
    expect(advance([], 1)).toEqual({ entities: [], leakedBugs: 0 });
  });

  it('does not change the list it was given', () => {
    const crawler = makeCrawler();
    advance([crawler], 1);
    expect(crawler.y).toBe(-16);
  });
});
