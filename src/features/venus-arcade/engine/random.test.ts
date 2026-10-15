import { describe, expect, it } from 'vitest';
import { pickOne, randomBetween } from './random';

describe('randomBetween', () => {
  it('maps the random value onto the range', () => {
    expect(randomBetween(() => 0, 2, 4)).toBe(2);
    expect(randomBetween(() => 0.5, 2, 4)).toBe(3);
    expect(randomBetween(() => 1, 2, 4)).toBe(4);
  });
});

describe('pickOne', () => {
  const items = ['a', 'b', 'c'] as const;

  it('picks by position', () => {
    expect(pickOne(() => 0, items)).toBe('a');
    expect(pickOne(() => 0.5, items)).toBe('b');
    expect(pickOne(() => 0.99, items)).toBe('c');
  });

  it('never goes past the last item, even for a random value of 1', () => {
    expect(pickOne(() => 1, items)).toBe('c');
  });
});
