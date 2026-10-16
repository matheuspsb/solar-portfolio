import { advanceEffects, createEffects } from '../effects/effects';
import type { Effects } from '../effects/effects';
import { applyStepEffects } from '../effects/step-effects';
import { MAX_STEP_SECONDS } from '../engine/constants';
import type { Direction } from '../engine/drone';
import type { Random } from '../engine/random';
import { isValidStep } from '@/lib/time-step';
import { advanceSession } from '../session/advance-session';
import type { StepEvents } from '../session/advance-session';
import type { GameSession } from '../session/session';

export type GameState = { session: GameSession; effects: Effects; scrollSeconds: number };

type AdvanceGameInput = {
  state: GameState;
  deltaSeconds: number;
  direction: Direction;
  random: Random;
  reducedMotion: boolean;
};

export function createGameState(session: GameSession): GameState {
  return { session, effects: createEffects(), scrollSeconds: 0 };
}

export function advanceGame({
  state,
  deltaSeconds,
  direction,
  random,
  reducedMotion,
}: AdvanceGameInput): { state: GameState; events: StepEvents } {
  const step = advanceSession({ session: state.session, deltaSeconds, direction, random });
  if (!isValidStep(deltaSeconds) || state.session.phase === 'paused') {
    return { state, events: step.events };
  }

  const cappedSeconds = Math.min(deltaSeconds, MAX_STEP_SECONDS);
  const withStepEffects = applyStepEffects({
    effects: state.effects,
    before: state.session,
    after: step.session,
    events: step.events,
    random,
    reducedMotion,
  });
  return {
    state: {
      session: step.session,
      effects: advanceEffects(withStepEffects, cappedSeconds),
      scrollSeconds: reducedMotion ? 0 : state.scrollSeconds + cappedSeconds,
    },
    events: step.events,
  };
}
