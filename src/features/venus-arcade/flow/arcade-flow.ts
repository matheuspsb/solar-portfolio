import { getAdjacentId } from '@/lib/circular-navigation';
import type { NavigationDirection } from '@/lib/circular-navigation';
import type { FireMode } from '../engine/shots';
import { CARTRIDGE_IDS, insertCartridge } from './cartridges';
import type { CartridgeId, RejectionReason } from './cartridges';

export type ArcadeScreen = 'boot' | 'home' | 'game';

export type ArcadeFlow = {
  screen: ArcadeScreen;
  selectedId: CartridgeId;
  rejection: { id: CartridgeId; reason: RejectionReason } | null;
  mode: FireMode | null;
};

export type ArcadeFlowAction =
  | { type: 'finishBoot' }
  | { type: 'select'; id: CartridgeId }
  | { type: 'move'; direction: NavigationDirection }
  | { type: 'insert'; id: CartridgeId; isRootUnlocked: boolean }
  | { type: 'clearRejection' }
  | { type: 'leaveGame' };

export function createArcadeFlow(): ArcadeFlow {
  return { screen: 'boot', selectedId: 'bug-hunter', rejection: null, mode: null };
}

function insert(flow: ArcadeFlow, id: CartridgeId, isRootUnlocked: boolean): ArcadeFlow {
  const outcome = insertCartridge(id, isRootUnlocked);
  if (outcome.kind === 'play') {
    return { ...flow, screen: 'game', selectedId: id, rejection: null, mode: outcome.mode };
  }
  return { ...flow, selectedId: id, rejection: { id, reason: outcome.reason } };
}

export function arcadeFlowReducer(flow: ArcadeFlow, action: ArcadeFlowAction): ArcadeFlow {
  if (action.type === 'finishBoot') {
    return flow.screen === 'boot' ? { ...flow, screen: 'home' } : flow;
  }
  if (action.type === 'leaveGame') {
    return flow.screen === 'game' ? { ...flow, screen: 'home', mode: null } : flow;
  }
  if (flow.screen !== 'home') return flow;

  switch (action.type) {
    case 'select':
      return action.id === flow.selectedId ? flow : { ...flow, selectedId: action.id };
    case 'move': {
      const selectedId = getAdjacentId(CARTRIDGE_IDS, flow.selectedId, action.direction);
      return selectedId === null ? flow : { ...flow, selectedId: selectedId as CartridgeId };
    }
    case 'insert':
      return insert(flow, action.id, action.isRootUnlocked);
    case 'clearRejection':
      return flow.rejection === null ? flow : { ...flow, rejection: null };
  }
}
