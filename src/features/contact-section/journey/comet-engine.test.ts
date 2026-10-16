import { describe, expect, it } from 'vitest';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { createCometEngine } from './comet-engine';
import { createCometStore } from './comet-store';

const FRAME_MS = 16;

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

function setup({ isReducedMotion = false, start = 0 } = {}) {
  const clock = createManualScheduler();
  const store = createCometStore({ head: start, tail: start });
  const engine = createCometEngine({ store, scheduler: clock.scheduler, isReducedMotion });
  const run = (milliseconds: number) => {
    for (let elapsed = 0; elapsed < milliseconds; elapsed += FRAME_MS) clock.advance(FRAME_MS);
  };
  return { clock, store, engine, run };
}

describe('createCometEngine', () => {
  it('rests without scheduling any work', () => {
    const { clock, store } = setup({ start: 0.4 });
    expect(store.getSnapshot()).toEqual({ head: 0.4, tail: 0.4 });
    expect(clock.pendingCount()).toBe(0);
  });

  it('moves the head to the target over the duration and resolves true on arrival', async () => {
    const { engine, store, run } = setup();
    let hasArrived: boolean | null = null;
    void engine.travelTo(1, 500).then((value) => {
      hasArrived = value;
    });
    run(250);
    expect(store.getSnapshot().head).toBeGreaterThan(0);
    expect(store.getSnapshot().head).toBeLessThan(1);
    expect(hasArrived).toBeNull();
    run(400);
    await Promise.resolve();
    expect(store.getSnapshot().head).toBe(1);
    expect(hasArrived).toBe(true);
  });

  it('lets the tail catch up with the head and then stops asking for frames', () => {
    const { engine, store, clock, run } = setup();
    void engine.travelTo(1, 200);
    run(200);
    run(3000);
    expect(store.getSnapshot()).toEqual({ head: 1, tail: 1 });
    expect(clock.pendingCount()).toBe(0);
  });

  it('resolves the interrupted trip with false and carries on with the new one', async () => {
    const { engine, store, run } = setup();
    const first = engine.travelTo(1, 1000);
    run(200);
    const second = engine.travelTo(0.2, 300);
    await expect(first).resolves.toBe(false);
    run(500);
    await expect(second).resolves.toBe(true);
    expect(store.getSnapshot().head).toBe(0.2);
  });

  it('starts from the given point when one is passed', () => {
    const { engine, store } = setup({ start: 0 });
    void engine.travelTo(0.8, 400, 0.5);
    expect(store.getSnapshot()).toEqual({ head: 0.5, tail: 0.5 });
  });

  it('arrives at once, without frames, when motion is reduced', async () => {
    const { engine, store, clock } = setup({ isReducedMotion: true });
    await expect(engine.travelTo(0.7, 1000)).resolves.toBe(true);
    expect(store.getSnapshot()).toEqual({ head: 0.7, tail: 0.7 });
    expect(clock.pendingCount()).toBe(0);
  });

  it.each([0, -5, Number.NaN])('arrives at once for the duration %s', async (durationMs) => {
    const { engine, store } = setup();
    await expect(engine.travelTo(0.6, durationMs)).resolves.toBe(true);
    expect(store.getSnapshot().head).toBe(0.6);
  });

  it('finishes the trip in progress where it was going when motion becomes reduced', async () => {
    const { engine, store, run } = setup();
    const trip = engine.travelTo(1, 2000);
    run(300);
    engine.setReducedMotion(true);
    await expect(trip).resolves.toBe(true);
    expect(store.getSnapshot()).toEqual({ head: 1, tail: 1 });
  });

  it('does nothing when reduced motion is set with no trip going', () => {
    const { engine, store } = setup({ start: 0.3 });
    engine.setReducedMotion(true);
    expect(store.getSnapshot()).toEqual({ head: 0.3, tail: 0.3 });
  });

  it('goes back to animating when motion is allowed again', async () => {
    const { engine, store, run } = setup({ isReducedMotion: true });
    engine.setReducedMotion(false);
    const trip = engine.travelTo(1, 400);
    run(100);
    expect(store.getSnapshot().head).toBeLessThan(1);
    run(600);
    await expect(trip).resolves.toBe(true);
  });

  it('cancels the pending frame and resolves the trip with false on dispose', async () => {
    const { engine, clock } = setup();
    const trip = engine.travelTo(1, 1000);
    expect(clock.pendingCount()).toBe(1);
    engine.dispose();
    expect(clock.pendingCount()).toBe(0);
    await expect(trip).resolves.toBe(false);
  });

  it('can travel again after being disposed, as when React runs the cleanup twice', async () => {
    const { engine, store, run } = setup();
    void engine.travelTo(1, 500);
    engine.dispose();
    const trip = engine.travelTo(0.5, 300);
    run(500);
    await expect(trip).resolves.toBe(true);
    expect(store.getSnapshot().head).toBe(0.5);
  });
});
