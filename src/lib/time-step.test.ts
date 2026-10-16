import { describe, expect, it } from 'vitest';
import { isValidStep } from './time-step';

describe('isValidStep', () => {
  it.each([0.0001, 0.016, 1, 600])('accepts the step %s', (seconds) => {
    expect(isValidStep(seconds)).toBe(true);
  });

  it.each([0, -0.016, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'refuses the step %s',
    (seconds) => {
      expect(isValidStep(seconds)).toBe(false);
    },
  );
});
