import { describe, expect, it } from 'vitest';
import {
  getHighlight,
  getHighlightGlow,
  getHighlightScale,
  initialInteractionState,
  interactionReducer,
  isClickGesture,
} from './interaction-state';
import type { InteractionState } from './interaction-state';

function reduce(actions: Parameters<typeof interactionReducer>[1][]): InteractionState {
  return actions.reduce(interactionReducer, initialInteractionState);
}

describe('interactionReducer', () => {
  it('tracks hover and unhover of the same body', () => {
    const hovered = reduce([{ type: 'hover', id: 'sun' }]);
    expect(hovered.hoveredId).toBe('sun');
    expect(interactionReducer(hovered, { type: 'unhover', id: 'sun' }).hoveredId).toBeNull();
  });

  it('ignores an unhover from a body that is no longer the hovered one', () => {
    const state = reduce([
      { type: 'hover', id: 'earth' },
      { type: 'unhover', id: 'sun' },
    ]);
    expect(state.hoveredId).toBe('earth');
  });

  it('tracks focus and blur, ignoring a stale blur', () => {
    const focused = reduce([{ type: 'focus', id: 'sun' }]);
    expect(focused.focusedId).toBe('sun');
    expect(interactionReducer(focused, { type: 'blur', id: 'earth' }).focusedId).toBe('sun');
    expect(interactionReducer(focused, { type: 'blur', id: 'sun' }).focusedId).toBeNull();
  });

  it('selects and clears the selection', () => {
    const selected = reduce([{ type: 'select', id: 'sun' }]);
    expect(selected.selectedId).toBe('sun');
    expect(interactionReducer(selected, { type: 'deselect' }).selectedId).toBeNull();
  });

  it('selecting twice (repeated Enter) is idempotent', () => {
    const once = reduce([{ type: 'select', id: 'sun' }]);
    expect(interactionReducer(once, { type: 'select', id: 'sun' })).toBe(once);
  });

  it('keeps hover and focus when the selection is cleared', () => {
    const state = reduce([
      { type: 'hover', id: 'sun' },
      { type: 'focus', id: 'sun' },
      { type: 'select', id: 'sun' },
      { type: 'deselect' },
    ]);
    expect(state).toEqual({ hoveredId: 'sun', focusedId: 'sun', selectedId: null });
  });
});

describe('getHighlight', () => {
  it('is none for an untouched body', () => {
    expect(getHighlight(initialInteractionState, 'sun')).toBe('none');
  });

  it('prefers selected over focused over hovered', () => {
    const base = { hoveredId: 'sun', focusedId: 'sun', selectedId: 'sun' };
    expect(getHighlight(base, 'sun')).toBe('selected');
    expect(getHighlight({ ...base, selectedId: null }, 'sun')).toBe('focused');
    expect(getHighlight({ ...base, selectedId: null, focusedId: null }, 'sun')).toBe('hovered');
  });

  it('does not highlight other bodies', () => {
    expect(getHighlight({ hoveredId: 'sun', focusedId: null, selectedId: null }, 'earth')).toBe(
      'none',
    );
  });
});

describe('isClickGesture', () => {
  it('accepts a click with almost no movement', () => {
    expect(isClickGesture(0)).toBe(true);
    expect(isClickGesture(2)).toBe(true);
  });

  it('rejects a drag (orbit gesture)', () => {
    expect(isClickGesture(40)).toBe(false);
  });

  it.each([Number.NaN, -1])('rejects invalid movement %s', (movement) => {
    expect(isClickGesture(movement)).toBe(false);
  });
});

describe('getHighlightGlow', () => {
  it('adds a little light to a body that is pointed at, hovered or focused, and opened', () => {
    for (const highlight of ['hovered', 'focused', 'selected'] as const) {
      expect(getHighlightGlow(highlight)).toBeGreaterThan(0);
      expect(getHighlightGlow(highlight)).toBeLessThan(0.5);
    }
  });
});

describe('getHighlightScale', () => {
  it('keeps the natural size when nothing is highlighted', () => {
    expect(getHighlightScale('none')).toBe(1);
  });

  it('grows progressively with the strength of the highlight', () => {
    expect(getHighlightScale('hovered')).toBeGreaterThan(1);
    expect(getHighlightScale('focused')).toBeGreaterThan(getHighlightScale('hovered'));
    expect(getHighlightScale('selected')).toBeGreaterThanOrEqual(getHighlightScale('focused'));
  });
});
