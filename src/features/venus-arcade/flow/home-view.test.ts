import { describe, expect, it } from 'vitest';
import { arcadeContent } from '@/content/arcade';
import { getCartridgeView, getHomeDetails } from './home-view';

const { home, a11y, cartridges } = arcadeContent;

describe('getCartridgeView', () => {
  it('shows a ready cartridge with its own name, code and status', () => {
    const view = getCartridgeView('bug-hunter', false);
    expect(view).toMatchObject({
      id: 'bug-hunter',
      name: cartridges[0].name,
      code: cartridges[0].code,
      status: cartridges[0].status,
      sprite: 'crawler',
      tone: 'ready',
      label: 'bug',
    });
  });

  it('shows the broken cartridge as having no signal, with the alert tone', () => {
    const view = getCartridgeView('sulfur-drift', true);
    expect(view).toMatchObject({ sprite: 'eye', tone: 'broken', label: 'sulfur' });
  });

  it('hides the root cartridge behind a lock while it is sealed', () => {
    const view = getCartridgeView('root', false);
    expect(view).toMatchObject({
      name: home.sealed.name,
      code: home.sealed.code,
      status: home.sealed.status,
      sprite: 'lock',
      tone: 'sealed',
      label: 'sealed',
    });
    expect(view.glyph).toBe(cartridges[2].glyph);
  });

  it('reveals the root cartridge once it is unlocked', () => {
    const view = getCartridgeView('root', true);
    expect(view).toMatchObject({
      name: cartridges[2].name,
      sprite: 'drone',
      tone: 'unlocked',
      label: 'root',
    });
  });

  it('names a sealed cartridge for a screen reader without giving the secret away', () => {
    const view = getCartridgeView('root', false);
    expect(view.accessibleName).toContain(a11y.sealedName);
    expect(view.accessibleName).toContain(a11y.states.sealed);
    expect(view.accessibleName).not.toContain(cartridges[2].name);
  });

  it('names a ready cartridge with its state in Portuguese', () => {
    expect(getCartridgeView('bug-hunter', false).accessibleName).toBe(
      `${cartridges[0].name}, ${a11y.states.ready}`,
    );
    expect(getCartridgeView('sulfur-drift', false).accessibleName).toContain(a11y.states.broken);
  });
});

describe('getHomeDetails', () => {
  const noRejection = null;

  it('describes the selected cartridge and invites the visitor to insert a ready one', () => {
    const details = getHomeDetails({
      selectedId: 'bug-hunter',
      isRootUnlocked: false,
      rejection: noRejection,
    });
    expect(details.title).toBe(cartridges[0].name);
    expect(details.description).toBe(cartridges[0].description);
    expect(details.hint).toBe(home.insertHint);
    expect(details.isRejected).toBe(false);
  });

  it('says the broken cartridge cannot be inserted', () => {
    const details = getHomeDetails({
      selectedId: 'sulfur-drift',
      isRootUnlocked: false,
      rejection: noRejection,
    });
    expect(details.hint).toBe(home.brokenHint);
  });

  it('keeps the sealed cartridge a mystery', () => {
    const details = getHomeDetails({
      selectedId: 'root',
      isRootUnlocked: false,
      rejection: noRejection,
    });
    expect(details.title).toBe(home.sealed.name);
    expect(details.description).toBe(home.sealed.description);
    expect(details.hint).toBe(home.sealedHint);
  });

  it('unlocks the description and the invitation with the root cartridge', () => {
    const details = getHomeDetails({
      selectedId: 'root',
      isRootUnlocked: true,
      rejection: noRejection,
    });
    expect(details.description).toBe(cartridges[2].description);
    expect(details.hint).toBe(home.insertHint);
  });

  it('replaces the hint with the rejection message of the selected cartridge', () => {
    const broken = getHomeDetails({
      selectedId: 'sulfur-drift',
      isRootUnlocked: false,
      rejection: { id: 'sulfur-drift', reason: 'no-signal' },
    });
    expect(broken).toMatchObject({ hint: home.noSignalMessage, isRejected: true });
    const sealed = getHomeDetails({
      selectedId: 'root',
      isRootUnlocked: false,
      rejection: { id: 'root', reason: 'access-denied' },
    });
    expect(sealed).toMatchObject({ hint: home.accessDeniedMessage, isRejected: true });
  });

  it('ignores a rejection that belongs to another cartridge', () => {
    const details = getHomeDetails({
      selectedId: 'bug-hunter',
      isRootUnlocked: false,
      rejection: { id: 'root', reason: 'access-denied' },
    });
    expect(details).toMatchObject({ hint: home.insertHint, isRejected: false });
  });

  it('announces a rejection to a screen reader in Portuguese, and says nothing otherwise', () => {
    const rejected = getHomeDetails({
      selectedId: 'sulfur-drift',
      isRootUnlocked: false,
      rejection: { id: 'sulfur-drift', reason: 'no-signal' },
    });
    expect(rejected.announcement).toBe(a11y.noSignalAnnouncement);
    const denied = getHomeDetails({
      selectedId: 'root',
      isRootUnlocked: false,
      rejection: { id: 'root', reason: 'access-denied' },
    });
    expect(denied.announcement).toBe(a11y.accessDeniedAnnouncement);
    const calm = getHomeDetails({
      selectedId: 'bug-hunter',
      isRootUnlocked: false,
      rejection: noRejection,
    });
    expect(calm.announcement).toBe('');
  });
});
