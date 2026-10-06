import { describe, expect, it } from 'vitest';
import { getStageScale } from './stage-scale';

describe('getStageScale', () => {
  it('keeps the design size when there is room', () => {
    expect(getStageScale(452)).toBe(1);
    expect(getStageScale(1200)).toBe(1);
  });

  it('shrinks proportionally on narrow phones', () => {
    expect(getStageScale(225)).toBeCloseTo(0.5);
    expect(getStageScale(320)).toBeCloseTo(320 / 450);
  });

  it.each([0, -10, Number.NaN, Number.POSITIVE_INFINITY])(
    'uses the design size for the unmeasured width %s',
    (width) => {
      expect(getStageScale(width)).toBe(1);
    },
  );
});
