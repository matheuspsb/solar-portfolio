import { describe, expect, it } from 'vitest';
import { applySessionCommand } from './apply-command';
import { createSession } from './session';
import type { GameSession, SessionPhase } from './session';

const field = { width: 1000, height: 600 };

function sessionIn(phase: SessionPhase): GameSession {
  return { ...createSession({ field, mode: 'standard', previousBest: 0 }), phase };
}

describe('applySessionCommand', () => {
  it('begins the countdown from the title', () => {
    expect(applySessionCommand(sessionIn('title'), 'begin').phase).toBe('countdown');
  });

  it('pauses a running game and resumes a paused one', () => {
    const paused = applySessionCommand(sessionIn('running'), 'pause');
    expect(paused.phase).toBe('paused');
    expect(applySessionCommand(paused, 'resume').phase).toBe('running');
  });

  it('restarts into a fresh countdown, from a paused or a finished run', () => {
    const played = { ...sessionIn('paused'), elapsedSeconds: 20 };
    const restarted = applySessionCommand(played, 'restart');
    expect(restarted.phase).toBe('countdown');
    expect(restarted.elapsedSeconds).toBe(0);
    expect(applySessionCommand(sessionIn('finished'), 'restart').phase).toBe('countdown');
  });

  it.each(['quit', 'toggleSound'] as const)('leaves the session alone for %s', (command) => {
    const session = sessionIn('running');
    expect(applySessionCommand(session, command)).toBe(session);
  });

  it('ignores commands that do not fit the phase', () => {
    const running = sessionIn('running');
    expect(applySessionCommand(running, 'begin')).toBe(running);
    expect(applySessionCommand(running, 'resume')).toBe(running);
    const title = sessionIn('title');
    expect(applySessionCommand(title, 'pause')).toBe(title);
  });
});
