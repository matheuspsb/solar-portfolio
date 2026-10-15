import { STARTING_INTEGRITY } from '../engine/constants';
import type { Rank } from './rank';
import type { RunEnd, RunResult } from './run-result';

const BEST_DIGITS = 6;
const SCORE_LOCALE = 'en-US';

export type ResultStatKey = 'bugs' | 'data' | 'combo' | 'integrity';

export type ResultsView = {
  end: RunEnd;
  scoreText: string;
  isNewBest: boolean;
  rank: Rank;
  stats: { key: ResultStatKey; value: string }[];
  bestText: string;
  reachedRoot: boolean;
  showsRootHint: boolean;
};

export function getResultsView(result: RunResult): ResultsView {
  return {
    end: result.end,
    scoreText: result.score.toLocaleString(SCORE_LOCALE),
    isNewBest: result.isNewBest,
    rank: result.rank,
    stats: [
      { key: 'bugs', value: String(result.bugsSquashed) },
      { key: 'data', value: String(result.dataCleaned) },
      { key: 'combo', value: String(result.maxCombo) },
      { key: 'integrity', value: `${result.integrityLeft}/${STARTING_INTEGRITY}` },
    ],
    bestText: String(Math.max(result.nextBest, result.score)).padStart(BEST_DIGITS, '0'),
    reachedRoot: result.reachedRoot,
    showsRootHint: result.showsRootHint,
  };
}
