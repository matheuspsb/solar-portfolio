import type { SessionCommand } from './keyboard';
import { beginCountdown, pauseSession, restartSession, resumeSession } from './session';
import type { GameSession } from './session';

export function applySessionCommand(session: GameSession, command: SessionCommand): GameSession {
  switch (command) {
    case 'begin':
      return beginCountdown(session);
    case 'pause':
      return pauseSession(session);
    case 'resume':
      return resumeSession(session);
    case 'restart':
      return restartSession(session);
    case 'quit':
    case 'toggleSound':
      return session;
  }
}
