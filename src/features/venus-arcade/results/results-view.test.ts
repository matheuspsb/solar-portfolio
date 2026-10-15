import { describe, expect, it } from 'vitest';
import { STARTING_INTEGRITY } from '../engine/constants';
import { createRunStats } from '../engine/scoring';
import type { RunStats } from '../engine/scoring';
import { buildRunResult } from './run-result';
import type { RunResult } from './run-result';
import { getResultsView } from './results-view';

function resultFor(stats: Partial<RunStats>, overrides: Partial<RunResult> = {}): RunResult {
  const result = buildRunResult({
    stats: { ...createRunStats(), ...stats },
    end: 'deploy',
    mode: 'standard',
    previousBest: 0,
  });
  return { ...result, ...overrides };
}

describe('getResultsView', () => {
  it('groups the thousands of the score', () => {
    expect(getResultsView(resultFor({ score: 12345 })).scoreText).toBe('12,345');
    expect(getResultsView(resultFor({ score: 0 })).scoreText).toBe('0');
  });

  it('lists the four numbers of the run in order, with the integrity as a fraction', () => {
    const view = getResultsView(
      resultFor({ score: 900, bugsSquashed: 61, dataCleaned: 12, maxCombo: 23, integrity: 2 }),
    );
    expect(view.stats.map((stat) => stat.value)).toEqual([
      '61',
      '12',
      '23',
      `2/${STARTING_INTEGRITY}`,
    ]);
  });

  it('pads the best score to six digits and never shows less than the score reached', () => {
    expect(getResultsView(resultFor({ score: 900 })).bestText).toBe('000900');
    expect(getResultsView(resultFor({ score: 300 }, { nextBest: 4200 })).bestText).toBe('004200');
  });

  it('only shows the sealed-cartridge hint when the score came close but did not unlock it', () => {
    expect(getResultsView(resultFor({ score: 3200 })).showsRootHint).toBe(true);
    expect(getResultsView(resultFor({ score: 100 })).showsRootHint).toBe(false);
    expect(getResultsView(resultFor({ score: 6000 })).showsRootHint).toBe(false);
  });

  it('carries the end, the new best flag, the rank and whether root was reached', () => {
    const result = resultFor({ score: 6000 }, { end: 'crash' });
    expect(getResultsView(result)).toMatchObject({
      end: 'crash',
      isNewBest: true,
      reachedRoot: true,
      rank: result.rank,
    });
  });
});
