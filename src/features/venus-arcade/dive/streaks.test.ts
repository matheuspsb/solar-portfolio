import { describe, expect, it } from 'vitest';
import { advanceStreaks, createStreaks, getStreakSegment } from './streaks';

const middle = () => 0.5;
const lowest = () => 0;
const MAX_RADIUS = 1000;

describe('createStreaks', () => {
  it('makes the asked number of streaks, each with a color from the palette', () => {
    const streaks = createStreaks({ count: 12, random: middle, isInitial: true });
    expect(streaks).toHaveLength(12);
    for (const streak of streaks) expect(streak.color).toMatch(/^#/);
  });

  it.each([0, -4, Number.NaN])('makes none for the count %s', (count) => {
    expect(createStreaks({ count, random: middle, isInitial: true })).toEqual([]);
  });

  it('starts the first ones scattered and the respawned ones near the center', () => {
    const [scattered] = createStreaks({ count: 1, random: middle, isInitial: true });
    const [respawned] = createStreaks({ count: 1, random: middle, isInitial: false });
    expect(scattered!.radius).toBeGreaterThan(respawned!.radius);
  });
});

describe('advanceStreaks', () => {
  const [streak] = createStreaks({ count: 1, random: lowest, isInitial: true });

  it('moves every streak outward, faster as the dive goes on', () => {
    const early = advanceStreaks({
      streaks: [streak!],
      deltaSeconds: 0.1,
      elapsedSeconds: 0,
      maxRadius: MAX_RADIUS,
      random: middle,
    })[0]!;
    const late = advanceStreaks({
      streaks: [streak!],
      deltaSeconds: 0.1,
      elapsedSeconds: 1.5,
      maxRadius: MAX_RADIUS,
      random: middle,
    })[0]!;
    expect(early.radius).toBeGreaterThan(streak!.radius);
    expect(late.radius - streak!.radius).toBeGreaterThan(early.radius - streak!.radius);
  });

  it('sends a streak that left the screen back near the center, with a new angle', () => {
    const far = { ...streak!, radius: MAX_RADIUS + 1 };
    const [next] = advanceStreaks({
      streaks: [far],
      deltaSeconds: 0.016,
      elapsedSeconds: 0,
      maxRadius: MAX_RADIUS,
      random: middle,
    });
    expect(next!.radius).toBeLessThan(MAX_RADIUS / 2);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('ignores the step %s', (deltaSeconds) => {
    const streaks = [streak!];
    expect(
      advanceStreaks({
        streaks,
        deltaSeconds,
        elapsedSeconds: 0,
        maxRadius: MAX_RADIUS,
        random: middle,
      }),
    ).toEqual(streaks);
  });

  it('does not change the streaks it was given', () => {
    const original = { ...streak! };
    advanceStreaks({
      streaks: [streak!],
      deltaSeconds: 0.1,
      elapsedSeconds: 0,
      maxRadius: MAX_RADIUS,
      random: middle,
    });
    expect(streak).toEqual(original);
  });
});

describe('getStreakSegment', () => {
  it('draws from behind the head to the head along the streak angle, around the center', () => {
    const segment = getStreakSegment(
      { angle: 0, radius: 300, speed: 100, width: 2, color: '#fff' },
      { centerX: 500, centerY: 400, elapsedSeconds: 0 },
    );
    expect(segment.endX).toBeCloseTo(800);
    expect(segment.endY).toBeCloseTo(400);
    expect(segment.startX).toBeLessThan(segment.endX);
  });

  it('fades in from the center and caps its length', () => {
    const near = getStreakSegment(
      { angle: 0, radius: 10, speed: 100, width: 2, color: '#fff' },
      { centerX: 0, centerY: 0, elapsedSeconds: 0 },
    );
    const far = getStreakSegment(
      { angle: 0, radius: 900, speed: 100000, width: 2, color: '#fff' },
      { centerX: 0, centerY: 0, elapsedSeconds: 5 },
    );
    expect(near.alpha).toBeLessThan(far.alpha);
    expect(far.endX - far.startX).toBeLessThanOrEqual(160);
  });
});
