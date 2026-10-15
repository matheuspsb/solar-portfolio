import { COUNTDOWN_SECONDS } from '../engine/constants';
import { aimDrone, clampDroneToField, createDrone } from '../engine/drone';
import type { Drone } from '../engine/drone';
import type { Entity } from '../engine/entities';
import type { PlayField } from '../engine/play-field';
import { createRunStats } from '../engine/scoring';
import type { RunStats } from '../engine/scoring';
import { createSpawnTimers } from '../engine/spawn';
import type { SpawnTimers } from '../engine/spawn';
import { createWeapon } from '../engine/shots';
import type { FireMode, Shot, Weapon } from '../engine/shots';
import type { RunEnd, RunResult } from '../results/run-result';

export type SessionPhase = 'title' | 'countdown' | 'running' | 'paused' | 'ending' | 'finished';

export type GameSession = {
  phase: SessionPhase;
  mode: FireMode;
  field: PlayField;
  previousBest: number;
  elapsedSeconds: number;
  countdownSeconds: number;
  endingSeconds: number;
  drone: Drone;
  weapon: Weapon;
  shots: Shot[];
  entities: Entity[];
  timers: SpawnTimers;
  stats: RunStats;
  end: RunEnd | null;
  result: RunResult | null;
};

type CreateSessionInput = { field: PlayField; mode: FireMode; previousBest: number };

export function createSession({ field, mode, previousBest }: CreateSessionInput): GameSession {
  return {
    phase: 'title',
    mode,
    field,
    previousBest,
    elapsedSeconds: 0,
    countdownSeconds: 0,
    endingSeconds: 0,
    drone: createDrone(field),
    weapon: createWeapon(),
    shots: [],
    entities: [],
    timers: createSpawnTimers(),
    stats: createRunStats(),
    end: null,
    result: null,
  };
}

export function beginCountdown(session: GameSession): GameSession {
  if (session.phase !== 'title') return session;
  return { ...session, phase: 'countdown', countdownSeconds: COUNTDOWN_SECONDS };
}

export function pauseSession(session: GameSession): GameSession {
  return session.phase === 'running' ? { ...session, phase: 'paused' } : session;
}

export function resumeSession(session: GameSession): GameSession {
  return session.phase === 'paused' ? { ...session, phase: 'running' } : session;
}

export function restartSession(session: GameSession): GameSession {
  const fresh = createSession({
    field: session.field,
    mode: session.mode,
    previousBest: session.result?.nextBest ?? session.previousBest,
  });
  return beginCountdown(fresh);
}

export function resizeSession(session: GameSession, field: PlayField): GameSession {
  const isSameSize = field.width === session.field.width && field.height === session.field.height;
  if (isSameSize) return session;
  return { ...session, field, drone: clampDroneToField(session.drone, field) };
}

export function aimSession(session: GameSession, point: { x: number; y: number }): GameSession {
  return { ...session, drone: aimDrone(session.drone, point, session.field) };
}
