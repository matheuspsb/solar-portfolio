// Use case: while the camera follows a planet, the visitor may grab the scene and orbit it
// themselves. From that moment the automatic follow must stop fighting their hand, and resume only
// when they pick another body. If it never stopped, dragging would feel broken; if it never
// resumed, focusing a planet again would do nothing.
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCameraTakeover } from './use-camera-takeover';

function createFakeControls() {
  return new EventTarget();
}

describe('useCameraTakeover', () => {
  it('starts without a takeover', () => {
    const { result } = renderHook(() => useCameraTakeover(createFakeControls(), 0));
    expect(result.current.current).toBe(false);
  });

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
