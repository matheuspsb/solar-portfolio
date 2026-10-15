import { describe, expect, it } from 'vitest';
import { COUNTDOWN_SECONDS, STARTING_INTEGRITY } from '../engine/constants';
import { getDroneBounds } from '../engine/play-field';
import { createSpawnTimers } from '../engine/spawn';
import { getRank } from '../results/rank';
import {
  aimSession,
  beginCountdown,
  createSession,
  pauseSession,
  restartSession,
  resizeSession,
  resumeSession,
} from './session';
import type { GameSession } from './session';

const field = { width: 1000, height: 600 };

function newSession(overrides: Partial<Parameters<typeof createSession>[0]> = {}): GameSession {
  return createSession({ field, mode: 'standard', previousBest: 0, ...overrides });
}

function inPhase(phase: GameSession['phase']): GameSession {
  return { ...newSession(), phase };
}

describe('createSession', () => {
  it('opens on the title with a clean run, the drone at rest and nothing on screen', () => {
    const session = newSession({ mode: 'hotfix', previousBest: 1200 });
    expect(session).toMatchObject({
      phase: 'title',
      mode: 'hotfix',
      previousBest: 1200,
      elapsedSeconds: 0,
      shots: [],
      entities: [],
      end: null,
      result: null,
    });
    expect(session.stats.integrity).toBe(STARTING_INTEGRITY);
    expect(session.timers).toEqual(createSpawnTimers());
    expect(session.drone.x).toBe(500);
  });
});

describe('beginCountdown', () => {
  it('starts the countdown from the title', () => {
    const session = beginCountdown(newSession());
    expect(session.phase).toBe('countdown');
    expect(session.countdownSeconds).toBe(COUNTDOWN_SECONDS);
  });

  it.each(['countdown', 'running', 'paused', 'ending', 'finished'] as const)(
    'does nothing from the %s phase',
    (phase) => {
      const session = inPhase(phase);
      expect(beginCountdown(session)).toBe(session);
    },
  );
});

describe('pauseSession and resumeSession', () => {
  it('pauses a running game and resumes it', () => {
    const paused = pauseSession(inPhase('running'));
    expect(paused.phase).toBe('paused');
    expect(resumeSession(paused).phase).toBe('running');
  });

  it.each(['title', 'countdown', 'paused', 'ending', 'finished'] as const)(
    'cannot pause from the %s phase, so a lost window focus there changes nothing',
    (phase) => {
      const session = inPhase(phase);
      expect(pauseSession(session)).toBe(session);
    },
  );

  it.each(['title', 'countdown', 'running', 'ending', 'finished'] as const)(
    'cannot resume from the %s phase',
    (phase) => {
      const session = inPhase(phase);
      expect(resumeSession(session)).toBe(session);
    },
  );
});

describe('restartSession', () => {
  it('starts over in the countdown with a clean run in the same mode', () => {
    const played: GameSession = {
      ...inPhase('paused'),
      mode: 'hotfix',
      elapsedSeconds: 30,
      stats: { ...newSession().stats, score: 900, integrity: 1 },
      entities: [{ kind: 'tear', y: 100, height: 28, age: 0, warningSeconds: 1, activeSeconds: 1 }],
    };
    const restarted = restartSession(played);
    expect(restarted).toMatchObject({
      phase: 'countdown',
      mode: 'hotfix',
      elapsedSeconds: 0,
      entities: [],
      shots: [],
      countdownSeconds: COUNTDOWN_SECONDS,
    });
    expect(restarted.stats.score).toBe(0);
    expect(restarted.stats.integrity).toBe(STARTING_INTEGRITY);
  });

  it('takes the best score of the finished run as the one to beat', () => {
    const finished: GameSession = {
      ...inPhase('finished'),
      previousBest: 100,
      result: {
        end: 'deploy',
        mode: 'standard',
        score: 900,
        bugsSquashed: 0,
        dataCleaned: 0,
        maxCombo: 0,
        integrityLeft: 3,
        rank: getRank(900),
        isNewBest: true,
        nextBest: 900,
        reachedRoot: false,
        showsRootHint: false,
      },
    };
    expect(restartSession(finished).previousBest).toBe(900);
  });

  it('keeps the best score when restarting from a pause', () => {
    expect(restartSession({ ...inPhase('paused'), previousBest: 400 }).previousBest).toBe(400);
  });
});

describe('resizeSession', () => {
  it('moves to the new field and keeps the drone inside it', () => {
    const smallField = { width: 300, height: 300 };
    const resized = resizeSession(newSession(), smallField);
    const bounds = getDroneBounds(smallField);
    expect(resized.field).toEqual(smallField);
    expect(resized.drone.x).toBeLessThanOrEqual(bounds.maximumX);
    expect(resized.drone.y).toBeLessThanOrEqual(bounds.maximumY);
  });

  it('returns the same session when the size did not change', () => {
    const session = newSession();
    expect(resizeSession(session, { ...field })).toBe(session);
  });
});

describe('aimSession', () => {
  it('points the drone at the cursor', () => {
    const aimed = aimSession(newSession(), { x: 800, y: 300 });
    expect(aimed.drone.targetX).toBe(800);
    expect(aimed.drone.targetY).toBe(300);
  });
});
