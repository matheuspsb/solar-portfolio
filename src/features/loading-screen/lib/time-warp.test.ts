import { describe, expect, it } from 'vitest';
import { STAGES, TOTAL_DESIGN_SECONDS, TOTAL_REAL_SECONDS } from './timeline';
import { toDesignSeconds } from './time-warp';

describe('toDesignSeconds', () => {
  it('starts at zero and ends at the full design length', () => {
    expect(toDesignSeconds(0)).toBe(0);
    expect(toDesignSeconds(TOTAL_REAL_SECONDS)).toBeCloseTo(TOTAL_DESIGN_SECONDS, 10);
  });

  it('lands each stage start on its design cue', () => {
    for (const stage of STAGES) {
      expect(toDesignSeconds(stage.realStartSeconds)).toBeCloseTo(stage.designStartSeconds, 10);
    }
  });

  it('never goes backwards', () => {
    let previous = -1;
    for (let step = 0; step <= 700; step += 1) {
      const current = toDesignSeconds(step / 100);
      expect(current).toBeGreaterThanOrEqual(previous);
      previous = current;
    }
  });

  it.each([-3, Number.NaN, Number.NEGATIVE_INFINITY])('clamps %s to the start', (realSeconds) => {
    expect(toDesignSeconds(realSeconds)).toBe(0);
  });

  it.each([TOTAL_REAL_SECONDS + 50, Number.POSITIVE_INFINITY])(
    'clamps %s to the end',
    (realSeconds) => {
      expect(toDesignSeconds(realSeconds)).toBeCloseTo(TOTAL_DESIGN_SECONDS, 10);
    },
  );
});
