import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useViewportSize } from './use-viewport-size';

function setWindowWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
}

function setWindowHeight(height: number) {
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
}

afterEach(() => {
  setWindowWidth(1024);
  setWindowHeight(768);
});

describe('useViewportSize', () => {
  it('returns the current window width and height', () => {
    setWindowWidth(500);
    setWindowHeight(900);
    const { result } = renderHook(() => useViewportSize());
    expect(result.current).toEqual({ width: 500, height: 900 });
  });

  it('updates on resize', () => {
    setWindowWidth(1200);
    const { result } = renderHook(() => useViewportSize());
    act(() => {
      setWindowWidth(360);
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.width).toBe(360);
  });

  it('updates on orientation change', () => {
    setWindowWidth(375);
    const { result } = renderHook(() => useViewportSize());
    act(() => {
      setWindowWidth(812);
      window.dispatchEvent(new Event('orientationchange'));
    });
    expect(result.current.width).toBe(812);
  });

  it('removes its listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useViewportSize());
    unmount();
    const removed = removeSpy.mock.calls.map(([eventName]) => eventName);
    expect(removed).toContain('resize');
    expect(removed).toContain('orientationchange');
    removeSpy.mockRestore();
  });

  it('keeps the same object between renders while the size does not change', () => {
    setWindowWidth(640);
    setWindowHeight(480);
    const { result, rerender } = renderHook(() => useViewportSize());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('reports a zero size on the server', () => {
    function Probe() {
      const { width, height } = useViewportSize();
      return <p>{`${width}x${height}`}</p>;
    }
    expect(renderToString(<Probe />)).toContain('0x0');
  });
});
