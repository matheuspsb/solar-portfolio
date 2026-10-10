import { describe, expect, it } from 'vitest';
import { getTrackedBodyId } from './tracked-body';

const idle = { hoveredId: null, focusedId: null, selectedId: null };

describe('getTrackedBodyId', () => {
  it('is the focused body, which wins over the hovered one', () => {
    expect(getTrackedBodyId({ ...idle, hoveredId: 'sun', focusedId: 'mercury' })).toBe('mercury');
  });

  it('is nothing while a section is open, whatever is hovered or focused', () => {
    expect(getTrackedBodyId({ hoveredId: 'sun', focusedId: 'sun', selectedId: 'sun' })).toBeNull();
  });
});
