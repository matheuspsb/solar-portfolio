import { describe, expect, it } from 'vitest';
import {
  ARC_HEIGHT,
  ARC_WIDTH,
  STEP_PROGRESS,
  buildProgressPath,
  getArcPoint,
  getCometTrail,
  getPlanetState,
} from './arc-geometry';

describe('getArcPoint', () => {
  it('starts off the left edge and ends off the right edge, on the same baseline', () => {
    expect(getArcPoint(0)).toEqual({ x: -10, y: 128 });
    expect(getArcPoint(1)).toEqual({ x: 460, y: 128 });
  });

  it('peaks in the middle, above the baseline', () => {
    const middle = getArcPoint(0.5);
    expect(middle.x).toBeCloseTo(ARC_WIDTH / 2);
    expect(middle.y).toBeLessThan(ARC_HEIGHT / 2);
  });
});

describe('buildProgressPath', () => {
  it.each([0, -0.5, Number.NaN])('draws nothing for progress %s', (progress) => {
    expect(buildProgressPath(progress)).toBe('');
  });

  it('starts at the arc start and ends at the requested point', () => {
    const path = buildProgressPath(0.5);
    expect(path.startsWith('M -10.0 128.0')).toBe(true);
    const lastPoint = getArcPoint(0.5);
    expect(path.endsWith(`${lastPoint.x.toFixed(1)} ${lastPoint.y.toFixed(1)}`)).toBe(true);
  });

  it('never draws past the end of the arc', () => {
    expect(buildProgressPath(1.1)).toBe(buildProgressPath(1));
  });
});

describe('getCometTrail', () => {
  it('has no trail when the tail has caught up with the head', () => {
    expect(getCometTrail({ head: 0.5, tail: 0.5 })).toEqual([]);
  });

  it('fades from a thick bright start to a thin transparent end', () => {
    const trail = getCometTrail({ head: 0.5, tail: 0.3 });
    expect(trail).toHaveLength(18);
    const first = trail[0]!;
    const last = trail[trail.length - 1]!;
    expect(first.width).toBeGreaterThan(last.width);
    expect(first.opacity).toBeGreaterThan(last.opacity);
    expect(first.isBright).toBe(true);
    expect(last.isBright).toBe(false);
  });

  it('follows the arc from the head backwards', () => {
    const trail = getCometTrail({ head: 0.6, tail: 0.2 });
    const head = getArcPoint(0.6);
    expect(trail[0]!.from.x).toBeCloseTo(head.x);
    const tail = getArcPoint(0.2);
    expect(trail[trail.length - 1]!.to.x).toBeCloseTo(tail.x);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    'has no trail for an invalid tail (%s)',
    (tail) => {
      expect(getCometTrail({ head: 0.5, tail })).toEqual([]);
    },
  );
});

describe('getPlanetState', () => {
  const [first, second, third] = STEP_PROGRESS;

  it('is future until the comet arrives, even for the current step', () => {
    expect(
      getPlanetState({ index: 0, currentStep: 0, isDelivered: false, progress: first - 0.05 }),
    ).toBe('future');
  });

  it('is current once the comet arrives at the current step', () => {
    expect(getPlanetState({ index: 1, currentStep: 1, isDelivered: false, progress: second })).toBe(
      'current',
    );
  });

  it('counts as arrived a hair before the exact position (tween rounding)', () => {
    expect(
      getPlanetState({ index: 1, currentStep: 1, isDelivered: false, progress: second - 0.002 }),
    ).toBe('current');
  });

  it('is done for earlier steps the comet has passed', () => {
    expect(getPlanetState({ index: 0, currentStep: 2, isDelivered: false, progress: third })).toBe(
      'done',
    );
  });

  it('stays future for a later step', () => {
    expect(getPlanetState({ index: 2, currentStep: 0, isDelivered: false, progress: first })).toBe(
      'future',
    );
  });

  it('lights up every planet that was reached once the message is delivered', () => {
    expect(getPlanetState({ index: 2, currentStep: 2, isDelivered: true, progress: 1.1 })).toBe(
      'done',
    );
  });
});
