import { describe, expect, it } from 'vitest';
import { chaseTail, easeInOutCubic, getTweenFrame } from './comet-motion';

describe('easeInOutCubic', () => {
  it('starts at 0, ends at 1 and is 0.5 in the middle', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
  });

  it('is slower than linear at the start and faster in the middle', () => {
    expect(easeInOutCubic(0.2)).toBeLessThan(0.2);
    expect(easeInOutCubic(0.6)).toBeGreaterThan(0.6);
  });

  it.each([-1, 2, Number.NaN])('stays within 0 and 1 for %s', (progress) => {
    const eased = easeInOutCubic(progress);
    expect(eased).toBeGreaterThanOrEqual(0);
    expect(eased).toBeLessThanOrEqual(1);
  });
});

describe('getTweenFrame', () => {
  const tween = { from: 0, to: 1, startedAt: 1000, durationMs: 1000 };

  it('is at the start before any time has passed', () => {
    expect(getTweenFrame({ ...tween, now: 1000 })).toEqual({ value: 0, isFinished: false });
  });

  it('is between the ends while running', () => {
    const frame = getTweenFrame({ ...tween, now: 1500 });
    expect(frame.value).toBeCloseTo(0.5);
    expect(frame.isFinished).toBe(false);
  });

  it('lands exactly on the target when the time is up', () => {
    expect(getTweenFrame({ ...tween, now: 2000 })).toEqual({ value: 1, isFinished: true });
  });

  it('does not overshoot after a long pause (background tab)', () => {
    expect(getTweenFrame({ ...tween, now: 600_000 })).toEqual({ value: 1, isFinished: true });
  });

  it('works backwards too', () => {
    const frame = getTweenFrame({ from: 1, to: 0.5, startedAt: 0, durationMs: 100, now: 100 });
    expect(frame).toEqual({ value: 0.5, isFinished: true });
  });

  it.each([0, -50, Number.NaN])('finishes at once for the duration %s', (durationMs) => {
    expect(getTweenFrame({ ...tween, durationMs, now: 1000 })).toEqual({
      value: 1,
      isFinished: true,
    });
  });

  it('does not run before it started (clock skew)', () => {
    expect(getTweenFrame({ ...tween, now: 0 })).toEqual({ value: 0, isFinished: false });
  });
});

describe('chaseTail', () => {
  it('moves toward the head without passing it', () => {
    const tail = chaseTail({ tail: 0, head: 1, deltaSeconds: 1 / 60 });
    expect(tail).toBeGreaterThan(0);
    expect(tail).toBeLessThan(1);
  });

  it('is frame-rate independent: two half frames equal one full frame', () => {
    const halves = chaseTail({
      tail: chaseTail({ tail: 0, head: 1, deltaSeconds: 1 / 120 }),
      head: 1,
      deltaSeconds: 1 / 120,
    });
    expect(halves).toBeCloseTo(chaseTail({ tail: 0, head: 1, deltaSeconds: 1 / 60 }));
  });

  it('snaps to the head once it is close enough', () => {
    expect(chaseTail({ tail: 0.99995, head: 1, deltaSeconds: 1 / 60 })).toBe(1);
  });

  it('stays put for a zero delta', () => {
    expect(chaseTail({ tail: 0.2, head: 1, deltaSeconds: 0 })).toBe(0.2);
  });

  it('reaches the head after a huge delta', () => {
    expect(chaseTail({ tail: 0, head: 1, deltaSeconds: 600 })).toBe(1);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    'jumps to the head when the tail is %s',
    (tail) => {
      expect(chaseTail({ tail, head: 0.5, deltaSeconds: 1 / 60 })).toBe(0.5);
    },
  );

  it('keeps the tail when the head is invalid', () => {
    expect(chaseTail({ tail: 0.2, head: Number.NaN, deltaSeconds: 1 / 60 })).toBe(0.2);
  });

  it('keeps the tail for a negative delta', () => {
    expect(chaseTail({ tail: 0.2, head: 1, deltaSeconds: -1 })).toBe(0.2);
  });
});
