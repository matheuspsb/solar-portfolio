import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useImmersiveStage } from './use-immersive-stage';
import type { ImmersiveTarget } from './use-immersive-stage';

const target: ImmersiveTarget = { experience: 'venus-arcade', bodyId: 'venus' };
const DIVE_SECONDS = 1.7;
const SURFACE_SECONDS = 1.1;

function setup(initial: ImmersiveTarget | null = null, reducedMotion = false) {
  return renderHook(
    (props: { target: ImmersiveTarget | null; reducedMotion: boolean }) =>
      useImmersiveStage({ ...props, diveSeconds: DIVE_SECONDS, surfaceSeconds: SURFACE_SECONDS }),
    { initialProps: { target: initial, reducedMotion } },
  );
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useImmersiveStage', () => {
  it('stays idle with nothing open and asks for no dive', () => {
    const { result } = setup();
    expect(result.current).toMatchObject({ stage: 'idle', experience: null, dive: null });
  });

  it('dives in first, then opens the experience when the dive is over', () => {
    const { result, rerender } = setup();
    rerender({ target, reducedMotion: false });
    expect(result.current.stage).toBe('diving');
    expect(result.current.experience).toBe('venus-arcade');
    expect(result.current.dive).toMatchObject({
      bodyId: 'venus',
      direction: 'in',
      durationSeconds: DIVE_SECONDS,
    });

    act(() => vi.advanceTimersByTime(DIVE_SECONDS * 1000 - 1));
    expect(result.current.stage).toBe('diving');
    act(() => vi.advanceTimersByTime(2));
    expect(result.current.stage).toBe('open');
    expect(result.current.dive).toBeNull();
  });

  it('surfaces on the way out, keeping the experience mounted until it is done', () => {
    const { result, rerender } = setup(target);
    act(() => vi.advanceTimersByTime(DIVE_SECONDS * 1000 + 10));
    rerender({ target: null, reducedMotion: false });
    expect(result.current.stage).toBe('surfacing');
    expect(result.current.experience).toBe('venus-arcade');
    expect(result.current.dive).toMatchObject({ bodyId: 'venus', direction: 'out' });

    act(() => vi.advanceTimersByTime(SURFACE_SECONDS * 1000 + 10));
    expect(result.current).toMatchObject({ stage: 'idle', experience: null, dive: null });
  });

  it('gives each dive its own nonce so the camera restarts', () => {
    const { result, rerender } = setup();
    rerender({ target, reducedMotion: false });
    const first = result.current.dive!.nonce;
    act(() => vi.advanceTimersByTime(DIVE_SECONDS * 1000 + 10));
    rerender({ target: null, reducedMotion: false });
    expect(result.current.dive!.nonce).not.toBe(first);
  });

  it('turns back at once when leaving in the middle of the dive, without opening later', () => {
    const { result, rerender } = setup();
    rerender({ target, reducedMotion: false });
    act(() => vi.advanceTimersByTime(500));
    rerender({ target: null, reducedMotion: false });
    expect(result.current.stage).toBe('surfacing');
    act(() => vi.advanceTimersByTime(DIVE_SECONDS * 1000));
    expect(result.current.stage).toBe('idle');
  });

  it('dives again when the planet is picked while surfacing', () => {
    const { result, rerender } = setup(target);
    act(() => vi.advanceTimersByTime(DIVE_SECONDS * 1000 + 10));
    rerender({ target: null, reducedMotion: false });
    act(() => vi.advanceTimersByTime(300));
    rerender({ target, reducedMotion: false });
    expect(result.current.stage).toBe('diving');
    act(() => vi.advanceTimersByTime(DIVE_SECONDS * 1000 + 10));
    expect(result.current.stage).toBe('open');
  });

  it('opens and closes at once, with no dive, when motion is reduced', () => {
    const { result, rerender } = setup(null, true);
    rerender({ target, reducedMotion: true });
    expect(result.current).toMatchObject({ stage: 'open', experience: 'venus-arcade', dive: null });
    rerender({ target: null, reducedMotion: true });
    expect(result.current).toMatchObject({ stage: 'idle', experience: null });
  });

  it('is already open when it mounts with a target and motion reduced', () => {
    const { result } = setup(target, true);
    expect(result.current.stage).toBe('open');
  });

  it('clears its timers when it unmounts', () => {
    const { rerender, unmount } = setup();
    rerender({ target, reducedMotion: false });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
