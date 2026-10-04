import { renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { useWebGLSupport } from './use-webgl-support';

function Probe({ detect }: { detect: () => boolean }) {
  return <p>{useWebGLSupport(detect)}</p>;
}

describe('useWebGLSupport', () => {
  it('does not probe while disabled and reports unknown', () => {
    const detect = vi.fn(() => true);
    const { result } = renderHook(() => useWebGLSupport(detect, false));
    expect(result.current).toBe('unknown');
    expect(detect).not.toHaveBeenCalled();
  });

  it('probes once it gets enabled', () => {
    const detect = vi.fn(() => false);
    const { result, rerender } = renderHook(({ isEnabled }) => useWebGLSupport(detect, isEnabled), {
      initialProps: { isEnabled: false },
    });
    rerender({ isEnabled: true });
    expect(result.current).toBe('unsupported');
    expect(detect).toHaveBeenCalledTimes(1);
  });

  it('reports supported when detection succeeds', () => {
    const { result } = renderHook(() => useWebGLSupport(() => true));
    expect(result.current).toBe('supported');
  });

  it('reports unsupported when detection fails', () => {
    const { result } = renderHook(() => useWebGLSupport(() => false));
    expect(result.current).toBe('unsupported');
  });

  it('reports unknown during server rendering without probing the browser', () => {
    const detect = vi.fn(() => true);
    expect(renderToString(<Probe detect={detect} />)).toContain('unknown');
    expect(detect).not.toHaveBeenCalled();
  });

  it('probes only once per detector even across re-renders', () => {
    const detect = vi.fn(() => true);
    const { rerender } = renderHook(() => useWebGLSupport(detect));
    rerender();
    rerender();
    expect(detect).toHaveBeenCalledTimes(1);
  });
});
