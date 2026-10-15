import { describe, expect, it } from 'vitest';
import {
  COUNTDOWN_SECONDS,
  ENDING_SECONDS,
  MATCH_DURATION_SECONDS,
  MAX_STEP_SECONDS,
} from '../engine/constants';
import { createBug, createCorruptedData } from '../engine/entities';
import type { Bug } from '../engine/entities';
import { advanceSession } from './advance-session';
import type { StepInput } from './advance-session';
import { beginCountdown, createSession, pauseSession } from './session';
import type { GameSession } from './session';

const field = { width: 1000, height: 600 };
const NO_DIRECTION = { x: 0, y: 0 };
const middleRandom = () => 0.5;

function step(session: GameSession, deltaSeconds: number, overrides: Partial<StepInput> = {}) {
  return advanceSession({
    session,
    deltaSeconds,
    direction: NO_DIRECTION,
    random: middleRandom,
    ...overrides,
  });
}

function advanceFor(session: GameSession, seconds: number, stepSeconds = 0.02): GameSession {
  let current = session;
  for (let elapsed = 0; elapsed < seconds; elapsed += stepSeconds) {
    current = step(current, stepSeconds).session;
  }
  return current;
}

function newSession(): GameSession {
  return createSession({ field, mode: 'standard', previousBest: 0 });
}

function runningSession(overrides: Partial<GameSession> = {}): GameSession {
  return { ...newSession(), phase: 'running', ...overrides };
}

function bugOnDrone(session: GameSession): Bug {
  return {
    ...createBug({
      kind: 'crawler',
      x: session.drone.x,
      speed: 0,
      radius: 16,
      amplitude: 0,
      frequency: 1,
      phase: 0,
    }),
    y: session.drone.y,
  };
}

describe('advanceSession on the title', () => {
  it('lets the drone move but does not start the clock, the guns or the bugs', () => {
    const before = newSession();
    const after = advanceFor(before, 2);
    expect(after.phase).toBe('title');
    expect(after.elapsedSeconds).toBe(0);
    expect(after.shots).toEqual([]);
    expect(after.entities).toEqual([]);
    const moved = step(before, 0.05, { direction: { x: 1, y: 0 } }).session;
    expect(moved.drone.x).toBeGreaterThan(before.drone.x);
  });
});

describe('advanceSession during the countdown', () => {
  it('counts down and then starts the run', () => {
    const counting = beginCountdown(newSession());
    const midway = advanceFor(counting, COUNTDOWN_SECONDS / 2);
    expect(midway.phase).toBe('countdown');
    expect(midway.elapsedSeconds).toBe(0);
    const done = advanceFor(counting, COUNTDOWN_SECONDS + 0.05);
    expect(done.phase).toBe('running');
    expect(done.elapsedSeconds).toBeLessThan(0.1);
  });

  it('does not fire or spawn anything while counting', () => {
    const counting = advanceFor(beginCountdown(newSession()), COUNTDOWN_SECONDS - 0.2);
    expect(counting.shots).toEqual([]);
    expect(counting.entities).toEqual([]);
  });
});

describe('advanceSession while running', () => {
  it('advances the clock', () => {
    const after = step(runningSession(), 0.04).session;
    expect(after.elapsedSeconds).toBeCloseTo(0.04);
  });

  it('opens fire after the first delay and keeps firing', () => {
    const early = advanceFor(runningSession(), 0.2);
    expect(early.shots).toHaveLength(0);
    expect(advanceFor(runningSession(), 0.5).shots.length).toBeGreaterThan(0);
  });

  it('brings in bugs and data as the time goes by', () => {
    const seen = new Set<string>();
    let current = runningSession();
    for (let elapsed = 0; elapsed < 4; elapsed += 0.02) {
      current = step(current, 0.02).session;
      for (const entity of current.entities) seen.add(entity.kind);
    }
    expect(seen.has('crawler')).toBe(true);
    expect(seen.has('data')).toBe(true);
  });

  it('never advances more than one capped step, whatever the pause was', () => {
    const after = step(runningSession(), 600).session;
    expect(after.elapsedSeconds).toBeLessThanOrEqual(MAX_STEP_SECONDS);
    expect(after.elapsedSeconds).toBeGreaterThan(0);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('ignores the step %s', (deltaSeconds) => {
    const session = runningSession();
    expect(step(session, deltaSeconds).session).toEqual(session);
  });

  it('squashes a bug in the way of the shots and pays for it', () => {
    const session = runningSession({
      shots: [{ x: 300, y: 200, vx: 0, vy: -780 }],
      entities: [
        {
          ...createBug({
            kind: 'crawler',
            x: 300,
            speed: 0,
            radius: 16,
            amplitude: 0,
            frequency: 1,
            phase: 0,
          }),
          y: 200,
        },
      ],
    });
    const result = step(session, 0.001);
    expect(result.session.stats.score).toBe(10);
    expect(result.events.awards).toHaveLength(1);
    expect(
      result.session.entities.some((entity) => entity.kind === 'crawler' && entity.x === 300),
    ).toBe(false);
  });

  it('drops a patch where cleaned data was, when the dice say so', () => {
    const data = { ...createCorruptedData({ x: 300, speed: 0, radius: 18 }), y: 200, hitPoints: 1 };
    const result = step(
      runningSession({ shots: [{ x: 300, y: 200, vx: 0, vy: -780 }], entities: [data] }),
      0.001,
      { random: () => 0 },
    );
    expect(result.session.entities.some((entity) => entity.kind === 'patch')).toBe(true);
    expect(result.session.stats.dataCleaned).toBe(1);
  });

  it('breaks the combo when a bug slips past the base', () => {
    const slipping: Bug = {
      ...createBug({
        kind: 'crawler',
        x: 100,
        speed: 500,
        radius: 16,
        amplitude: 0,
        frequency: 1,
        phase: 0,
      }),
      y: 600,
    };
    const base = runningSession({ entities: [slipping] });
    const session = { ...base, stats: { ...base.stats, combo: 7, comboSeconds: 2 } };
    const result = step(session, 0.05);
    expect(result.session.stats.combo).toBe(0);
    expect(result.events.leakedBugs).toBe(1);
  });

  it('hurts the drone when a bug reaches it', () => {
    const base = runningSession();
    const result = step({ ...base, entities: [bugOnDrone(base)] }, 0.001);
    expect(result.events.hasHurt).toBe(true);
    expect(result.session.stats.integrity).toBe(2);
  });

  it('is deterministic for the same random numbers', () => {
    const first = advanceFor(runningSession(), 6);
    const second = advanceFor(runningSession(), 6);
    expect(first).toEqual(second);
  });

  it('does not change the session it was given', () => {
    const session = runningSession();
    const snapshot = JSON.stringify(session);
    step(session, 0.05);
    expect(JSON.stringify(session)).toBe(snapshot);
  });
});

describe('advanceSession endings', () => {
  it('ends with a deploy when the time runs out', () => {
    const almostDone = runningSession({ elapsedSeconds: MATCH_DURATION_SECONDS - 0.01 });
    const after = step(almostDone, 0.05).session;
    expect(after.phase).toBe('ending');
    expect(after.end).toBe('deploy');
  });

  it('crashes when the integrity reaches zero', () => {
    const base = runningSession();
    const doomed = {
      ...base,
      stats: { ...base.stats, integrity: 1 },
      entities: [bugOnDrone(base)],
    };
    const after = step(doomed, 0.001).session;
    expect(after.phase).toBe('ending');
    expect(after.end).toBe('crash');
  });

  it('shows the banner for a while and then presents the results', () => {
    const base = runningSession({ elapsedSeconds: MATCH_DURATION_SECONDS - 0.01 });
    const ending = step({ ...base, stats: { ...base.stats, score: 900 } }, 0.05).session;
    expect(advanceFor(ending, ENDING_SECONDS / 2).phase).toBe('ending');
    const finished = advanceFor(ending, ENDING_SECONDS + 0.2);
    expect(finished.phase).toBe('finished');
    expect(finished.result).toMatchObject({
      end: 'deploy',
      mode: 'standard',
      score: 900,
      isNewBest: true,
    });
  });

  it('keeps the run frozen once it has finished', () => {
    const base = runningSession({ elapsedSeconds: MATCH_DURATION_SECONDS - 0.01 });
    const finished = advanceFor(step(base, 0.05).session, ENDING_SECONDS + 0.2);
    expect(step(finished, 1).session).toEqual(finished);
  });
});

describe('advanceSession when paused', () => {
  it('freezes everything', () => {
    const paused = pauseSession(runningSession({ elapsedSeconds: 10 }));
    expect(step(paused, 1, { direction: { x: 1, y: 0 } }).session).toEqual(paused);
  });
});
