import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { celestialBodies } from '@/content/celestial-bodies';
import { usePortfolioModel } from './use-portfolio-model';

function setup(bodies = celestialBodies) {
  return renderHook(() => usePortfolioModel(bodies).model);
}

describe('usePortfolioModel', () => {
  it('offers one menu item, one keyboard item and one lock target per body that opens a section', () => {
    const { result } = setup();
    const interactiveCount = celestialBodies.filter((body) => body.section !== null).length;
    expect(result.current.menuItems).toHaveLength(interactiveCount);
    expect(result.current.keyboardItems).toHaveLength(interactiveCount);
    expect(result.current.lockTargets).toHaveLength(interactiveCount);
  });

  it('leaves scenery out of every list', () => {
    const scenery = { ...celestialBodies[1]!, id: 'scenery', section: null };
    const { result } = setup([...celestialBodies, scenery]);
    const ids = result.current.menuItems.map((item) => item.id);
    expect(ids).not.toContain('scenery');
    expect(result.current.keyboardItems.map((item) => item.id)).not.toContain('scenery');
  });

  it('starts with nothing open', () => {
    const { result } = setup();
    expect(result.current.selectedBody).toBeUndefined();
    expect(result.current.openPanel).toBeNull();
    expect(result.current.openExperience).toBeNull();
    expect(result.current.trackedBodyId).toBeNull();
  });

  it('opens a panel for a body with a panel section', () => {
    const { result } = setup();
    act(() => result.current.openBody('sun'));
    expect(result.current.selectedBody?.id).toBe('sun');
    expect(result.current.openPanel).not.toBeNull();
    expect(result.current.openExperience).toBeNull();
  });

  it('opens an experience, not a panel, for a body with an immersive section', () => {
    const { result } = setup();
    act(() => result.current.openBody('venus'));
    expect(result.current.openExperience).toBe('venus-arcade');
    expect(result.current.openPanel).toBeNull();
  });

  it('closes whatever is open with deselect', () => {
    const { result } = setup();
    act(() => result.current.openBody('sun'));
    act(() => result.current.deselect());
    expect(result.current.selectedBody).toBeUndefined();
    expect(result.current.openPanel).toBeNull();
  });

  it('ignores an id it does not know', () => {
    const { result } = setup();
    act(() => result.current.openBody('pluto'));
    expect(result.current.selectedBody).toBeUndefined();
  });

  it('turns the pointer entering and leaving into a highlight and back', () => {
    const { result } = setup();
    act(() => result.current.changeHover('sun', true));
    expect(result.current.highlightOf('sun')).toBe('hovered');
    act(() => result.current.changeHover('sun', false));
    expect(result.current.highlightOf('sun')).toBe('none');
  });

  it('points the camera at the focused or selected body', () => {
    const { result } = setup();
    expect(result.current.cameraTarget.id).toBeNull();
    act(() => result.current.focusBody('mercury'));
    expect(result.current.cameraTarget.id).toBe('mercury');
  });

  it('has nowhere to give the focus back to before anything was opened', () => {
    const { result } = setup();
    expect(result.current.focusLastOpenedBody()).toBeNull();
  });
});
