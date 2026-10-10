import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { MAX_LOADER_SECONDS } from '../lib/loader-clock';
import { TOTAL_REAL_SECONDS } from '../lib/timeline';
import { useLoaderRun } from './use-loader-run';

const FRAME_MS = 1000 / 60;

function createManualScheduler() {
  let currentTime = 0;
  let nextHandle = 1;
  const pending = new Map<number, (now: number) => void>();
  const scheduler: FrameScheduler = {
    now: () => currentTime,
    request: (callback) => {
      const handle = nextHandle;
      nextHandle += 1;
      pending.set(handle, callback);
      return handle;
    },
    cancel: (handle) => {
      pending.delete(handle);
    },
  };
  const advance = (milliseconds: number) => {
    currentTime += milliseconds;
    const callbacks = [...pending.values()];
    pending.clear();
    for (const callback of callbacks) callback(currentTime);
  };
  return { scheduler, advance, pendingCount: () => pending.size };
}

function setup(initialProps: { isSceneReady: boolean }) {
  const clock = createManualScheduler();
  const hook = renderHook(
    (props: { isSceneReady: boolean }) => useLoaderRun({ ...props, scheduler: clock.scheduler }),
    { initialProps },
  );
  const play = (seconds: number) => {
    act(() => {
      for (let frame = 0; frame < Math.round((seconds * 1000) / FRAME_MS); frame += 1) {
        clock.advance(FRAME_MS);
      }
    });
  };
  return { ...hook, ...clock, play };
}

describe('useLoaderRun', () => {
  it('finishes after the whole animation once the scene is ready, and then stops asking for frames', () => {
    const { result, play, pendingCount } = setup({ isSceneReady: true });
    play(TOTAL_REAL_SECONDS - 1);
    expect(result.current.isFinished).toBe(false);
    play(2);
    expect(result.current.isFinished).toBe(true);
    expect(result.current.percent).toBe(100);
    expect(pendingCount()).toBe(0);
  });

  it('waits for the scene instead of finishing, and picks up the new signal without restarting', () => {
    const { result, play, rerender } = setup({ isSceneReady: false });
    play(12);
    expect(result.current.isFinished).toBe(false);
    expect(result.current.percent).toBeLessThan(100);

    rerender({ isSceneReady: true });
    play(2);
    expect(result.current.isFinished).toBe(true);
  });

  it('gives up waiting after the safety limit', () => {
    const { result, play } = setup({ isSceneReady: false });
    play(MAX_LOADER_SECONDS + 3);
    expect(result.current.isFinished).toBe(true);
  });

  it('does not jump ahead after a long pause such as a background tab', () => {
    const { result, advance } = setup({ isSceneReady: true });
    act(() => advance(120_000));
    expect(result.current.isFinished).toBe(false);
  });

  it('skips straight to the final stage', () => {
    const { result, play } = setup({ isSceneReady: false });
    play(0.5);
    act(() => result.current.skip());
    play(2);
    expect(result.current.isFinished).toBe(true);
  });

  it('cancels the pending frame when it unmounts', () => {
    const { unmount, pendingCount } = setup({ isSceneReady: true });
    expect(pendingCount()).toBe(1);
    unmount();
    expect(pendingCount()).toBe(0);
  });
});
