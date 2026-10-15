import { ROOT_HINT_RATIO, ROOT_SCORE } from '../engine/constants';
import type { RunStats } from '../engine/scoring';
import type { FireMode } from '../engine/shots';
import { getRank } from './rank';
import type { Rank } from './rank';

export type RunEnd = 'deploy' | 'crash';

export type RunResult = {
  end: RunEnd;
  mode: FireMode;
  score: number;
  bugsSquashed: number;
  dataCleaned: number;
  maxCombo: number;
  integrityLeft: number;
  rank: Rank;
  isNewBest: boolean;
  nextBest: number;
  reachedRoot: boolean;
  showsRootHint: boolean;
};

type BuildRunResultInput = {
  stats: RunStats;
  end: RunEnd;
  mode: FireMode;
  previousBest: number;
  rootScore?: number;
};

function toSafeScore(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function buildRunResult({
  stats,
  end,
  mode,
  previousBest,
  rootScore = ROOT_SCORE,
}: BuildRunResultInput): RunResult {
  const score = toSafeScore(stats.score);
  const best = toSafeScore(previousBest);
  const reachedRoot = score >= rootScore;

  return {
    end,
    mode,
    score,
    bugsSquashed: stats.bugsSquashed,
    dataCleaned: stats.dataCleaned,
    maxCombo: stats.maxCombo,
    integrityLeft: Math.max(0, stats.integrity),
    rank: getRank(score),
    isNewBest: score > best,
    nextBest: Math.max(best, score),
    reachedRoot,
    showsRootHint: !reachedRoot && score >= rootScore * ROOT_HINT_RATIO,
  };
}
