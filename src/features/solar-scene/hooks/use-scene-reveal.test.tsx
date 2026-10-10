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

function setup(
  bodyIds: readonly string[] = ['sun', 'mercury'],
  onRevealChange?: (isRevealed: boolean) => void,
) {
  return renderHook(() => useSceneReveal({ bodyIds, maxWaitMs: MAX_WAIT_MS, onRevealChange }));
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

  describe('reveal notifications', () => {
    it('reports the hidden state first', () => {
      const onRevealChange = vi.fn();
      setup(['sun', 'mercury'], onRevealChange);
      expect(onRevealChange).toHaveBeenLastCalledWith(false);
    });

    it('tells the listener once the scene is revealed', () => {
      const onRevealChange = vi.fn();
      const { result } = setup(['sun'], onRevealChange);
      act(() => {
        result.current.markBodySettled('sun');
        result.current.markEffectsReady();
      });
      expect(onRevealChange).toHaveBeenLastCalledWith(true);
    });

    it('tells the listener after the maximum wait, even with bodies still loading', () => {
      const onRevealChange = vi.fn();
      setup(['sun', 'mercury'], onRevealChange);
      act(() => {
        vi.advanceTimersByTime(MAX_WAIT_MS);
      });
      expect(onRevealChange).toHaveBeenLastCalledWith(true);
    });

    it('does not notify again when nothing changed', () => {
      const onRevealChange = vi.fn();
      const { result } = setup(['sun'], onRevealChange);
      act(() => result.current.markBodySettled('sun'));
      const callsAfterSettling = onRevealChange.mock.calls.length;
      act(() => result.current.markBodySettled('sun'));
      expect(onRevealChange).toHaveBeenCalledTimes(callsAfterSettling);
    });
  });
});
