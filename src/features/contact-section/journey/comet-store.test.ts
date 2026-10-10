import { describe, expect, it, vi } from 'vitest';
import { createCometStore } from './comet-store';

describe('createCometStore', () => {
  it('starts at the given position', () => {
    const store = createCometStore({ head: 0.2, tail: 0.1 });
    expect(store.getSnapshot()).toEqual({ head: 0.2, tail: 0.1 });
  });

  it('notifies subscribers when the position changes and hands out a new snapshot', () => {
    const store = createCometStore({ head: 0, tail: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    const before = store.getSnapshot();
    store.set({ head: 0.5, tail: 0.3 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).not.toBe(before);
    expect(store.getSnapshot()).toEqual({ head: 0.5, tail: 0.3 });
  });

  it('keeps the same snapshot and stays quiet when the position did not change', () => {
    const store = createCometStore({ head: 0.5, tail: 0.5 });
    const listener = vi.fn();
    store.subscribe(listener);
    const before = store.getSnapshot();
    store.set({ head: 0.5, tail: 0.5 });
    expect(listener).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toBe(before);
  });

  it('stops notifying a subscriber that unsubscribed, and tolerates unsubscribing twice', () => {
    const store = createCometStore({ head: 0, tail: 0 });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    unsubscribe();
    store.set({ head: 1, tail: 1 });
    expect(listener).not.toHaveBeenCalled();
  });
});
