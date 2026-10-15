import type { FireMode } from '../engine/shots';
import { normalizeKey } from '../session/keyboard';

export const CARTRIDGE_IDS = ['bug-hunter', 'sulfur-drift', 'root'] as const;

export type CartridgeId = (typeof CARTRIDGE_IDS)[number];

export type CartridgeState = 'ready' | 'broken' | 'sealed';

export type RejectionReason = 'no-signal' | 'access-denied';

export type InsertOutcome =
  { kind: 'play'; mode: FireMode } | { kind: 'reject'; reason: RejectionReason };

export type HomeCommand = 'previous' | 'next' | 'insert' | 'back';

const HOME_COMMANDS: Record<string, HomeCommand> = {
  arrowleft: 'previous',
  a: 'previous',
  arrowright: 'next',
  d: 'next',
  enter: 'insert',
  space: 'insert',
  escape: 'back',
};

export function getCartridgeState(id: CartridgeId, isRootUnlocked: boolean): CartridgeState {
  if (id === 'sulfur-drift') return 'broken';
  if (id === 'root' && !isRootUnlocked) return 'sealed';
  return 'ready';
}

export function insertCartridge(id: CartridgeId, isRootUnlocked: boolean): InsertOutcome {
  const state = getCartridgeState(id, isRootUnlocked);
  if (state === 'broken') return { kind: 'reject', reason: 'no-signal' };
  if (state === 'sealed') return { kind: 'reject', reason: 'access-denied' };
  return { kind: 'play', mode: id === 'root' ? 'hotfix' : 'standard' };
}

export function getBestMode(id: CartridgeId, isRootUnlocked: boolean): FireMode {
  return id === 'root' && isRootUnlocked ? 'hotfix' : 'standard';
}

export function interpretHomeKey(key: string): HomeCommand | null {
  return HOME_COMMANDS[normalizeKey(key)] ?? null;
}
