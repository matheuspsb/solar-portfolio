import { describe, expect, it } from 'vitest';
import { getRingOffset, getUnderlinePercent } from './answer-progress';

describe('getUnderlinePercent', () => {
  it('fills completely once the answer is valid', () => {
    expect(getUnderlinePercent({ hasValue: true, isFocused: true, isValid: true })).toBe(100);
  });
});

describe('getRingOffset', () => {
  it('fills proportionally to the characters typed', () => {
    expect(getRingOffset({ count: 250, max: 500 })).toBe(50);
  });

  it('never goes beyond a full ring when over the limit', () => {
    expect(getRingOffset({ count: 900, max: 500 })).toBe(0);
  });

  it.each([-5, Number.NaN])('treats the count %s as empty', (count) => {
    expect(getRingOffset({ count, max: 500 })).toBe(100);
  });

  it.each([0, -1, Number.NaN])('treats the limit %s as empty', (max) => {
    expect(getRingOffset({ count: 10, max })).toBe(100);
  });
});
