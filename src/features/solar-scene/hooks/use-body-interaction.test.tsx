import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Highlight } from '@/domain/interaction-state';
import { INSTANT_EASING_RATE } from '../lib/motion';
import { createFakeScene, inScene } from '../test/in-scene';
import { useBodyHighlight, useBodyInteraction } from './use-body-interaction';

function setup(
  options: { prefersReducedMotion?: boolean; highlights?: Record<string, Highlight> } = {},
) {
  const scene = createFakeScene(options);
  const wrapper = ({ children }: { children: ReactNode }) => inScene(children, scene);
  return { scene, wrapper };
}

describe('useBodyInteraction', () => {
  it('reads the highlight of its own body, not of the others', () => {
    const { wrapper } = setup({ highlights: { sun: 'focused', mercury: 'hovered' } });
    const { result } = renderHook(() => useBodyInteraction('mercury'), { wrapper });
    expect(result.current.highlight).toBe('hovered');
  });

  it('reports hover changes for its own body and shows a pointer cursor while hovered', () => {
    const { scene, wrapper } = setup();
    const { result } = renderHook(() => useBodyInteraction('mercury'), { wrapper });
    act(() => result.current.onPointerOver());
    expect(scene.onHoverChange).toHaveBeenLastCalledWith('mercury', true);
    expect(document.body.style.cursor).toBe('pointer');
    act(() => result.current.onPointerOut());
    expect(scene.onHoverChange).toHaveBeenLastCalledWith('mercury', false);
    expect(document.body.style.cursor).toBe('auto');
  });

  it('does not leave the pointer cursor behind when the body leaves the scene while hovered', () => {
    const { wrapper } = setup();
    const { result, unmount } = renderHook(() => useBodyInteraction('sun'), { wrapper });
    act(() => result.current.onPointerOver());
    expect(document.body.style.cursor).toBe('pointer');
    unmount();
    expect(document.body.style.cursor).toBe('auto');
  });

  it('selects its own body', () => {
    const { scene, wrapper } = setup();
    const { result } = renderHook(() => useBodyInteraction('mercury'), { wrapper });
    result.current.onSelect();
    expect(scene.onSelect).toHaveBeenCalledWith('mercury');
  });

  it('eases the highlight smoothly with motion allowed', () => {
    const { wrapper } = setup({ prefersReducedMotion: false });
    const { result } = renderHook(() => useBodyInteraction('sun'), { wrapper });
    expect(Number.isFinite(result.current.highlightEasingRate)).toBe(true);
    expect(result.current.highlightEasingRate).toBeGreaterThan(0);
  });

  it('applies the highlight instantly with reduced motion', () => {
    const { wrapper } = setup({ prefersReducedMotion: true });
    const { result } = renderHook(() => useBodyInteraction('sun'), { wrapper });
    expect(result.current.highlightEasingRate).toBe(INSTANT_EASING_RATE);
  });

  it('fails loudly outside the scene instead of rendering a body that ignores the pointer', () => {
    const silenceReactError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useBodyInteraction('sun'))).toThrow();
    silenceReactError.mockRestore();
  });
});

describe('useBodyHighlight', () => {
  it('reads the highlight of its own body, for decorations that do not react to the pointer', () => {
    const { wrapper } = setup({ highlights: { sun: 'selected' } });
    const { result } = renderHook(() => useBodyHighlight('sun'), { wrapper });
    expect(result.current).toBe('selected');
  });
});
