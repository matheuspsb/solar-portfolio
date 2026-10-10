import { describe, expect, it } from 'vitest';
import { createSeededRandom } from './seeded-random';

describe('createSeededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const first = createSeededRandom(7);
    const second = createSeededRandom(7);
    for (let step = 0; step < 50; step += 1) {
      expect(first()).toBe(second());
    }
  });

  it('differs between seeds and stays inside [0, 1)', () => {
    const first = createSeededRandom(7);
    const second = createSeededRandom(42);
    expect(first()).not.toBe(second());
    const random = createSeededRandom(1);
    for (let step = 0; step < 1000; step += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
