import { describe, expect, it } from 'vitest';
import { COUNTDOWN_SECONDS } from '../engine/constants';
import { createPatch } from '../engine/entities';
import type { StepEvents } from '../session/advance-session';
import { createSession } from '../session/session';
import type { GameSession, SessionPhase } from '../session/session';
import { getStepSounds } from './step-sounds';

const field = { width: 1000, height: 600 };
const NO_EVENTS: StepEvents = {
  awards: [],
  collectedPatches: [],
  leakedBugs: 0,
  leakedXs: [],
  hasHurt: false,
  hasFired: false,
};

function sessionIn(phase: SessionPhase, overrides: Partial<GameSession> = {}): GameSession {
  return { ...createSession({ field, mode: 'standard', previousBest: 0 }), phase, ...overrides };
}

function sounds(
  events: Partial<StepEvents>,
  before = sessionIn('running'),
  after = before,
  shotCount = 0,
) {
  return getStepSounds({ before, after, events: { ...NO_EVENTS, ...events }, shotCount });
}

describe('getStepSounds', () => {
  it('is silent when nothing happened', () => {
    expect(sounds({})).toEqual({ sounds: [], shotCount: 0 });
  });

  it('plays a kill for destroyed targets, once however many fell', () => {
    const award = { kind: 'crawler', x: 1, y: 1, radius: 4, points: 10, multiplier: 1 } as const;
    expect(sounds({ awards: [award, award] }).sounds).toEqual(['kill']);
  });

  it('plays a hit when the drone is hurt and a pick when a patch is collected', () => {
    expect(sounds({ hasHurt: true }).sounds).toEqual(['hit']);
    const patch = createPatch({ x: 1, y: 1, radius: 3 });
    expect(sounds({ collectedPatches: [patch] }).sounds).toEqual(['pick']);
  });

  it('shoots on every second shot only, so the fire does not become a buzz', () => {
    const first = sounds({ hasFired: true }, undefined, undefined, 0);
    const second = sounds({ hasFired: true }, undefined, undefined, first.shotCount);
    const third = sounds({ hasFired: true }, undefined, undefined, second.shotCount);
    expect([first.sounds, second.sounds, third.sounds]).toEqual([['shoot'], [], ['shoot']]);
    expect(third.shotCount).toBe(3);
  });

  it('ticks the countdown when the number changes, and chimes on GO', () => {
    const before = sessionIn('countdown', { countdownSeconds: COUNTDOWN_SECONDS });
    const sameNumber = { ...before, countdownSeconds: COUNTDOWN_SECONDS - 0.02 };
    const nextNumber = { ...before, countdownSeconds: 1.7 };
    const go = { ...before, countdownSeconds: 0.5 };
    expect(sounds({}, before, sameNumber).sounds).toEqual([]);
    expect(sounds({}, before, nextNumber).sounds).toEqual(['blip']);
    expect(sounds({}, { ...before, countdownSeconds: 0.7 }, go).sounds).toEqual(['pick']);
  });

  it('closes the run with a hit for a crash and a chime for a deploy, once', () => {
    const running = sessionIn('running');
    expect(sounds({}, running, sessionIn('ending', { end: 'crash' })).sounds).toEqual(['hit']);
    expect(sounds({}, running, sessionIn('ending', { end: 'deploy' })).sounds).toEqual(['end']);
    const ending = sessionIn('ending', { end: 'crash' });
    expect(sounds({}, ending, ending).sounds).toEqual([]);
  });

  it('can play a hit and the crash together', () => {
    const after = sessionIn('ending', { end: 'crash' });
    expect(sounds({ hasHurt: true }, sessionIn('running'), after).sounds).toEqual(['hit', 'hit']);
  });
});
