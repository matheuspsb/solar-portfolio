import { describe, expect, it } from 'vitest';
import { withAlpha } from './with-alpha';

describe('withAlpha', () => {
  it('pads a low alpha to two hex digits', () => {
    expect(withAlpha('#ffffff', 0.02)).toBe('#ffffff05');
  });

  it.each([
    [-1, '#ffffff00'],
    [Number.NaN, '#ffffff00'],
    [3, '#ffffffff'],
  ])('clamps the alpha %s into range', (alpha, expected) => {
    expect(withAlpha('#ffffff', alpha)).toBe(expected);
  });
});
