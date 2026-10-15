import { describe, expect, it } from 'vitest';
import { arcadeFlowReducer, createArcadeFlow } from './arcade-flow';
import type { ArcadeFlow } from './arcade-flow';

function atHome(overrides: Partial<ArcadeFlow> = {}): ArcadeFlow {
  return { ...createArcadeFlow(), screen: 'home', ...overrides };
}

describe('createArcadeFlow', () => {
  it('starts booting with the first cartridge selected and nothing rejected', () => {
    expect(createArcadeFlow()).toEqual({
      screen: 'boot',
      selectedId: 'bug-hunter',
      rejection: null,
      mode: null,
    });
  });
});

describe('boot', () => {
  it('goes to the home when it is skipped or finishes', () => {
    expect(arcadeFlowReducer(createArcadeFlow(), { type: 'finishBoot' }).screen).toBe('home');
  });

  it('ignores the home commands while booting', () => {
    const booting = createArcadeFlow();
    expect(arcadeFlowReducer(booting, { type: 'move', direction: 'next' })).toBe(booting);
    expect(arcadeFlowReducer(booting, { type: 'select', id: 'root' })).toBe(booting);
    expect(
      arcadeFlowReducer(booting, { type: 'insert', id: 'bug-hunter', isRootUnlocked: false }),
    ).toBe(booting);
  });

  it('does nothing when told to finish again from the home', () => {
    const home = atHome();
    expect(arcadeFlowReducer(home, { type: 'finishBoot' })).toBe(home);
  });
});

describe('selection', () => {
  it('moves along the shelf and wraps around at both ends', () => {
    let flow = atHome();
    flow = arcadeFlowReducer(flow, { type: 'move', direction: 'next' });
    expect(flow.selectedId).toBe('sulfur-drift');
    flow = arcadeFlowReducer(flow, { type: 'move', direction: 'next' });
    flow = arcadeFlowReducer(flow, { type: 'move', direction: 'next' });
    expect(flow.selectedId).toBe('bug-hunter');
    flow = arcadeFlowReducer(flow, { type: 'move', direction: 'previous' });
    expect(flow.selectedId).toBe('root');
  });

  it('selects a cartridge by id, as the mouse and the focus do', () => {
    expect(arcadeFlowReducer(atHome(), { type: 'select', id: 'root' }).selectedId).toBe('root');
  });

  it('keeps the same state when the cartridge is already selected', () => {
    const home = atHome();
    expect(arcadeFlowReducer(home, { type: 'select', id: 'bug-hunter' })).toBe(home);
  });
});

describe('insert', () => {
  it('starts the game with the mode of the cartridge', () => {
    const flow = arcadeFlowReducer(atHome(), {
      type: 'insert',
      id: 'bug-hunter',
      isRootUnlocked: false,
    });
    expect(flow).toMatchObject({ screen: 'game', mode: 'standard', rejection: null });
  });

  it('plays the root cartridge in hotfix mode once it is unlocked', () => {
    const flow = arcadeFlowReducer(atHome(), { type: 'insert', id: 'root', isRootUnlocked: true });
    expect(flow).toMatchObject({ screen: 'game', mode: 'hotfix' });
  });

  it('rejects the broken and the sealed cartridges and stays on the home', () => {
    const broken = arcadeFlowReducer(atHome(), {
      type: 'insert',
      id: 'sulfur-drift',
      isRootUnlocked: true,
    });
    expect(broken).toMatchObject({
      screen: 'home',
      rejection: { id: 'sulfur-drift', reason: 'no-signal' },
    });
    const sealed = arcadeFlowReducer(atHome(), {
      type: 'insert',
      id: 'root',
      isRootUnlocked: false,
    });
    expect(sealed.rejection).toEqual({ id: 'root', reason: 'access-denied' });
  });

  it('selects the cartridge that was inserted, as a click does', () => {
    const flow = arcadeFlowReducer(atHome(), {
      type: 'insert',
      id: 'sulfur-drift',
      isRootUnlocked: false,
    });
    expect(flow.selectedId).toBe('sulfur-drift');
  });

  it('forgets an old rejection once something playable is inserted', () => {
    const rejected = atHome({ rejection: { id: 'root', reason: 'access-denied' } });
    const flow = arcadeFlowReducer(rejected, {
      type: 'insert',
      id: 'bug-hunter',
      isRootUnlocked: false,
    });
    expect(flow.rejection).toBeNull();
  });

  it('is ignored while a game is on', () => {
    const playing = atHome({ screen: 'game', mode: 'standard' });
    expect(arcadeFlowReducer(playing, { type: 'insert', id: 'root', isRootUnlocked: true })).toBe(
      playing,
    );
  });
});

describe('clearing the rejection', () => {
  it('clears it, and only when there is one', () => {
    const rejected = atHome({ rejection: { id: 'root', reason: 'access-denied' } });
    expect(arcadeFlowReducer(rejected, { type: 'clearRejection' }).rejection).toBeNull();
    const clean = atHome();
    expect(arcadeFlowReducer(clean, { type: 'clearRejection' })).toBe(clean);
  });
});

describe('leaving the game', () => {
  it('goes back to the home and keeps the cartridge selected', () => {
    const playing = atHome({ screen: 'game', mode: 'hotfix', selectedId: 'root' });
    expect(arcadeFlowReducer(playing, { type: 'leaveGame' })).toMatchObject({
      screen: 'home',
      mode: null,
      selectedId: 'root',
    });
  });

  it('does nothing from the home or the boot', () => {
    const home = atHome();
    expect(arcadeFlowReducer(home, { type: 'leaveGame' })).toBe(home);
    const booting = createArcadeFlow();
    expect(arcadeFlowReducer(booting, { type: 'leaveGame' })).toBe(booting);
  });
});
