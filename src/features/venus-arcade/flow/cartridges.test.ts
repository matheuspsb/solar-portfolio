import { describe, expect, it } from 'vitest';
import { arcadeContent } from '@/content/arcade';
import {
  CARTRIDGE_IDS,
  getBestMode,
  getCartridgeState,
  insertCartridge,
  interpretHomeKey,
} from './cartridges';

describe('CARTRIDGE_IDS', () => {
  it('lists the three cartridges in the order of the shelf, matching the content', () => {
    expect(CARTRIDGE_IDS).toEqual(['bug-hunter', 'sulfur-drift', 'root']);
    expect(arcadeContent.cartridges.map((cartridge) => cartridge.id)).toEqual([...CARTRIDGE_IDS]);
  });
});

describe('getCartridgeState', () => {
  it('has the first cartridge always ready and the second always broken', () => {
    expect(getCartridgeState('bug-hunter', false)).toBe('ready');
    expect(getCartridgeState('sulfur-drift', true)).toBe('broken');
  });

  it('seals the root cartridge until it is unlocked', () => {
    expect(getCartridgeState('root', false)).toBe('sealed');
    expect(getCartridgeState('root', true)).toBe('ready');
  });
});

describe('insertCartridge', () => {
  it('plays the first cartridge in the standard mode', () => {
    expect(insertCartridge('bug-hunter', false)).toEqual({ kind: 'play', mode: 'standard' });
  });

  it('rejects the broken cartridge as having no signal, whatever is unlocked', () => {
    expect(insertCartridge('sulfur-drift', true)).toEqual({ kind: 'reject', reason: 'no-signal' });
  });

  it('denies the sealed root cartridge and plays it in hotfix mode once unlocked', () => {
    expect(insertCartridge('root', false)).toEqual({ kind: 'reject', reason: 'access-denied' });
    expect(insertCartridge('root', true)).toEqual({ kind: 'play', mode: 'hotfix' });
  });
});

describe('getBestMode', () => {
  it('shows the hotfix best only while the root cartridge is the unlocked one on the shelf', () => {
    expect(getBestMode('root', true)).toBe('hotfix');
    expect(getBestMode('root', false)).toBe('standard');
    expect(getBestMode('bug-hunter', true)).toBe('standard');
    expect(getBestMode('sulfur-drift', true)).toBe('standard');
  });
});

describe('interpretHomeKey', () => {
  it.each([
    ['arrowleft', 'previous'],
    ['a', 'previous'],
    ['arrowright', 'next'],
    ['d', 'next'],
    ['enter', 'insert'],
    ['space', 'insert'],
    ['escape', 'back'],
  ])('reads %s as %s', (key, expected) => {
    expect(interpretHomeKey(key)).toBe(expected);
  });

  it('is not case sensitive and names the space bar', () => {
    expect(interpretHomeKey('A')).toBe('previous');
    expect(interpretHomeKey(' ')).toBe('insert');
    expect(interpretHomeKey('Escape')).toBe('back');
  });

  it.each(['w', 's', 'r', 'f5', 'arrowup', ''])('ignores %j', (key) => {
    expect(interpretHomeKey(key)).toBeNull();
  });
});
