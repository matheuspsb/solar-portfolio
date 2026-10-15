import { describe, expect, it, vi } from 'vitest';
import { MATCH_DURATION_SECONDS, STARTING_INTEGRITY } from './constants';
import { createBug, createCorruptedData } from './entities';
import type { Bug, CorruptedData } from './entities';
import {
  applyDestroyed,
  applyLeaks,
  createRunStats,
  getComboMultiplier,
  getRunOutcome,
  tickCombo,
} from './scoring';
import type { RunStats } from './scoring';

const PIXEL_SCALE = 4;
const neverDrops = () => 0.99;
const alwaysDrops = () => 0;

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

function statsWith(overrides: Partial<RunStats>): RunStats {
  return { ...createRunStats(), ...overrides };
}

describe('createRunStats', () => {
  it('starts a clean run with full integrity', () => {
    expect(createRunStats()).toEqual({
      score: 0,
      combo: 0,
      comboSeconds: 0,
      maxCombo: 0,
      bugsSquashed: 0,
      dataCleaned: 0,
      integrity: STARTING_INTEGRITY,
      invulnerableSeconds: 0,
    });
  });
});

describe('getComboMultiplier', () => {
  it.each([
    [0, 1],
    [5, 1],
    [6, 2],
    [11, 2],
    [12, 3],
    [18, 4],
    [24, 5],
    [500, 5],
  ])('gives %s combo a multiplier of %s', (combo, expected) => {
    expect(getComboMultiplier(combo)).toBe(expected);
  });

  it.each([-3, Number.NaN])('falls back to no multiplier for the combo %s', (combo) => {
    expect(getComboMultiplier(combo)).toBe(1);
  });
});

describe('applyDestroyed', () => {
  it('scores a crawler, starts the combo and opens the combo window', () => {
    const { stats, awards } = applyDestroyed({
      stats: createRunStats(),
      destroyed: [crawlerAt(300, 200)],
      random: neverDrops,
      pixelScale: PIXEL_SCALE,
    });
    expect(stats).toMatchObject({ score: 10, combo: 1, maxCombo: 1, bugsSquashed: 1 });
    expect(stats.comboSeconds).toBeGreaterThan(0);
    expect(awards).toEqual([
      { kind: 'crawler', x: 300, y: 200, radius: 16, points: 10, multiplier: 1 },
    ]);
  });

  it('pays beetles and data their own points and counts data apart from bugs', () => {
    const { stats } = applyDestroyed({
      stats: createRunStats(),
      destroyed: [beetleAt(100, 100), dataAt(200, 100)],
      random: neverDrops,
      pixelScale: PIXEL_SCALE,
    });
    expect(stats).toMatchObject({ score: 40 + 25, bugsSquashed: 1, dataCleaned: 1, combo: 2 });
  });

  it('says what kind of target each prize came from', () => {
    const { awards } = applyDestroyed({
      stats: createRunStats(),
      destroyed: [beetleAt(0, 0), dataAt(0, 0), crawlerAt(0, 0)],
      random: neverDrops,
      pixelScale: PIXEL_SCALE,
    });
    expect(awards.map((award) => award.kind)).toEqual(['beetle', 'data', 'crawler']);
  });

  it('applies the multiplier that the combo had before the kill', () => {
    const { stats, awards } = applyDestroyed({
      stats: statsWith({ combo: 6 }),
      destroyed: [crawlerAt(0, 0)],
      random: neverDrops,
      pixelScale: PIXEL_SCALE,
    });
    expect(awards[0]).toMatchObject({ points: 20, multiplier: 2 });
    expect(stats.score).toBe(20);
  });

  it('raises the multiplier in the middle of a group of kills', () => {
    const { awards } = applyDestroyed({
      stats: statsWith({ combo: 5 }),
      destroyed: [crawlerAt(0, 0), crawlerAt(50, 0)],
      random: neverDrops,
      pixelScale: PIXEL_SCALE,
    });
    expect(awards.map((award) => award.multiplier)).toEqual([1, 2]);
  });

  it('remembers the best combo even after the combo is lost', () => {
    const { stats } = applyDestroyed({
      stats: statsWith({ combo: 2, maxCombo: 9 }),
      destroyed: [crawlerAt(0, 0)],
      random: neverDrops,
      pixelScale: PIXEL_SCALE,
    });
    expect(stats.maxCombo).toBe(9);
  });

  it('sometimes drops a patch where the data was destroyed', () => {
    const lucky = applyDestroyed({
      stats: createRunStats(),
      destroyed: [dataAt(321, 123)],
      random: alwaysDrops,
      pixelScale: PIXEL_SCALE,
    });
    expect(lucky.patches).toHaveLength(1);
    expect(lucky.patches[0]).toMatchObject({
      kind: 'patch',
      x: 321,
      y: 123,
      radius: 3 * PIXEL_SCALE,
    });
    const unlucky = applyDestroyed({
      stats: createRunStats(),
      destroyed: [dataAt(321, 123)],
      random: neverDrops,
      pixelScale: PIXEL_SCALE,
    });
    expect(unlucky.patches).toEqual([]);
  });

  it('never drops patches from bugs and does not even roll the dice for them', () => {
    const random = vi.fn(alwaysDrops);
    const { patches } = applyDestroyed({
      stats: createRunStats(),
      destroyed: [crawlerAt(0, 0), beetleAt(0, 0)],
      random,
      pixelScale: PIXEL_SCALE,
    });
    expect(patches).toEqual([]);
    expect(random).not.toHaveBeenCalled();
  });

  it('changes nothing when nothing was destroyed', () => {
    const stats = statsWith({ score: 123, combo: 4 });
    const result = applyDestroyed({
      stats,
      destroyed: [],
      random: alwaysDrops,
      pixelScale: PIXEL_SCALE,
    });
    expect(result.stats).toEqual(stats);
    expect(result.awards).toEqual([]);
    expect(result.patches).toEqual([]);
  });

  it('does not change the stats it was given', () => {
    const stats = createRunStats();
    applyDestroyed({
      stats,
      destroyed: [crawlerAt(0, 0)],
      random: neverDrops,
      pixelScale: PIXEL_SCALE,
    });
    expect(stats.score).toBe(0);
  });
});

describe('applyLeaks', () => {
  it('breaks the combo but keeps the score and the best combo', () => {
    const stats = applyLeaks(statsWith({ score: 500, combo: 8, maxCombo: 8 }), 1);
    expect(stats).toMatchObject({ score: 500, combo: 0, maxCombo: 8 });
  });

  it('leaves the combo alone when nothing leaked', () => {
    const stats = statsWith({ combo: 8 });
    expect(applyLeaks(stats, 0)).toEqual(stats);
  });

  it.each([-1, Number.NaN])('ignores the leak count %s', (leaked) => {
    const stats = statsWith({ combo: 8 });
    expect(applyLeaks(stats, leaked)).toEqual(stats);
  });
});

describe('tickCombo', () => {
  it('counts the window down and keeps the combo while it is open', () => {
    const stats = tickCombo(statsWith({ combo: 5, comboSeconds: 2.4 }), 1);
    expect(stats.combo).toBe(5);
    expect(stats.comboSeconds).toBeCloseTo(1.4);
  });

  it('drops the combo when the window closes', () => {
    const stats = tickCombo(statsWith({ combo: 5, comboSeconds: 0.5 }), 0.5);
    expect(stats.combo).toBe(0);
  });

  it('does nothing without an open window', () => {
    const stats = statsWith({ combo: 0, comboSeconds: 0 });
    expect(tickCombo(stats, 1)).toEqual(stats);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('ignores the step %s', (deltaSeconds) => {
    const stats = statsWith({ combo: 5, comboSeconds: 1 });
    expect(tickCombo(stats, deltaSeconds)).toEqual(stats);
  });
});

describe('getRunOutcome', () => {
  it('keeps running while there is integrity and time', () => {
    expect(getRunOutcome(createRunStats(), 10)).toBe('running');
  });

  it('ends with a deploy when the time is up', () => {
    expect(getRunOutcome(createRunStats(), MATCH_DURATION_SECONDS)).toBe('deploy');
    expect(getRunOutcome(createRunStats(), MATCH_DURATION_SECONDS + 5)).toBe('deploy');
  });

  it('crashes when the integrity is gone, even if the time is up in the same step', () => {
    expect(getRunOutcome(statsWith({ integrity: 0 }), 10)).toBe('crash');
    expect(getRunOutcome(statsWith({ integrity: 0 }), MATCH_DURATION_SECONDS)).toBe('crash');
    expect(getRunOutcome(statsWith({ integrity: -1 }), 10)).toBe('crash');
  });

  it('keeps running when the clock is not a number', () => {
    expect(getRunOutcome(createRunStats(), Number.NaN)).toBe('running');
  });
});
