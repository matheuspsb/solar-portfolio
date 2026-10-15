import { ENDING_SECONDS, MAX_STEP_SECONDS } from '../engine/constants';
import { resolveDroneContacts, resolveShotHits } from '../engine/collisions';
import { stepDrone } from '../engine/drone';
import type { Direction } from '../engine/drone';
import { advanceEntities } from '../engine/entity-motion';
import type { Patch } from '../engine/entities';
import { getPixelScale } from '../engine/play-field';
import type { Random } from '../engine/random';
import { applyDestroyed, applyLeaks, getRunOutcome, tickCombo } from '../engine/scoring';
import type { Award } from '../engine/scoring';
import { spawnEntities } from '../engine/spawn';
import { advanceShots, advanceWeapon, spawnShots } from '../engine/shots';
import { isValidStep } from '../engine/time-step';
import { buildRunResult } from '../results/run-result';
import type { GameSession } from './session';

export type StepInput = {
  session: GameSession;
  deltaSeconds: number;
  direction: Direction;
  random: Random;
};

export type StepEvents = {
  awards: Award[];
  collectedPatches: Patch[];
  leakedBugs: number;
  hasHurt: boolean;
  hasFired: boolean;
};

export type StepResult = { session: GameSession; events: StepEvents };

const NO_EVENTS: StepEvents = {
  awards: [],
  collectedPatches: [],
  leakedBugs: 0,
  hasHurt: false,
  hasFired: false,
};

function moveDrone(session: GameSession, direction: Direction, deltaSeconds: number): GameSession {
  const drone = stepDrone({ drone: session.drone, direction, deltaSeconds, field: session.field });
  return { ...session, drone };
}

function advanceCountdown(session: GameSession, deltaSeconds: number): GameSession {
  const countdownSeconds = session.countdownSeconds - deltaSeconds;
  if (countdownSeconds > 0) return { ...session, countdownSeconds };
  return { ...session, countdownSeconds: 0, phase: 'running' };
}

function advanceEnding(session: GameSession, deltaSeconds: number): GameSession {
  const endingSeconds = session.endingSeconds - deltaSeconds;
  if (endingSeconds > 0 || session.end === null) return { ...session, endingSeconds };

  const result = buildRunResult({
    stats: session.stats,
    end: session.end,
    mode: session.mode,
    previousBest: session.previousBest,
  });
  return { ...session, endingSeconds: 0, phase: 'finished', result };
}

function advanceRun(input: StepInput, deltaSeconds: number): StepResult {
  const { direction, random } = input;
  const moved = moveDrone(input.session, direction, deltaSeconds);
  const { field, mode } = moved;
  const pixelScale = getPixelScale(field.width);
  const elapsedSeconds = moved.elapsedSeconds + deltaSeconds;

  const weaponStep = advanceWeapon(moved.weapon, deltaSeconds, mode);
  const newShots = weaponStep.hasFired ? spawnShots(moved.drone, mode, pixelScale) : [];
  const shots = advanceShots([...moved.shots, ...newShots], deltaSeconds, field);

  const spawn = spawnEntities({
    timers: moved.timers,
    entities: moved.entities,
    elapsedSeconds,
    deltaSeconds,
    field,
    random,
  });
  const motion = advanceEntities({
    entities: [...moved.entities, ...spawn.spawned],
    deltaSeconds,
    field,
    random,
  });

  const afterLeaks = applyLeaks(moved.stats, motion.leakedBugs);
  const hits = resolveShotHits({ shots, entities: motion.entities });
  const scored = applyDestroyed({
    stats: afterLeaks,
    destroyed: hits.destroyed,
    random,
    pixelScale,
  });
  const contacts = resolveDroneContacts({
    drone: moved.drone,
    entities: [...hits.entities, ...scored.patches],
    stats: scored.stats,
    deltaSeconds,
    pixelScale,
  });
  const stats = tickCombo(contacts.stats, deltaSeconds);

  const outcome = getRunOutcome(stats, elapsedSeconds);
  const isOver = outcome !== 'running';
  const session: GameSession = {
    ...moved,
    elapsedSeconds,
    weapon: weaponStep.weapon,
    shots: hits.shots,
    entities: contacts.entities,
    timers: spawn.timers,
    stats,
    phase: isOver ? 'ending' : 'running',
    endingSeconds: isOver ? ENDING_SECONDS : 0,
    end: isOver ? outcome : null,
  };
  return {
    session,
    events: {
      awards: scored.awards,
      collectedPatches: contacts.collectedPatches,
      leakedBugs: motion.leakedBugs,
      hasHurt: contacts.hasHurt,
      hasFired: weaponStep.hasFired,
    },
  };
}

export function advanceSession(input: StepInput): StepResult {
  const { session } = input;
  if (!isValidStep(input.deltaSeconds)) return { session, events: NO_EVENTS };

  const deltaSeconds = Math.min(input.deltaSeconds, MAX_STEP_SECONDS);
  switch (session.phase) {
    case 'title':
      return { session: moveDrone(session, input.direction, deltaSeconds), events: NO_EVENTS };
    case 'countdown':
      return {
        session: advanceCountdown(moveDrone(session, input.direction, deltaSeconds), deltaSeconds),
        events: NO_EVENTS,
      };
    case 'running':
      return advanceRun(input, deltaSeconds);
    case 'ending':
      return { session: advanceEnding(session, deltaSeconds), events: NO_EVENTS };
    case 'paused':
    case 'finished':
      return { session, events: NO_EVENTS };
  }
}
