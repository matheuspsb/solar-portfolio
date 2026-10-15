import { describe, expect, it } from 'vitest';
import { COUNTDOWN_SECONDS } from '../engine/constants';
import { getCountdownLabel } from './countdown';

describe('getCountdownLabel', () => {
  it.each([
    [COUNTDOWN_SECONDS, '3'],
    [1.81, '3'],
    [1.8, '2'],
    [1.21, '2'],
    [1.2, '1'],
    [0.61, '1'],
    [0.6, 'GO'],
    [0.01, 'GO'],
    [0, 'GO'],
    [-1, 'GO'],
  ])('shows %s seconds left as %s', (secondsLeft, label) => {
    expect(getCountdownLabel(secondsLeft)).toBe(label);
  });

  it('shows GO for a clock that is not a number and the three for a huge one', () => {
    expect(getCountdownLabel(Number.NaN)).toBe('GO');
    expect(getCountdownLabel(1000)).toBe('3');
  });
});
