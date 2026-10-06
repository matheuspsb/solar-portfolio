import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useElementWidth } from './use-element-width';

type ObserverCallback = (entries: { contentRect: { width: number } }[]) => void;

function installResizeObserver() {
  const state: { callback: ObserverCallback | null; disconnected: boolean } = {
    callback: null,
    disconnected: false,
  };
  class FakeResizeObserver {
    constructor(callback: ObserverCallback) {
      state.callback = callback;
    }
    observe() {}
    disconnect() {
      state.disconnected = true;
    }
  }
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  return state;
}

function Probe() {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="box">
      {width}
    </div>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useElementWidth', () => {
  it('starts unmeasured, as 0, and reports the width the observer gives', () => {
    const observer = installResizeObserver();
    render(<Probe />);
    expect(screen.getByTestId('box')).toHaveTextContent('0');
    act(() => observer.callback?.([{ contentRect: { width: 320 } }]));
    expect(screen.getByTestId('box')).toHaveTextContent('320');
  });

  it('stops observing on unmount', () => {
    const observer = installResizeObserver();
    const { unmount } = render(<Probe />);
    unmount();
    expect(observer.disconnected).toBe(true);
  });

  it('stays unmeasured, without crashing, where ResizeObserver does not exist', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    render(<Probe />);
    expect(screen.getByTestId('box')).toHaveTextContent('0');
  });
});
