import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useWebglContextEvents } from './use-webgl-context-events';

type Callbacks = { onLost: () => void; onRestored: () => void };

function setup(target: EventTarget | null, callbacks: Callbacks) {
  return renderHook(
    (props: { target: EventTarget | null; callbacks: Callbacks }) =>
      useWebglContextEvents(props.target, props.callbacks),
    { initialProps: { target, callbacks } },
  );
}

function createCallbacks(): Callbacks {
  return { onLost: vi.fn(), onRestored: vi.fn() };
}

describe('useWebglContextEvents', () => {
  it('reports a lost context and prevents the default so the browser may restore it', () => {
    const target = new EventTarget();
    const callbacks = createCallbacks();
    setup(target, callbacks);
    const event = new Event('webglcontextlost', { cancelable: true });
    target.dispatchEvent(event);
    expect(callbacks.onLost).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('reports a restored context', () => {
    const target = new EventTarget();
    const callbacks = createCallbacks();
    setup(target, callbacks);
    target.dispatchEvent(new Event('webglcontextrestored'));
    expect(callbacks.onRestored).toHaveBeenCalledTimes(1);
  });

  it('calls the latest callbacks, not the ones from the first render', () => {
    const target = new EventTarget();
    const first = createCallbacks();
    const second = createCallbacks();
    const { rerender } = setup(target, first);
    rerender({ target, callbacks: second });
    target.dispatchEvent(new Event('webglcontextlost'));
    expect(first.onLost).not.toHaveBeenCalled();
    expect(second.onLost).toHaveBeenCalledTimes(1);
  });

  it('does not stack listeners when the callbacks change on every render', () => {
    const target = new EventTarget();
    const addSpy = vi.spyOn(target, 'addEventListener');
    const { rerender } = setup(target, createCallbacks());
    rerender({ target, callbacks: createCallbacks() });
    rerender({ target, callbacks: createCallbacks() });
    expect(addSpy).toHaveBeenCalledTimes(2);
  });

  it('stops listening when it unmounts', () => {
    const target = new EventTarget();
    const callbacks = createCallbacks();
    const { unmount } = setup(target, callbacks);
    unmount();
    target.dispatchEvent(new Event('webglcontextlost'));
    target.dispatchEvent(new Event('webglcontextrestored'));
    expect(callbacks.onLost).not.toHaveBeenCalled();
    expect(callbacks.onRestored).not.toHaveBeenCalled();
  });

  it('moves to a new target and lets go of the old one', () => {
    const oldTarget = new EventTarget();
    const newTarget = new EventTarget();
    const callbacks = createCallbacks();
    const { rerender } = setup(oldTarget, callbacks);
    rerender({ target: newTarget, callbacks });
    oldTarget.dispatchEvent(new Event('webglcontextlost'));
    expect(callbacks.onLost).not.toHaveBeenCalled();
    newTarget.dispatchEvent(new Event('webglcontextlost'));
    expect(callbacks.onLost).toHaveBeenCalledTimes(1);
  });

  it('does nothing without a target', () => {
    expect(() => setup(null, createCallbacks())).not.toThrow();
  });
});
