import { describe, expect, it } from 'vitest';
import { getAdjacentId } from './circular-navigation';

describe('getAdjacentId', () => {
  const ids = ['sun', 'earth', 'mars'];

  it('moves forward', () => {
    expect(getAdjacentId(ids, 'sun', 'next')).toBe('earth');
  });

  it('moves backward', () => {
    expect(getAdjacentId(ids, 'earth', 'previous')).toBe('sun');
  });

  it('wraps from the last to the first', () => {
    expect(getAdjacentId(ids, 'mars', 'next')).toBe('sun');
  });

  it('wraps from the first to the last', () => {
    expect(getAdjacentId(ids, 'sun', 'previous')).toBe('mars');
  });

  it('stays on the only item', () => {
    expect(getAdjacentId(['sun'], 'sun', 'next')).toBe('sun');
    expect(getAdjacentId(['sun'], 'sun', 'previous')).toBe('sun');
  });

  it('returns null for an empty list', () => {
    expect(getAdjacentId([], null, 'next')).toBeNull();
    expect(getAdjacentId([], 'sun', 'previous')).toBeNull();
  });

  it('starts at the first item going forward when nothing is focused', () => {
    expect(getAdjacentId(ids, null, 'next')).toBe('sun');
  });

  it('starts at the last item going backward when nothing is focused', () => {
    expect(getAdjacentId(ids, null, 'previous')).toBe('mars');
  });

  it('treats an unknown current id as nothing focused', () => {
    expect(getAdjacentId(ids, 'pluto', 'next')).toBe('sun');
    expect(getAdjacentId(ids, 'pluto', 'previous')).toBe('mars');
  });

  it('uses the first occurrence when ids are duplicated', () => {
    expect(getAdjacentId(['a', 'b', 'a'], 'a', 'next')).toBe('b');
  });
});
