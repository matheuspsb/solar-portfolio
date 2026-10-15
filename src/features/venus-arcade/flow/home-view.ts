import { arcadeContent } from '@/content/arcade';
import type { SpriteName } from '../sprites/bitmaps';
import type { ArcadeFlow } from './arcade-flow';
import { getCartridgeState } from './cartridges';
import type { CartridgeId, CartridgeState } from './cartridges';

const { home, a11y, cartridges } = arcadeContent;

export type CartridgeTone = 'ready' | 'broken' | 'sealed' | 'unlocked';

export type CartridgeLabel = 'bug' | 'sulfur' | 'root' | 'sealed';

export type CartridgeView = {
  id: CartridgeId;
  name: string;
  code: string;
  status: string;
  glyph: string;
  sprite: SpriteName;
  tone: CartridgeTone;
  label: CartridgeLabel;
  accessibleName: string;
};

export type HomeDetails = {
  title: string;
  description: string;
  hint: string;
  isRejected: boolean;
  announcement: string;
};

type HomeDetailsInput = {
  selectedId: CartridgeId;
  isRootUnlocked: boolean;
  rejection: ArcadeFlow['rejection'];
};

const LABELS: Record<CartridgeId, CartridgeLabel> = {
  'bug-hunter': 'bug',
  'sulfur-drift': 'sulfur',
  root: 'root',
};

function findCartridge(id: CartridgeId) {
  return cartridges.find((cartridge) => cartridge.id === id) ?? cartridges[0];
}

export function getCartridgeView(id: CartridgeId, isRootUnlocked: boolean): CartridgeView {
  const cartridge = findCartridge(id);
  const state = getCartridgeState(id, isRootUnlocked);

  if (state === 'sealed') {
    return {
      id,
      name: home.sealed.name,
      code: home.sealed.code,
      status: home.sealed.status,
      glyph: cartridge.glyph,
      sprite: 'lock',
      tone: 'sealed',
      label: 'sealed',
      accessibleName: `${a11y.sealedName}, ${a11y.states.sealed}`,
    };
  }

  return {
    id,
    name: cartridge.name,
    code: cartridge.code,
    status: cartridge.status,
    glyph: cartridge.glyph,
    sprite: cartridge.sprite,
    tone: getTone(id, state),
    label: LABELS[id],
    accessibleName: `${cartridge.name}, ${a11y.states[state]}`,
  };
}

function getTone(id: CartridgeId, state: CartridgeState): CartridgeTone {
  if (state === 'broken') return 'broken';
  return id === 'root' ? 'unlocked' : 'ready';
}

function getRejectionMessages(reason: 'no-signal' | 'access-denied') {
  return reason === 'no-signal'
    ? { hint: home.noSignalMessage, announcement: a11y.noSignalAnnouncement }
    : { hint: home.accessDeniedMessage, announcement: a11y.accessDeniedAnnouncement };
}

function getIdleHint(state: CartridgeState): string {
  if (state === 'ready') return home.insertHint;
  return state === 'broken' ? home.brokenHint : home.sealedHint;
}

export function getHomeDetails({
  selectedId,
  isRootUnlocked,
  rejection,
}: HomeDetailsInput): HomeDetails {
  const state = getCartridgeState(selectedId, isRootUnlocked);
  const cartridge = findCartridge(selectedId);
  const isSealed = state === 'sealed';
  const isRejected = rejection !== null && rejection.id === selectedId;
  const rejected = isRejected ? getRejectionMessages(rejection.reason) : null;

  return {
    title: isSealed ? home.sealed.name : cartridge.name,
    description: isSealed ? home.sealed.description : cartridge.description,
    hint: rejected?.hint ?? getIdleHint(state),
    isRejected,
    announcement: rejected?.announcement ?? '',
  };
}
