import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSceneAvailability } from './use-scene-availability';
import type { IdleScheduler } from '@/hooks/use-idle-ready';

const withWebGL = () => true;
const withoutWebGL = () => false;

function createManualScheduler() {
  const callbacks: Array<() => void> = [];
  const scheduler: IdleScheduler = {
    schedule: (callback) => callbacks.push(callback),
    cancel: () => undefined,
  };
  return { scheduler, becomeIdle: () => callbacks.forEach((callback) => callback()) };
}

function renderIdle(probe: () => boolean) {
  const { scheduler, becomeIdle } = createManualScheduler();
  const rendered = renderHook(() => useSceneAvailability(probe, scheduler));
  act(() => becomeIdle());
  return rendered;
}

describe('useSceneAvailability', () => {
  it('does not probe WebGL before the browser is idle, and assumes the scene works meanwhile', () => {
    const probe = vi.fn(() => false);
    const { scheduler } = createManualScheduler();
    const { result } = renderHook(() => useSceneAvailability(probe, scheduler));
    expect(probe).not.toHaveBeenCalled();
    expect(result.current.isChecked).toBe(false);
    expect(result.current.status).toBe('working');
  });

  it('is checked once the browser is idle', () => {
    const { result } = renderIdle(withWebGL);
    expect(result.current.isChecked).toBe(true);
  });

  it('starts working when WebGL is available', () => {
    const { result } = renderIdle(withWebGL);
    expect(result.current.status).toBe('working');
    expect(result.current.canRetry).toBe(true);
  });

  it('is unavailable without WebGL, and a retry cannot help', () => {
    const { result } = renderIdle(withoutWebGL);
    expect(result.current.status).toBe('unavailable');
    expect(result.current.canRetry).toBe(false);
  });

  it('becomes unavailable after a crash but allows retrying', () => {
    const { result } = renderIdle(withWebGL);
    act(() => result.current.markCrashed());
    expect(result.current.status).toBe('unavailable');
    expect(result.current.canRetry).toBe(true);
  });

  it('retry clears the crash, restarts the scene and changes the reset key', () => {
    const { result } = renderIdle(withWebGL);
    const initialKey = result.current.resetKey;
    act(() => result.current.markCrashed());
    act(() => result.current.retry());
    expect(result.current.status).toBe('working');
    expect(result.current.resetKey).not.toBe(initialKey);
  });

  it('reports a lost context and recovers when it is restored', () => {
    const { result } = renderIdle(withWebGL);
    act(() => result.current.markContextLost());
    expect(result.current.status).toBe('contextLost');
    act(() => result.current.markContextRestored());
    expect(result.current.status).toBe('working');
  });

  it('prefers "unavailable" over "contextLost" when the scene also crashed', () => {
    const { result } = renderIdle(withWebGL);
    act(() => result.current.markContextLost());
    act(() => result.current.markCrashed());
    expect(result.current.status).toBe('unavailable');
  });

  it('retry also clears a lost-context flag', () => {
    const { result } = renderIdle(withWebGL);
    act(() => result.current.markContextLost());
    act(() => result.current.retry());
    expect(result.current.status).toBe('working');
  });

  it('marking the same state repeatedly is harmless', () => {
    const { result } = renderIdle(withWebGL);
    act(() => {
      result.current.markContextLost();
      result.current.markContextLost();
      result.current.markContextRestored();
      result.current.markContextRestored();
    });
    expect(result.current.status).toBe('working');
  });
});
