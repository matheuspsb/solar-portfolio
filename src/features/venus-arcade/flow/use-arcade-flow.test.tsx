import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { REJECTION_VISIBLE_MS, useArcadeFlow } from './use-arcade-flow';

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
  const play = (seconds: number) => {
    act(() => {
      for (let frame = 0; frame < Math.round((seconds * 1000) / FRAME_MS); frame += 1) {
        currentTime += FRAME_MS;
        const callbacks = [...pending.values()];
        pending.clear();
        for (const callback of callbacks) callback(currentTime);
      }
    });
  };
  return { scheduler, play, pendingCount: () => pending.size };
}

function setup(isRootUnlocked = false) {
  const clock = createManualScheduler();
  const hook = renderHook(
    (props: { isRootUnlocked: boolean }) =>
      useArcadeFlow({ isRootUnlocked: props.isRootUnlocked, scheduler: clock.scheduler }),
    { initialProps: { isRootUnlocked } },
  );
  return { ...hook, ...clock };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useArcadeFlow boot', () => {
  it('starts booting and shows the lines as time goes by', () => {
    const { result, play } = setup();
    expect(result.current.flow.screen).toBe('boot');
    expect(result.current.bootProgress.visibleLines).toBe(0);
    play(1.2);
    expect(result.current.bootProgress.visibleLines).toBeGreaterThan(0);
    expect(result.current.flow.screen).toBe('boot');
  });

  it('goes to the home on its own when the boot is done, and stops asking for frames', () => {
    const { result, play, pendingCount } = setup();
    play(4);
    expect(result.current.flow.screen).toBe('home');
    expect(pendingCount()).toBe(0);
  });

  it('goes to the home right away when skipped, and stops asking for frames', () => {
    const { result, play, pendingCount } = setup();
    play(0.5);
    act(() => result.current.finishBoot());
    expect(result.current.flow.screen).toBe('home');
    play(0.1);
    expect(pendingCount()).toBe(0);
  });

  it('cancels its frame when it unmounts in the middle of the boot', () => {
    const { unmount, play, pendingCount } = setup();
    play(0.5);
    expect(pendingCount()).toBe(1);
    unmount();
    expect(pendingCount()).toBe(0);
  });
});

describe('useArcadeFlow home', () => {
  function atHome(isRootUnlocked = false) {
    const setupResult = setup(isRootUnlocked);
    act(() => setupResult.result.current.finishBoot());
    return setupResult;
  }

  it('moves the selection and selects by id', () => {
    const { result } = atHome();
    act(() => result.current.move('next'));
    expect(result.current.flow.selectedId).toBe('sulfur-drift');
    act(() => result.current.select('root'));
    expect(result.current.flow.selectedId).toBe('root');
  });

  it('starts the game when a playable cartridge is inserted and comes back on leave', () => {
    const { result } = atHome();
    act(() => result.current.insert('bug-hunter'));
    expect(result.current.flow).toMatchObject({ screen: 'game', mode: 'standard' });
    act(() => result.current.leaveGame());
    expect(result.current.flow.screen).toBe('home');
  });

  it('knows whether the root cartridge is unlocked at the moment it is inserted', () => {
    const { result, rerender } = atHome(false);
    act(() => result.current.insert('root'));
    expect(result.current.flow.rejection?.reason).toBe('access-denied');
    rerender({ isRootUnlocked: true });
    act(() => result.current.insert('root'));
    expect(result.current.flow).toMatchObject({ screen: 'game', mode: 'hotfix' });
  });

  it('shows a rejection for a little while and then clears it', () => {
    const { result } = atHome();
    act(() => result.current.insert('sulfur-drift'));
    expect(result.current.flow.rejection?.reason).toBe('no-signal');
    act(() => {
      vi.advanceTimersByTime(REJECTION_VISIBLE_MS - 1);
    });
    expect(result.current.flow.rejection).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.flow.rejection).toBeNull();
  });

  it('restarts the wait when the visitor is rejected again', () => {
    const { result } = atHome();
    act(() => result.current.insert('sulfur-drift'));
    act(() => {
      vi.advanceTimersByTime(REJECTION_VISIBLE_MS - 100);
    });
    act(() => result.current.insert('sulfur-drift'));
    act(() => {
      vi.advanceTimersByTime(REJECTION_VISIBLE_MS - 100);
    });
    expect(result.current.flow.rejection).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.flow.rejection).toBeNull();
  });

  it('does not leave a timer behind when it unmounts with a rejection on screen', () => {
    const { result, unmount } = atHome();
    act(() => result.current.insert('sulfur-drift'));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
