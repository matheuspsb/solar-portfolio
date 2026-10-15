import { describe, expect, it } from 'vitest';
import { createRunStats } from '../engine/scoring';
import type { RunStats } from '../engine/scoring';
import { buildRunResult } from './run-result';
import type { RunResult } from './run-result';

function statsWith(overrides: Partial<RunStats>): RunStats {
  return { ...createRunStats(), ...overrides };
}

function resultFor(overrides: Partial<Parameters<typeof buildRunResult>[0]> = {}): RunResult {
  return buildRunResult({
    stats: statsWith({ score: 1000 }),
    end: 'deploy',
    previousBest: 0,
    ...overrides,
  });
}

describe('buildRunResult summary', () => {
  it('copies what the results screen shows from the run', () => {
    const result = resultFor({
      stats: statsWith({
        score: 2400,
        bugsSquashed: 61,
        dataCleaned: 12,
        maxCombo: 23,
        integrity: 2,
      }),
      end: 'crash',
    });
    expect(result).toMatchObject({
      end: 'crash',
      score: 2400,
      bugsSquashed: 61,
      dataCleaned: 12,
      maxCombo: 23,
      integrityLeft: 2,
    });
  });

  it('reports the rank of the score', () => {
    expect(resultFor({ stats: statsWith({ score: 800 }) }).rank.minimumScore).toBe(800);
  });

  it('never reports negative integrity', () => {
    expect(resultFor({ stats: statsWith({ integrity: -1 }) }).integrityLeft).toBe(0);
  });

  it.each([-50, Number.NaN])('treats the score %s as zero', (score) => {
    const result = resultFor({ stats: statsWith({ score }) });
    expect(result.score).toBe(0);
    expect(result.rank.minimumScore).toBe(0);
  });
});

describe('buildRunResult best score', () => {
  it('flags a new best only when the score beats the old one', () => {
    expect(resultFor({ previousBest: 500 }).isNewBest).toBe(true);
    expect(resultFor({ previousBest: 1000 }).isNewBest).toBe(false);
    expect(resultFor({ previousBest: 5000 }).isNewBest).toBe(false);
  });

  it('does not celebrate a zero score as a new best', () => {
    expect(resultFor({ stats: statsWith({ score: 0 }), previousBest: 0 }).isNewBest).toBe(false);
  });

  it('keeps the higher of the two as the best from now on', () => {
    expect(resultFor({ previousBest: 500 }).nextBest).toBe(1000);
    expect(resultFor({ previousBest: 9000 }).nextBest).toBe(9000);
  });

  it('survives a broken previous best', () => {
    expect(resultFor({ previousBest: Number.NaN }).nextBest).toBe(1000);
    expect(resultFor({ previousBest: Number.NaN }).isNewBest).toBe(true);
  });
});

describe('buildRunResult root cartridge', () => {
  it('reaches the root cartridge at the root score and not a point before', () => {
    expect(resultFor({ stats: statsWith({ score: 4999 }) }).reachedRoot).toBe(false);
    expect(resultFor({ stats: statsWith({ score: 5000 }) }).reachedRoot).toBe(true);
  });

  it('hints at the sealed cartridge from 60% of the root score up to the root score', () => {
    expect(resultFor({ stats: statsWith({ score: 2999 }) }).showsRootHint).toBe(false);
    expect(resultFor({ stats: statsWith({ score: 3000 }) }).showsRootHint).toBe(true);
    expect(resultFor({ stats: statsWith({ score: 4999 }) }).showsRootHint).toBe(true);
    expect(resultFor({ stats: statsWith({ score: 5000 }) }).showsRootHint).toBe(false);
  });

  it('follows a calibrated root score', () => {
    const result = (score: number) => resultFor({ stats: statsWith({ score }), rootScore: 1000 });
    expect(result(599).showsRootHint).toBe(false);
    expect(result(600).showsRootHint).toBe(true);
    expect(result(1000).reachedRoot).toBe(true);
  });
});
