import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { IdleScheduler } from '@/hooks/use-idle-ready';
import { useSceneShell } from './use-scene-shell';

const immediateScheduler: IdleScheduler = {
  schedule: (callback) => {
    callback();
    return 0;
  },
  cancel: () => undefined,
};

const neverScheduler: IdleScheduler = { schedule: () => 0, cancel: () => undefined };

function setup({ hasWebGL = true, scheduler = immediateScheduler } = {}) {
  return renderHook(() => useSceneShell({ probeWebGL: () => hasWebGL, idleScheduler: scheduler }));
}

describe('useSceneShell', () => {
  it('waits to mount the scene until the browser is idle and the check is done', () => {
    const { result } = setup({ scheduler: neverScheduler });
    expect(result.current.canMountScene).toBe(false);
  });

  it('mounts the scene when WebGL works and shows no fallback', () => {
    const { result } = setup();
    expect(result.current.canMountScene).toBe(true);
    expect(result.current.fallbackMessage).toBeNull();
    expect(result.current.isSceneReady).toBe(false);
  });

  it('does not mount the scene without WebGL, shows a fallback and counts as ready', () => {
    const { result } = setup({ hasWebGL: false });
    expect(result.current.canMountScene).toBe(false);
    expect(result.current.fallbackMessage).not.toBeNull();
    expect(result.current.isSceneReady).toBe(true);
  });

  it('is ready once the scene reveals itself', () => {
    const { result } = setup();
    act(() => result.current.setIsSceneRevealed(true));
    expect(result.current.isSceneReady).toBe(true);
  });

  it('shows another fallback when the context is lost and drops it when it is restored', () => {
    const { result } = setup();
    act(() => result.current.availability.markContextLost());
    const lostMessage = result.current.fallbackMessage;
    expect(lostMessage).not.toBeNull();
    act(() => result.current.availability.markContextRestored());
    expect(result.current.fallbackMessage).toBeNull();
  });

  it('offers a retry only when WebGL exists, and a retry clears a crash', () => {
    const withoutWebGL = setup({ hasWebGL: false });
    expect(withoutWebGL.result.current.retryHandler).toBeUndefined();

    const { result } = setup();
    act(() => result.current.availability.markCrashed());
    expect(result.current.fallbackMessage).not.toBeNull();
    expect(result.current.retryHandler).toBeDefined();
    act(() => result.current.retryHandler?.());
    expect(result.current.fallbackMessage).toBeNull();
  });

  it('publishes frames on a channel that stays the same between renders', () => {
    const { result, rerender } = setup();
    const first = result.current.frameChannel;
    rerender();
    expect(result.current.frameChannel).toBe(first);
  });
});
