import type { Direction } from '../engine/drone';
import type { SessionPhase } from './session';

export type SessionCommand = 'begin' | 'pause' | 'resume' | 'restart' | 'quit' | 'toggleSound';

const LEFT_KEYS = ['a', 'arrowleft'];
const RIGHT_KEYS = ['d', 'arrowright'];
const UP_KEYS = ['w', 'arrowup'];
const DOWN_KEYS = ['s', 'arrowdown'];
const MOVEMENT_KEYS = new Set([...LEFT_KEYS, ...RIGHT_KEYS, ...UP_KEYS, ...DOWN_KEYS]);

export function normalizeKey(key: string): string {
  return key === ' ' ? 'space' : key.toLowerCase();
}

export function trackKey(
  pressed: ReadonlySet<string>,
  key: string,
  isDown: boolean,
): ReadonlySet<string> {
  const normalized = normalizeKey(key);
  if (!MOVEMENT_KEYS.has(normalized)) return pressed;

  const next = new Set(pressed);
  if (isDown) next.add(normalized);
  else next.delete(normalized);
  return next;
}

function isAnyPressed(pressed: ReadonlySet<string>, keys: readonly string[]): boolean {
  return keys.some((key) => pressed.has(key));
}

export function getKeyboardDirection(pressed: ReadonlySet<string>): Direction {
  const horizontal =
    Number(isAnyPressed(pressed, RIGHT_KEYS)) - Number(isAnyPressed(pressed, LEFT_KEYS));
  const vertical =
    Number(isAnyPressed(pressed, DOWN_KEYS)) - Number(isAnyPressed(pressed, UP_KEYS));
  return { x: horizontal, y: vertical };
}

type InterpretKeyInput = { key: string; phase: SessionPhase };

const COMMANDS_BY_PHASE: Record<SessionPhase, Record<string, SessionCommand>> = {
  title: { enter: 'begin', space: 'begin', escape: 'quit' },
  countdown: {},
  running: { escape: 'pause', p: 'pause', r: 'restart' },
  paused: { escape: 'resume', p: 'resume', r: 'restart', q: 'quit' },
  ending: {},
  finished: { r: 'restart', enter: 'restart', escape: 'quit' },
};

const SOUND_KEY = 'm';

export function interpretKey({ key, phase }: InterpretKeyInput): SessionCommand | null {
  const normalized = normalizeKey(key);
  if (normalized === SOUND_KEY) return 'toggleSound';
  return COMMANDS_BY_PHASE[phase][normalized] ?? null;
}
