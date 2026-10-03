// Use case: Tab inside a modal must cycle through the panel controls and never leak to the
// hidden page behind it. These are the wrap-around rules, including the awkward starts (focus on
// the dialog container itself, nothing focusable at all).
import { describe, expect, it } from 'vitest';
import { getTabTarget } from './focus-trap';

describe('getTabTarget', () => {
  it('lets the browser move focus in the middle of the list', () => {
    expect(getTabTarget({ count: 3, activeIndex: 1, isShift: false })).toEqual({
      action: 'native',
    });
    expect(getTabTarget({ count: 3, activeIndex: 1, isShift: true })).toEqual({ action: 'native' });
  });

  it('wraps from the last to the first on Tab', () => {
    expect(getTabTarget({ count: 3, activeIndex: 2, isShift: false })).toEqual({
      action: 'focus',
      index: 0,
    });
  });

  it('wraps from the first to the last on Shift+Tab', () => {
    expect(getTabTarget({ count: 3, activeIndex: 0, isShift: true })).toEqual({
      action: 'focus',
      index: 2,
    });
  });

  it('sends focus into the list when it is on the container (not in the list)', () => {
    expect(getTabTarget({ count: 3, activeIndex: -1, isShift: false })).toEqual({
      action: 'focus',
      index: 0,
    });
    expect(getTabTarget({ count: 3, activeIndex: -1, isShift: true })).toEqual({
      action: 'focus',
      index: 2,
    });
  });

  it('blocks Tab when there is nothing focusable', () => {
    expect(getTabTarget({ count: 0, activeIndex: -1, isShift: false })).toEqual({
      action: 'block',
    });
  });

  it('wraps onto itself when there is a single focusable element', () => {
    expect(getTabTarget({ count: 1, activeIndex: 0, isShift: false })).toEqual({
      action: 'focus',
      index: 0,
    });
    expect(getTabTarget({ count: 1, activeIndex: 0, isShift: true })).toEqual({
      action: 'focus',
      index: 0,
    });
  });

  it('treats negative or NaN counts as empty', () => {
    expect(getTabTarget({ count: -2, activeIndex: 0, isShift: false })).toEqual({
      action: 'block',
    });
    expect(getTabTarget({ count: Number.NaN, activeIndex: 0, isShift: false })).toEqual({
      action: 'block',
    });
  });
});
