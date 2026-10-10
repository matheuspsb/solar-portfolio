import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSceneReveal } from './use-scene-reveal';

const MAX_WAIT_MS = 4000;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function setup(bodyIds: readonly string[] = ['sun', 'mercury']) {
  return renderHook(() => useSceneReveal({ bodyIds, maxWaitMs: MAX_WAIT_MS }));
}

describe('useSceneReveal', () => {
  it('stays hidden while a body is still waiting for its texture', () => {
    const { result } = setup();
    act(() => {
      result.current.markEffectsReady();
      result.current.markBodySettled('sun');
    });
    expect(result.current.isRevealed).toBe(false);
  });

  it('stays hidden while the lighting effects are not ready, even with every body settled', () => {
    const { result } = setup();
    act(() => {
      result.current.markBodySettled('sun');
      result.current.markBodySettled('mercury');
    });
    expect(result.current.isRevealed).toBe(false);
  });

  it('reveals once every body has settled and the effects are ready, in any order', () => {
    const { result } = setup();
    act(() => {
      result.current.markBodySettled('mercury');
      result.current.markEffectsReady();
      result.current.markBodySettled('sun');
    });
    expect(result.current.isRevealed).toBe(true);
  });

  it('counts a body only once, however many times it reports', () => {
    const { result } = setup();
    act(() => {
      result.current.markEffectsReady();
      result.current.markBodySettled('sun');
      result.current.markBodySettled('sun');
      result.current.markBodySettled('sun');
    });
    expect(result.current.isRevealed).toBe(false);
  });

  it('ignores a body it does not know about', () => {
    const { result } = setup();
    act(() => {
      result.current.markEffectsReady();
      result.current.markBodySettled('pluto');
      result.current.markBodySettled('sun');
    });
    expect(result.current.isRevealed).toBe(false);
  });

  it('only waits for the effects when there are no bodies', () => {
    const { result } = setup([]);
    act(() => result.current.markEffectsReady());
    expect(result.current.isRevealed).toBe(true);
  });

  it('reveals anyway after the maximum wait, so a stuck load never leaves a blank screen', () => {
    const { result } = setup();
    act(() => {
      vi.advanceTimersByTime(MAX_WAIT_MS - 1);
    });
    expect(result.current.isRevealed).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isRevealed).toBe(true);
  });

  it('does not leave its timer behind when it unmounts', () => {
    const { unmount } = setup();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
