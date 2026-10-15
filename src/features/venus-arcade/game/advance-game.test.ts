import { describe, expect, it } from 'vitest';
import { createEffects } from '../effects/effects';
import { MAX_STEP_SECONDS } from '../engine/constants';
import { createSession } from '../session/session';
import type { GameSession, SessionPhase } from '../session/session';
import { advanceGame, createGameState } from './advance-game';

const field = { width: 1000, height: 600 };
const middle = () => 0.5;
const still = { x: 0, y: 0 };

function stateIn(phase: SessionPhase, overrides: Partial<GameSession> = {}) {
  const session = {
    ...createSession({ field, mode: 'standard', previousBest: 0 }),
    phase,
    ...overrides,
  };
  return createGameState(session);
}

function advance(state: ReturnType<typeof stateIn>, deltaSeconds: number, reducedMotion = false) {
  return advanceGame({ state, deltaSeconds, direction: still, random: middle, reducedMotion });
}

describe('advanceGame', () => {
  it('advances the session and the grid scroll while the game is running', () => {
    const { state } = advance(stateIn('running'), 0.02);
    expect(state.session.elapsedSeconds).toBeCloseTo(0.02);
    expect(state.scrollSeconds).toBeCloseTo(0.02);
  });

  it('never advances more than one capped step, even after a long background pause', () => {
    const { state } = advance(stateIn('running'), 90);
    expect(state.session.elapsedSeconds).toBeLessThanOrEqual(MAX_STEP_SECONDS);
    expect(state.scrollSeconds).toBeLessThanOrEqual(MAX_STEP_SECONDS);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('ignores the step %s', (deltaSeconds) => {
    const before = stateIn('running');
    expect(advance(before, deltaSeconds).state).toEqual(before);
  });

  it('freezes the picture while paused', () => {
    const before = stateIn('paused');
    expect(advance(before, 0.02).state).toEqual(before);
  });

  it('keeps the grid still with reduced motion, but the game goes on', () => {
    const { state } = advance(stateIn('running'), 0.02, true);
    expect(state.scrollSeconds).toBe(0);
    expect(state.session.elapsedSeconds).toBeGreaterThan(0);
  });

  it('lets the effects fade out with the time', () => {
    const before = { ...stateIn('running'), effects: { ...createEffects(), shakeSeconds: 0.3 } };
    expect(advance(before, 0.02).state.effects.shakeSeconds).toBeLessThan(0.3);
  });

  it('turns what happened in the step into effects', () => {
    const session = stateIn('running').session;
    const hurtingShard = {
      kind: 'shard' as const,
      x: session.drone.x,
      y: session.drone.y,
      speed: 0,
      radius: 20,
      age: 0,
    };
    const before = createGameState({ ...session, entities: [hurtingShard] });
    const { state, events } = advance(before, 0.02);
    expect(events.hasHurt).toBe(true);
    expect(state.effects.shakeSeconds).toBeGreaterThan(0);
  });

  it('does not shake with reduced motion when the drone is hurt', () => {
    const session = stateIn('running').session;
    const hurtingShard = {
      kind: 'shard' as const,
      x: session.drone.x,
      y: session.drone.y,
      speed: 0,
      radius: 20,
      age: 0,
    };
    const { state } = advance(
      createGameState({ ...session, entities: [hurtingShard] }),
      0.02,
      true,
    );
    expect(state.effects.shakeSeconds).toBe(0);
  });
});
