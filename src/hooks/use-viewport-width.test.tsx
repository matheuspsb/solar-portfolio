// Use case: the scene picks its quality tier from the viewport width and must follow window
// resizes and device rotation. If the hook did not update (or leaked listeners) the scene would
// keep a desktop-sized star count on a rotated phone, or leak after unmount.
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useViewportWidth } from './use-viewport-width';

function setWindowWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
}

afterEach(() => setWindowWidth(1024));

describe('useViewportWidth', () => {
  it('returns the current window width', () => {
    setWindowWidth(500);
    const { result } = renderHook(() => useViewportWidth());
    expect(result.current).toBe(500);
  });

  it('updates on resize', () => {
    setWindowWidth(1200);
    const { result } = renderHook(() => useViewportWidth());
    act(() => {
      setWindowWidth(360);
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(360);
  });

  it('updates on orientation change', () => {
    setWindowWidth(375);
    const { result } = renderHook(() => useViewportWidth());
    act(() => {
      setWindowWidth(812);
      window.dispatchEvent(new Event('orientationchange'));
    });
    expect(result.current).toBe(812);
  });

  it('removes its listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useViewportWidth());
    unmount();
    const removed = removeSpy.mock.calls.map(([eventName]) => eventName);
    expect(removed).toContain('resize');
    expect(removed).toContain('orientationchange');
    removeSpy.mockRestore();
  });
});
