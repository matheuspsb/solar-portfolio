import { describe, expect, it } from 'vitest';
import { arcadeContent } from '@/content/arcade';
import { getRank } from './rank';

const { ranks } = arcadeContent;

describe('arcadeContent.ranks', () => {
  it('starts at zero and only goes up, so every score has exactly one rank', () => {
    expect(ranks[0]?.minimumScore).toBe(0);
    for (let index = 1; index < ranks.length; index += 1) {
      expect(ranks[index]!.minimumScore).toBeGreaterThan(ranks[index - 1]!.minimumScore);
    }
  });
});

describe('getRank', () => {
  it.each([
    [0, 0],
    [799, 0],
    [800, 800],
    [1999, 800],
    [2000, 2000],
    [3499, 2000],
    [3500, 3500],
    [4999, 3500],
    [5000, 5000],
    [999_999, 5000],
  ])('gives the score %s the rank that starts at %s', (score, expectedMinimum) => {
    expect(getRank(score).minimumScore).toBe(expectedMinimum);
  });

  it.each([-100, Number.NaN, Number.NEGATIVE_INFINITY])(
    'gives the lowest rank to the score %s',
    (score) => {
      expect(getRank(score).minimumScore).toBe(0);
    },
  );

  it('gives the highest rank to an infinite score', () => {
    expect(getRank(Number.POSITIVE_INFINITY).minimumScore).toBe(
      ranks[ranks.length - 1]!.minimumScore,
    );
  });
});
