import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCameraTakeover } from './use-camera-takeover';

function createFakeControls() {
  return new EventTarget();
}

describe('useCameraTakeover', () => {
  it('flags a takeover when the visitor starts dragging', () => {
    const controls = createFakeControls();
    const { result } = renderHook(() => useCameraTakeover(controls, 0));
    controls.dispatchEvent(new Event('start'));
    expect(result.current.current).toBe(true);
  });

  it('clears the takeover when a new focus request arrives', () => {
    const controls = createFakeControls();
    const { result, rerender } = renderHook(({ nonce }) => useCameraTakeover(controls, nonce), {
      initialProps: { nonce: 0 },
    });
    controls.dispatchEvent(new Event('start'));
    rerender({ nonce: 1 });
    expect(result.current.current).toBe(false);
  });

  it('keeps the takeover across re-renders with the same focus request', () => {
    const controls = createFakeControls();
    const { result, rerender } = renderHook(({ nonce }) => useCameraTakeover(controls, nonce), {
      initialProps: { nonce: 3 },
    });
    controls.dispatchEvent(new Event('start'));
    rerender({ nonce: 3 });
    expect(result.current.current).toBe(true);
  });

  it('works without controls', () => {
    const { result } = renderHook(() => useCameraTakeover(null, 0));
    expect(result.current.current).toBe(false);
  });

  it('stops listening on unmount', () => {
    const controls = createFakeControls();
    const { result, unmount } = renderHook(() => useCameraTakeover(controls, 0));
    unmount();
    controls.dispatchEvent(new Event('start'));
    expect(result.current.current).toBe(false);
  });
});
