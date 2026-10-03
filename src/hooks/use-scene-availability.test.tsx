// Use case: the 3D scene can be unavailable (no WebGL), crash while rendering, or temporarily lose
// its GPU context. The page must always know which of these states it is in, so it can show the
// right notice and offer a retry only when retrying can help. A wrong state would hide a working
// scene or offer a retry button that can never succeed.
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSceneAvailability } from './use-scene-availability';

const withWebGL = () => true;
const withoutWebGL = () => false;

describe('useSceneAvailability', () => {
  it('starts working when WebGL is available', () => {
    const { result } = renderHook(() => useSceneAvailability(withWebGL));
    expect(result.current.status).toBe('working');
    expect(result.current.canRetry).toBe(true);
  });

  it('is unavailable without WebGL, and a retry cannot help', () => {
    const { result } = renderHook(() => useSceneAvailability(withoutWebGL));
    expect(result.current.status).toBe('unavailable');
    expect(result.current.canRetry).toBe(false);
  });

  it('becomes unavailable after a crash but allows retrying', () => {
    const { result } = renderHook(() => useSceneAvailability(withWebGL));
    act(() => result.current.markCrashed());
    expect(result.current.status).toBe('unavailable');
    expect(result.current.canRetry).toBe(true);
  });

  it('retry clears the crash, restarts the scene and changes the reset key', () => {
    const { result } = renderHook(() => useSceneAvailability(withWebGL));
    const initialKey = result.current.resetKey;
    act(() => result.current.markCrashed());
    act(() => result.current.retry());
    expect(result.current.status).toBe('working');
    expect(result.current.resetKey).not.toBe(initialKey);
  });

  it('reports a lost context and recovers when it is restored', () => {
    const { result } = renderHook(() => useSceneAvailability(withWebGL));
    act(() => result.current.markContextLost());
    expect(result.current.status).toBe('contextLost');
    act(() => result.current.markContextRestored());
    expect(result.current.status).toBe('working');
  });

  it('prefers "unavailable" over "contextLost" when the scene also crashed', () => {
    const { result } = renderHook(() => useSceneAvailability(withWebGL));
    act(() => result.current.markContextLost());
    act(() => result.current.markCrashed());
    expect(result.current.status).toBe('unavailable');
  });

  it('retry also clears a lost-context flag', () => {
    const { result } = renderHook(() => useSceneAvailability(withWebGL));
    act(() => result.current.markContextLost());
    act(() => result.current.retry());
    expect(result.current.status).toBe('working');
  });

  it('marking the same state repeatedly is harmless', () => {
    const { result } = renderHook(() => useSceneAvailability(withWebGL));
    act(() => {
      result.current.markContextLost();
      result.current.markContextLost();
      result.current.markContextRestored();
      result.current.markContextRestored();
    });
    expect(result.current.status).toBe('working');
  });
});
