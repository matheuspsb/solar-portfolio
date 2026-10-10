import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useComet } from './use-comet';
import type { FrameScheduler } from '@/hooks/frame-scheduler';

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

function setup(
  options: {
    reducedMotion?: boolean;
    initialProgress?: number;
    entry?: { target: number; durationMs: number };
  } = {},
) {
  const clock = createManualScheduler();
  const hook = renderHook(
    (props: { reducedMotion: boolean }) =>
      useComet({
        initialProgress: options.initialProgress ?? -0.12,
        reducedMotion: props.reducedMotion,
        entry: options.entry,
        scheduler: clock.scheduler,
      }),
    { initialProps: { reducedMotion: options.reducedMotion ?? false } },
  );
  const run = (milliseconds: number) => {
    const frames = Math.ceil(milliseconds / 16);
    for (let frame = 0; frame < frames; frame += 1) act(() => clock.advance(16));
  };
  const position = () => hook.result.current.position.getSnapshot();
  return { ...hook, clock, run, position };
}

describe('useComet', () => {
  it('starts resting at the initial progress, without scheduling work', () => {
    const { position, clock } = setup({ initialProgress: 0.5 });
    expect(position().head).toBe(0.5);
    expect(position().tail).toBe(0.5);
    expect(clock.pendingCount()).toBe(0);
  });

  it('travels gradually and lands exactly on the target', async () => {
    const { result, position, run } = setup();
    let arrival: Promise<boolean> = Promise.resolve(false);
    act(() => {
      arrival = result.current.travelTo(0.17, 1000);
    });
    run(500);
    expect(position().head).toBeGreaterThan(-0.12);
    expect(position().head).toBeLessThan(0.17);
    run(600);
    expect(position().head).toBe(0.17);
    await expect(arrival).resolves.toBe(true);
  });

  it('lets the tail trail behind the head and catch up once it stops', () => {
    const { result, position, run } = setup({ initialProgress: 0 });
    act(() => {
      void result.current.travelTo(0.5, 400);
    });
    run(200);
    expect(position().tail).toBeLessThan(position().head);
    run(5000);
    expect(position().tail).toBe(0.5);
  });

  it('stops scheduling frames once everything has settled', () => {
    const { result, run, clock } = setup({ initialProgress: 0 });
    act(() => {
      void result.current.travelTo(0.5, 200);
    });
    run(6000);
    expect(clock.pendingCount()).toBe(0);
  });

  it('can start from a given progress (a restart from the entry point)', () => {
    const { result, position } = setup({ initialProgress: 0.8 });
    act(() => {
      void result.current.travelTo(0.17, 1000, -0.12);
    });
    expect(position().head).toBe(-0.12);
    expect(position().tail).toBe(-0.12);
  });

  it('survives a huge pause between frames without overshooting', async () => {
    const { result, position, clock } = setup({ initialProgress: 0 });
    let arrival: Promise<boolean> = Promise.resolve(false);
    act(() => {
      arrival = result.current.travelTo(0.5, 1000);
    });
    act(() => clock.advance(600_000));
    expect(position().head).toBe(0.5);
    await expect(arrival).resolves.toBe(true);
  });

  it('reports a travel that was replaced by a newer one as not arrived', async () => {
    const { result, position, run } = setup({ initialProgress: 0 });
    let first: Promise<boolean> = Promise.resolve(true);
    act(() => {
      first = result.current.travelTo(0.5, 1000);
    });
    run(200);
    act(() => {
      void result.current.travelTo(0.17, 500);
    });
    await expect(first).resolves.toBe(false);
    run(700);
    expect(position().head).toBe(0.17);
  });

  it('jumps straight to the target with reduced motion', async () => {
    const { result, position, clock } = setup({ reducedMotion: true });
    let arrival: Promise<boolean> = Promise.resolve(false);
    act(() => {
      arrival = result.current.travelTo(0.5, 1000);
    });
    expect(position().head).toBe(0.5);
    expect(position().tail).toBe(0.5);
    expect(clock.pendingCount()).toBe(0);
    await expect(arrival).resolves.toBe(true);
  });

  it('finishes a running travel at once when reduced motion is switched on', () => {
    const { result, position, rerender, run } = setup({ initialProgress: 0 });
    act(() => {
      void result.current.travelTo(0.5, 1000);
    });
    run(200);
    rerender({ reducedMotion: true });
    expect(position().head).toBe(0.5);
    expect(position().tail).toBe(0.5);
  });

  it('flies in to the entry target as soon as it mounts', () => {
    const { position, run } = setup({ entry: { target: 0.17, durationMs: 500 } });
    run(100);
    expect(position().head).toBeGreaterThan(-0.12);
    run(600);
    expect(position().head).toBe(0.17);
  });

  it('cancels its frame on unmount and settles a pending travel as not arrived', async () => {
    const { result, unmount, clock } = setup({ initialProgress: 0 });
    let arrival: Promise<boolean> = Promise.resolve(true);
    act(() => {
      arrival = result.current.travelTo(0.5, 1000);
    });
    unmount();
    expect(clock.pendingCount()).toBe(0);
    await expect(arrival).resolves.toBe(false);
  });

  it('does not re-render the component that owns the comet while it travels', () => {
    const clock = createManualScheduler();
    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useComet({ initialProgress: 0, reducedMotion: false, scheduler: clock.scheduler });
    });
    const rendersBeforeTravel = renderCount;
    act(() => {
      void result.current.travelTo(0.5, 1000);
    });
    for (let frame = 0; frame < 80; frame += 1) act(() => clock.advance(16));
    expect(result.current.position.getSnapshot().head).toBe(0.5);
    expect(renderCount).toBe(rendersBeforeTravel);
  });
});
