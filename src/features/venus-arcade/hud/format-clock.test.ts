import { describe, expect, it } from 'vitest';
import { formatClock } from './format-clock';

describe('formatClock', () => {
  it('shows the seconds as 00:SS', () => {
    expect(formatClock(45)).toBe('00:45');
    expect(formatClock(7)).toBe('00:07');
    expect(formatClock(0)).toBe('00:00');
  });

  it.each([-3, Number.NaN, Number.POSITIVE_INFINITY])('shows zero for %s', (seconds) => {
    expect(formatClock(seconds)).toBe('00:00');
  });

  it('rolls over past a minute instead of overflowing the digits', () => {
    expect(formatClock(75)).toBe('01:15');
  });
});
