import { clamp } from '@/lib/math';
import {
  COMBO_WINDOW_SECONDS,
  KILLS_PER_MULTIPLIER_STEP,
  MATCH_DURATION_SECONDS,
  MAX_MULTIPLIER_BONUS,
  PATCH_DROP_CHANCE,
  PATCH_RADIUS_PIXEL_UNITS,
  STARTING_INTEGRITY,
} from './constants';
import { createPatch } from './entities';
import type { Bug, CorruptedData, Patch } from './entities';
import type { Random } from './random';
import { isValidStep } from './time-step';

export type RunStats = {
  score: number;
  combo: number;
  comboSeconds: number;
  maxCombo: number;
  bugsSquashed: number;
  dataCleaned: number;
  integrity: number;
  invulnerableSeconds: number;
};

export type Award = {
  kind: Bug['kind'] | 'data';
  x: number;
  y: number;
  radius: number;
  points: number;
  multiplier: number;
};

export type RunOutcome = 'running' | 'crash' | 'deploy';

type ApplyDestroyedInput = {
  stats: RunStats;
  destroyed: readonly (Bug | CorruptedData)[];
  random: Random;
  pixelScale: number;
};

type ApplyDestroyedResult = { stats: RunStats; awards: Award[]; patches: Patch[] };

export function createRunStats(): RunStats {
  return {
    score: 0,
    combo: 0,
    comboSeconds: 0,
    maxCombo: 0,
    bugsSquashed: 0,
    dataCleaned: 0,
    integrity: STARTING_INTEGRITY,
    invulnerableSeconds: 0,
  };
}

export function getComboMultiplier(combo: number): number {
  const safeCombo = Number.isFinite(combo) ? Math.max(0, combo) : 0;
  return 1 + Math.min(MAX_MULTIPLIER_BONUS, Math.floor(safeCombo / KILLS_PER_MULTIPLIER_STEP));
}

export function applyDestroyed({
  stats,
  destroyed,
  random,
  pixelScale,
}: ApplyDestroyedInput): ApplyDestroyedResult {
  let current = stats;
  const awards: Award[] = [];
  const patches: Patch[] = [];

  for (const target of destroyed) {
    const multiplier = getComboMultiplier(current.combo);
    const points = target.points * multiplier;
    const combo = current.combo + 1;
    const isData = target.kind === 'data';
    current = {
      ...current,
      score: current.score + points,
      combo,
      maxCombo: Math.max(current.maxCombo, combo),
      comboSeconds: COMBO_WINDOW_SECONDS,
      dataCleaned: current.dataCleaned + (isData ? 1 : 0),
      bugsSquashed: current.bugsSquashed + (isData ? 0 : 1),
    };
    awards.push({
      kind: target.kind,
      x: target.x,
      y: target.y,
      radius: target.radius,
      points,
      multiplier,
    });
    if (isData && random() < PATCH_DROP_CHANCE) {
      patches.push(
        createPatch({ x: target.x, y: target.y, radius: PATCH_RADIUS_PIXEL_UNITS * pixelScale }),
      );
    }
  }

  return { stats: current, awards, patches };
}

export function applyLeaks(stats: RunStats, leakedBugs: number): RunStats {
  if (!(leakedBugs > 0)) return stats;
  return { ...stats, combo: 0, comboSeconds: 0 };
}

export function tickCombo(stats: RunStats, deltaSeconds: number): RunStats {
  if (!isValidStep(deltaSeconds) || stats.comboSeconds <= 0) return stats;

  const comboSeconds = Math.max(0, stats.comboSeconds - deltaSeconds);
  return { ...stats, comboSeconds, combo: comboSeconds > 0 ? stats.combo : 0 };
}

export function getRunOutcome(stats: RunStats, elapsedSeconds: number): RunOutcome {
  if (stats.integrity <= 0) return 'crash';
  if (clamp(elapsedSeconds, 0, Infinity) >= MATCH_DURATION_SECONDS) return 'deploy';
  return 'running';
}
