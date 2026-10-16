import { arcadeTokens } from '@/styles/arcade-tokens';
import { randomBetween, pickOne } from '../engine/random';
import type { Random } from '../engine/random';
import { isValidStep } from '@/lib/time-step';

export type Streak = { angle: number; radius: number; speed: number; width: number; color: string };

const FULL_TURN = Math.PI * 2;
const INITIAL_RADIUS_RANGE = [40, 500] as const;
const RESPAWN_RADIUS_RANGE = [20, 80] as const;
const SPEED_RANGE = [60, 260] as const;
const WIDTH_RANGE = [1, 2.6] as const;
const SPEED_GAIN_PER_SECOND = 1.8;
const LENGTH_PER_SPEED = 0.06;
const MAX_LENGTH_PIXELS = 160;
const FADE_IN_RADIUS_PIXELS = 120;
const MAX_ALPHA = 0.8;
const PALETTE = [
  arcadeTokens.droneColor,
  arcadeTokens.dataColor,
  arcadeTokens.crawlerColor,
  arcadeTokens.flashColor,
] as const;

type CreateInput = { count: number; random: Random; isInitial: boolean };

function createStreak(random: Random, isInitial: boolean): Streak {
  const [minimumRadius, maximumRadius] = isInitial ? INITIAL_RADIUS_RANGE : RESPAWN_RADIUS_RANGE;
  return {
    angle: randomBetween(random, 0, FULL_TURN),
    radius: randomBetween(random, minimumRadius, maximumRadius),
    speed: randomBetween(random, SPEED_RANGE[0], SPEED_RANGE[1]),
    width: randomBetween(random, WIDTH_RANGE[0], WIDTH_RANGE[1]),
    color: pickOne(random, PALETTE),
  };
}

export function createStreaks({ count, random, isInitial }: CreateInput): Streak[] {
  const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return Array.from({ length: safeCount }, () => createStreak(random, isInitial));
}

type AdvanceInput = {
  streaks: readonly Streak[];
  deltaSeconds: number;
  elapsedSeconds: number;
  maxRadius: number;
  random: Random;
};

function getSpeedNow(streak: Streak, elapsedSeconds: number): number {
  return streak.speed * (1 + elapsedSeconds * SPEED_GAIN_PER_SECOND);
}

export function advanceStreaks({
  streaks,
  deltaSeconds,
  elapsedSeconds,
  maxRadius,
  random,
}: AdvanceInput): Streak[] {
  if (!isValidStep(deltaSeconds)) return [...streaks];
  return streaks.map((streak) => {
    const radius = streak.radius + getSpeedNow(streak, elapsedSeconds) * deltaSeconds;
    if (radius > maxRadius) return createStreak(random, false);
    return { ...streak, radius };
  });
}

type SegmentContext = { centerX: number; centerY: number; elapsedSeconds: number };

export function getStreakSegment(streak: Streak, context: SegmentContext) {
  const speedNow = getSpeedNow(streak, context.elapsedSeconds);
  const length = Math.min(
    MAX_LENGTH_PIXELS,
    speedNow * LENGTH_PER_SPEED * (1 + context.elapsedSeconds),
  );
  const cosine = Math.cos(streak.angle);
  const sine = Math.sin(streak.angle);
  return {
    startX: context.centerX + cosine * (streak.radius - length),
    startY: context.centerY + sine * (streak.radius - length),
    endX: context.centerX + cosine * streak.radius,
    endY: context.centerY + sine * streak.radius,
    alpha: Math.min(1, streak.radius / FADE_IN_RADIUS_PIXELS) * MAX_ALPHA,
    width: streak.width,
    color: streak.color,
  };
}
