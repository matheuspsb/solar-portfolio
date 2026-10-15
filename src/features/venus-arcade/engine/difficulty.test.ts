import { describe, expect, it } from 'vitest';
import { MATCH_DURATION_SECONDS } from './constants';
import { getDifficulty } from './difficulty';

describe('getDifficulty', () => {
  it('rises linearly from 0 to 1 across the match', () => {
    expect(getDifficulty(0)).toBe(0);
    expect(getDifficulty(MATCH_DURATION_SECONDS / 2)).toBe(0.5);
    expect(getDifficulty(MATCH_DURATION_SECONDS)).toBe(1);
  });

  it('never leaves the 0 to 1 range, whatever the clock says', () => {
    expect(getDifficulty(-5)).toBe(0);
    expect(getDifficulty(MATCH_DURATION_SECONDS * 10)).toBe(1);
    expect(getDifficulty(Number.POSITIVE_INFINITY)).toBe(1);
    expect(getDifficulty(Number.NEGATIVE_INFINITY)).toBe(0);
    expect(getDifficulty(Number.NaN)).toBe(0);
  });
});
