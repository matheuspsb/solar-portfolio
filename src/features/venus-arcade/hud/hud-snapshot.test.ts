import { describe, expect, it } from 'vitest';
import { MATCH_DURATION_SECONDS, STARTING_INTEGRITY } from '../engine/constants';
import { createRunStats } from '../engine/scoring';
import { createSession } from '../session/session';
import type { GameSession } from '../session/session';
import { getHudSnapshot, isSameHudSnapshot } from './hud-snapshot';

const field = { width: 1000, height: 600 };

function sessionWith(overrides: Partial<GameSession> = {}): GameSession {
  return { ...createSession({ field, mode: 'standard', previousBest: 0 }), ...overrides };
}

function statsWith(overrides: Partial<GameSession['stats']>): GameSession['stats'] {
  return { ...createRunStats(), ...overrides };
}

describe('getHudSnapshot score', () => {
  it('pads the score to six digits', () => {
    expect(getHudSnapshot(sessionWith({ stats: statsWith({ score: 420 }) })).scoreText).toBe(
      '000420',
    );
  });

  it('keeps a score above six digits from growing the box', () => {
    expect(getHudSnapshot(sessionWith({ stats: statsWith({ score: 12_345_678 }) })).scoreText).toBe(
      '999999',
    );
  });

  it.each([-5, Number.NaN])('shows zero for the score %s', (score) => {
    expect(getHudSnapshot(sessionWith({ stats: statsWith({ score }) })).scoreText).toBe('000000');
  });
});

describe('getHudSnapshot combo', () => {
  it('shows the multiplier and the combo that earned it', () => {
    const snapshot = getHudSnapshot(sessionWith({ stats: statsWith({ combo: 14 }) }));
    expect(snapshot).toMatchObject({ multiplier: 3, combo: 14 });
  });

  it('only shows the chip when the multiplier is above one', () => {
    expect(getHudSnapshot(sessionWith({ stats: statsWith({ combo: 5 }) })).showsMultiplier).toBe(
      false,
    );
    expect(getHudSnapshot(sessionWith({ stats: statsWith({ combo: 6 }) })).showsMultiplier).toBe(
      true,
    );
  });
});

describe('getHudSnapshot time', () => {
  it('counts whole seconds down, rounding up, and never below zero', () => {
    expect(getHudSnapshot(sessionWith()).secondsLeft).toBe(MATCH_DURATION_SECONDS);
    expect(getHudSnapshot(sessionWith({ elapsedSeconds: 0.2 })).secondsLeft).toBe(
      MATCH_DURATION_SECONDS,
    );
    expect(getHudSnapshot(sessionWith({ elapsedSeconds: 44.5 })).secondsLeft).toBe(1);
    expect(getHudSnapshot(sessionWith({ elapsedSeconds: 60 })).secondsLeft).toBe(0);
  });

  it('drains the bar one whole second at a time, from full to empty', () => {
    expect(getHudSnapshot(sessionWith()).timeRatio).toBe(1);
    expect(getHudSnapshot(sessionWith({ elapsedSeconds: 15 })).timeRatio).toBeCloseTo(
      30 / MATCH_DURATION_SECONDS,
    );
    expect(getHudSnapshot(sessionWith({ elapsedSeconds: 99 })).timeRatio).toBe(0);
  });

  it('turns urgent in the last ten seconds', () => {
    expect(getHudSnapshot(sessionWith({ elapsedSeconds: 34 })).isUrgent).toBe(false);
    expect(getHudSnapshot(sessionWith({ elapsedSeconds: 35 })).isUrgent).toBe(true);
  });

  it('treats a clock that is not a number as the start', () => {
    expect(getHudSnapshot(sessionWith({ elapsedSeconds: Number.NaN })).secondsLeft).toBe(
      MATCH_DURATION_SECONDS,
    );
  });
});

describe('getHudSnapshot integrity and phase', () => {
  it('shows the integrity, never below zero or above the maximum', () => {
    expect(getHudSnapshot(sessionWith()).integrity).toBe(STARTING_INTEGRITY);
    expect(getHudSnapshot(sessionWith({ stats: statsWith({ integrity: -2 }) })).integrity).toBe(0);
    expect(getHudSnapshot(sessionWith({ stats: statsWith({ integrity: 9 }) })).integrity).toBe(
      STARTING_INTEGRITY,
    );
  });

  it('only shows the countdown label while counting down', () => {
    const counting = sessionWith({ phase: 'countdown', countdownSeconds: 2.3 });
    expect(getHudSnapshot(counting).countdownLabel).toBe('3');
    expect(getHudSnapshot(sessionWith({ phase: 'running' })).countdownLabel).toBeNull();
  });

  it('carries the phase and the way the run ended', () => {
    const ending = sessionWith({ phase: 'ending', end: 'crash' });
    expect(getHudSnapshot(ending)).toMatchObject({ phase: 'ending', end: 'crash' });
  });
});

describe('isSameHudSnapshot', () => {
  it('is true for the same numbers and false when anything shown changes', () => {
    const snapshot = getHudSnapshot(sessionWith());
    expect(isSameHudSnapshot(snapshot, getHudSnapshot(sessionWith()))).toBe(true);
    const later = getHudSnapshot(sessionWith({ elapsedSeconds: 3 }));
    expect(isSameHudSnapshot(snapshot, later)).toBe(false);
    const scored = getHudSnapshot(sessionWith({ stats: statsWith({ score: 10 }) }));
    expect(isSameHudSnapshot(snapshot, scored)).toBe(false);
  });

  it('ignores the part of a second that the screen does not show', () => {
    const first = getHudSnapshot(sessionWith({ elapsedSeconds: 10.1 }));
    const second = getHudSnapshot(sessionWith({ elapsedSeconds: 10.2 }));
    expect(first.secondsLeft).toBe(second.secondsLeft);
  });
});
