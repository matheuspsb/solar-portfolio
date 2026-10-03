// Use case: the scene, the keyboard controls and the content panel share one interaction state.
// An id that does not exist (stale event, removed body) must not select a ghost body and open an
// empty panel; handlers must be safe to call repeatedly (Enter held down).
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useBodyInteraction } from './use-body-interaction';

const bodyIds = ['sun', 'earth'];

describe('useBodyInteraction', () => {
  it('selects a known body and exposes the highlight', () => {
    const { result } = renderHook(() => useBodyInteraction(bodyIds));
    act(() => result.current.select('sun'));
    expect(result.current.state.selectedId).toBe('sun');
    expect(result.current.highlightOf('sun')).toBe('selected');
    expect(result.current.highlightOf('earth')).toBe('none');
  });

  it('ignores unknown ids for hover, focus and select', () => {
    const { result } = renderHook(() => useBodyInteraction(bodyIds));
    act(() => {
      result.current.hover('pluto');
      result.current.focus('pluto');
      result.current.select('pluto');
    });
    expect(result.current.state).toEqual({ hoveredId: null, focusedId: null, selectedId: null });
  });

  it('deselects, and deselecting with nothing selected is harmless', () => {
    const { result } = renderHook(() => useBodyInteraction(bodyIds));
    act(() => result.current.deselect());
    expect(result.current.state.selectedId).toBeNull();
    act(() => result.current.select('sun'));
    act(() => result.current.deselect());
    expect(result.current.state.selectedId).toBeNull();
  });

  it('handles rapid repeated selection without changing the outcome', () => {
    const { result } = renderHook(() => useBodyInteraction(bodyIds));
    act(() => {
      for (let press = 0; press < 20; press += 1) result.current.select('sun');
    });
    expect(result.current.state.selectedId).toBe('sun');
  });

  it('clears the selection when the selected body disappears from the list', () => {
    const { result, rerender } = renderHook(({ ids }) => useBodyInteraction(ids), {
      initialProps: { ids: bodyIds },
    });
    act(() => result.current.select('earth'));
    rerender({ ids: ['sun'] });
    expect(result.current.state.selectedId).toBeNull();
  });

  it('works with an empty list', () => {
    const { result } = renderHook(() => useBodyInteraction([]));
    act(() => result.current.select('sun'));
    expect(result.current.state.selectedId).toBeNull();
  });
});
