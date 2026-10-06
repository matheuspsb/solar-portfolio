import { describe, expect, it } from 'vitest';
import { createSeededRandom, generateStarPositions } from './star-field';

describe('createSeededRandom', () => {
  it('is deterministic for the same seed', () => {
    const first = createSeededRandom(42);
    const second = createSeededRandom(42);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it('produces values in [0, 1)', () => {
    const random = createSeededRandom(7);
    for (let index = 0; index < 1000; index += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('generateStarPositions', () => {
  it('returns three coordinates per star', () => {
    const positions = generateStarPositions({
      count: 10,
      radius: 50,
      random: createSeededRandom(1),
    });
    expect(positions).toHaveLength(30);
  });

  it('places every star on the sphere of the given radius', () => {
    const radius = 80;
    const positions = generateStarPositions({ count: 200, radius, random: createSeededRandom(3) });
    for (let index = 0; index < positions.length; index += 3) {
      const distance = Math.hypot(positions[index]!, positions[index + 1]!, positions[index + 2]!);
      expect(distance).toBeCloseTo(radius, 3);
    }
  });

  it('distributes stars on both hemispheres', () => {
    const positions = generateStarPositions({
      count: 500,
      radius: 10,
      random: createSeededRandom(5),
    });
    const yValues = Array.from({ length: 500 }, (unusedValue, index) => positions[index * 3 + 1]!);
    expect(yValues.some((value) => value > 0)).toBe(true);
    expect(yValues.some((value) => value < 0)).toBe(true);
  });

  it.each([0, -5, Number.NaN, Number.POSITIVE_INFINITY])(
    'returns no stars for count %s',
    (count) => {
      expect(
        generateStarPositions({ count, radius: 10, random: createSeededRandom(1) }),
      ).toHaveLength(0);
    },
  );

  it('floors fractional counts', () => {
    expect(
      generateStarPositions({ count: 2.9, radius: 10, random: createSeededRandom(1) }),
    ).toHaveLength(6);
  });

  it.each([0, -1, Number.NaN])('returns no stars for invalid radius %s', (radius) => {
    expect(generateStarPositions({ count: 5, radius, random: createSeededRandom(1) })).toHaveLength(
      0,
    );
  });
});
