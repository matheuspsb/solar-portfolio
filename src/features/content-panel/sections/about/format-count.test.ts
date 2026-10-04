// Use case: the stack heading says "6 corpos" (or "1 corpo"). Wrong plurals or "NaN corpos" would
// look careless in the first thing a recruiter reads in the panel.
import { describe, expect, it } from 'vitest';
import { formatBodyCount } from './format-count';

describe('formatBodyCount', () => {
  it('uses the plural for several bodies', () => {
    expect(formatBodyCount(6)).toBe('6 corpos');
    expect(formatBodyCount(2)).toBe('2 corpos');
  });

  it('uses the singular for exactly one', () => {
    expect(formatBodyCount(1)).toBe('1 corpo');
  });

  it('uses the plural for zero', () => {
    expect(formatBodyCount(0)).toBe('0 corpos');
  });

  it.each([-3, Number.NaN, Number.POSITIVE_INFINITY])('falls back to zero for %s', (count) => {
    expect(formatBodyCount(count)).toBe('0 corpos');
  });

  it('floors fractional counts', () => {
    expect(formatBodyCount(2.9)).toBe('2 corpos');
  });
});
