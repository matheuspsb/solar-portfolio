// Use case: the camera must back off far enough to show every planet, not only the Sun. A body's
// extent is how far its outer edge reaches from the center; a planet reaches its orbit plus itself.
import { describe, expect, it } from 'vitest';
import { getBodyExtent } from './body-extent';

describe('getBodyExtent', () => {
  it('is the radius for a body at the center', () => {
    expect(getBodyExtent({ radius: 2.4, orbit: null })).toBe(2.4);
  });

  it('is the orbit radius plus the body radius for a planet', () => {
    expect(
      getBodyExtent({ radius: 0.55, orbit: { radius: 4.6, periodSeconds: 70, phaseRadians: 0 } }),
    ).toBeCloseTo(5.15);
  });
});
