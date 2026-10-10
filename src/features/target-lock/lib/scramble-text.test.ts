import { describe, expect, it } from 'vitest';
import { SCRAMBLE_CHARACTERS, maskText, scrambleText } from './scramble-text';

const alwaysFirst = () => 0;

describe('scrambleText', () => {
  it('is the whole text for a count beyond the length', () => {
    expect(scrambleText({ text: 'SOL', revealedCount: 99, random: alwaysFirst })).toBe('SOL');
  });

  it('never scrambles spaces', () => {
    expect(scrambleText({ text: 'A B', revealedCount: 0, random: alwaysFirst })).toBe('A A');
  });

  it.each([0, -3, Number.NaN])('scrambles every letter for the count %s', (revealedCount) => {
    expect(scrambleText({ text: 'SOL', revealedCount, random: alwaysFirst })).toBe('AAA');
  });

  it('never indexes past the characters when the random source returns 1', () => {
    const result = scrambleText({ text: 'SOL', revealedCount: 0, random: () => 1 });
    for (const character of result) expect(SCRAMBLE_CHARACTERS).toContain(character);
  });
});

describe('maskText', () => {
  it('hides every letter behind the same character and keeps the spaces', () => {
    expect(maskText('SOL SOL')).toBe('### ###');
  });
});
