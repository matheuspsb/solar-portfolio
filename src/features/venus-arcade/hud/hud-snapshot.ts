import { clamp } from '@/lib/math';
import { MATCH_DURATION_SECONDS, STARTING_INTEGRITY, URGENT_SECONDS } from '../engine/constants';
import { getComboMultiplier } from '../engine/scoring';
import { getCountdownLabel } from '../session/countdown';
import type { CountdownLabel } from '../session/countdown';
import type { GameSession, SessionPhase } from '../session/session';
import type { RunEnd, RunResult } from '../results/run-result';

const SCORE_DIGITS = 6;
const MAX_SCORE_SHOWN = 999_999;

export type HudSnapshot = {
  scoreText: string;
  combo: number;
  multiplier: number;
  showsMultiplier: boolean;
  secondsLeft: number;
  timeRatio: number;
  isUrgent: boolean;
  integrity: number;
  phase: SessionPhase;
  countdownLabel: CountdownLabel | null;
  end: RunEnd | null;
  result: RunResult | null;
};

function toShownScore(score: number): string {
  const safeScore = Number.isFinite(score) ? clamp(score, 0, MAX_SCORE_SHOWN) : 0;
  return String(Math.floor(safeScore)).padStart(SCORE_DIGITS, '0');
}

export function getHudSnapshot(session: GameSession): HudSnapshot {
  const { stats } = session;
  const elapsed = Number.isNaN(session.elapsedSeconds) ? 0 : Math.max(0, session.elapsedSeconds);
  const secondsLeft = Math.max(0, Math.ceil(MATCH_DURATION_SECONDS - elapsed));
  const multiplier = getComboMultiplier(stats.combo);

  return {
    scoreText: toShownScore(stats.score),
    combo: stats.combo,
    multiplier,
    showsMultiplier: multiplier > 1,
    secondsLeft,
    timeRatio: secondsLeft / MATCH_DURATION_SECONDS,
    isUrgent: secondsLeft <= URGENT_SECONDS,
    integrity: clamp(stats.integrity, 0, STARTING_INTEGRITY),
    phase: session.phase,
    countdownLabel:
      session.phase === 'countdown' ? getCountdownLabel(session.countdownSeconds) : null,
    end: session.end,
    result: session.result,
  };
}

export function isSameHudSnapshot(first: HudSnapshot, second: HudSnapshot): boolean {
  return (
    first.scoreText === second.scoreText &&
    first.combo === second.combo &&
    first.secondsLeft === second.secondsLeft &&
    first.integrity === second.integrity &&
    first.phase === second.phase &&
    first.countdownLabel === second.countdownLabel &&
    first.end === second.end &&
    first.result === second.result
  );
}
