// Use case: the camera should swing to a body whenever the visitor moves attention to it (Tab,
// arrow keys, click or menu), stay on it while attention leaves to the menu or the panel closes,
// and swing again when they come back to the same body. The hook turns "what is active now" into
// "where the camera should look" plus a request counter that tells the scene a new request arrived.
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCameraTarget } from './use-camera-target';

function setup(initialActiveId: string | null = null) {
  return renderHook(({ activeId }) => useCameraTarget(activeId), {
    initialProps: { activeId: initialActiveId },
  });
}

describe('useCameraTarget', () => {
  it('starts without a target', () => {
    const { result } = setup();
    expect(result.current).toEqual({ id: null, nonce: 0 });
  });

  it('targets the body that becomes active and counts it as a new request', () => {
    const { result, rerender } = setup();
    rerender({ activeId: 'mercury' });
    expect(result.current).toEqual({ id: 'mercury', nonce: 1 });
  });

  it('targets the first body active from the very first render', () => {
    const { result } = setup('sun');
    expect(result.current).toEqual({ id: 'sun', nonce: 1 });
  });

  it('does not count a re-render with the same active body as a new request', () => {
    const { result, rerender } = setup('sun');
    rerender({ activeId: 'sun' });
    rerender({ activeId: 'sun' });
    expect(result.current.nonce).toBe(1);
  });

  it('switches target and counts a new request when another body becomes active', () => {
    const { result, rerender } = setup('sun');
    rerender({ activeId: 'mercury' });
    expect(result.current).toEqual({ id: 'mercury', nonce: 2 });
  });

  it('keeps the last target when nothing is active any more', () => {
    const { result, rerender } = setup('mercury');
    rerender({ activeId: null });
    expect(result.current).toEqual({ id: 'mercury', nonce: 1 });
  });

  it('counts a new request when the same body becomes active again after a pause', () => {
    const { result, rerender } = setup('mercury');
    rerender({ activeId: null });
    rerender({ activeId: 'mercury' });
    expect(result.current).toEqual({ id: 'mercury', nonce: 2 });
  });
});
