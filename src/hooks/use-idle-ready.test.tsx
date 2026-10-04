import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { useIdleReady } from './use-idle-ready';
import type { IdleScheduler } from './use-idle-ready';

function createManualScheduler() {
  const callbacks: Array<() => void> = [];
  const cancel = vi.fn();
  const scheduler: IdleScheduler = {
    schedule: (callback) => {
      callbacks.push(callback);
      return callbacks.length;
    },
    cancel,
  };
  return { scheduler, callbacks, cancel };
}

describe('useIdleReady', () => {
  it('is not ready on the first render', () => {
    const { scheduler } = createManualScheduler();
    const { result } = renderHook(() => useIdleReady(scheduler));
    expect(result.current).toBe(false);
  });

  it('becomes ready when the scheduler fires', () => {
    const { scheduler, callbacks } = createManualScheduler();
    const { result } = renderHook(() => useIdleReady(scheduler));
    act(() => callbacks[0]!());
    expect(result.current).toBe(true);
  });

  it('cancels the scheduled work on unmount', () => {
    const { scheduler, cancel } = createManualScheduler();
    const { unmount } = renderHook(() => useIdleReady(scheduler));
    unmount();
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('schedules only once across re-renders', () => {
    const { scheduler, callbacks } = createManualScheduler();
    const { rerender } = renderHook(() => useIdleReady(scheduler));
    rerender();
    rerender();
    expect(callbacks).toHaveLength(1);
  });

  it('is not ready during server rendering', () => {
    const { scheduler, callbacks } = createManualScheduler();
    function Probe() {
      return <p>{String(useIdleReady(scheduler))}</p>;
    }
    expect(renderToString(<Probe />)).toContain('false');
    expect(callbacks).toHaveLength(0);
  });

  it('works with the default scheduler (falls back to a timer without requestIdleCallback)', async () => {
    vi.useFakeTimers();
    const original = window.requestIdleCallback;
    // @ts-expect-error simulating Safari, which has no requestIdleCallback
    delete window.requestIdleCallback;
    const { result } = renderHook(() => useIdleReady());
    expect(result.current).toBe(false);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(result.current).toBe(true);
    window.requestIdleCallback = original;
    vi.useRealTimers();
  });
});
