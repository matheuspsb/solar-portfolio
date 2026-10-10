import { describe, expect, it } from 'vitest';
import { getLoaderFrame, STAGE_HEIGHT, STAGE_WIDTH } from './loader-frame';
import { DESIGN_CUES, TOTAL_DESIGN_SECONDS } from './timeline';

const ORBITS_VISIBLE_SECONDS = DESIGN_CUES.orbits + 2;
const SHOCKWAVE_SECONDS = DESIGN_CUES.ignition + 0.8;

function collectNumbers(value: unknown, numbers: number[] = []): number[] {
  if (typeof value === 'number') numbers.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectNumbers(item, numbers));
  else if (value !== null && typeof value === 'object') {
    Object.values(value).forEach((item) => collectNumbers(item, numbers));
  }
  return numbers;
}

describe('getLoaderFrame', () => {
  it.each([Number.NaN, -4, Number.NEGATIVE_INFINITY])(
    'renders the empty first frame for the time %s',
    (seconds) => {
      expect(getLoaderFrame(seconds, seconds)).toEqual(getLoaderFrame(0, 0));
    },
  );

  it.each([
    0,
    1.1,
    2.5,
    5.2,
    8,
    8.4,
    9.9,
    11,
    12.6,
    13.3,
    TOTAL_DESIGN_SECONDS,
    90,
    Number.POSITIVE_INFINITY,
  ])('never produces a NaN or infinite number at %s seconds', (seconds) => {
    const numbers = collectNumbers(getLoaderFrame(seconds, seconds));
    expect(numbers.every(Number.isFinite)).toBe(true);
  });

  it('starts with only the first spark: no sun, planets, dust, waves, flash or blackout', () => {
    const frame = getLoaderFrame(0, 0);
    expect(frame.sun).toBeNull();
    expect(frame.planets.rings).toHaveLength(0);
    expect(frame.planets.back).toHaveLength(0);
    expect(frame.planets.front).toHaveLength(0);
    expect(frame.dust).toHaveLength(0);
    expect(frame.waves).toHaveLength(0);
    expect(frame.stars).toHaveLength(0);
    expect(frame.flashOpacity).toBe(0);
    expect(frame.blackoutOpacity).toBe(0);
  });

  it('keeps every star inside the stage margin', () => {
    const margin = 40;
    for (let step = 0; step <= 140; step += 1) {
      const frame = getLoaderFrame(step / 10, step / 10);
      for (const star of frame.stars) {
        expect(star.toX).toBeGreaterThanOrEqual(-margin);
        expect(star.toX).toBeLessThanOrEqual(STAGE_WIDTH + margin);
        expect(star.toY).toBeGreaterThanOrEqual(-margin);
        expect(star.toY).toBeLessThanOrEqual(STAGE_HEIGHT + margin);
      }
    }
  });

  it('turns the stars into streaks during the hyperspace jump', () => {
    const jump = getLoaderFrame(DESIGN_CUES.hyperspace + 1, 0);
    const calm = getLoaderFrame(DESIGN_CUES.hyperspace - 0.1, 0);
    expect(jump.stars.some((star) => star.isStreak)).toBe(true);
    expect(calm.stars.some((star) => star.isStreak)).toBe(false);
  });

  it('puts each planet on exactly one side of the sun', () => {
    const frame = getLoaderFrame(ORBITS_VISIBLE_SECONDS, ORBITS_VISIBLE_SECONDS);
    expect(frame.planets.back.length + frame.planets.front.length).toBe(3);
    expect(frame.planets.rings).toHaveLength(3);
  });

  it('keeps the planets orbiting when only the ambient time moves, as when the loader waits', () => {
    const holdSeconds = DESIGN_CUES.finale;
    const before = getLoaderFrame(holdSeconds - 0.3, holdSeconds);
    const after = getLoaderFrame(holdSeconds - 0.3, holdSeconds + 1);
    const positionsOf = (frame: typeof before) =>
      [...frame.planets.back, ...frame.planets.front].map((planet) => [planet.x, planet.y]);
    expect(positionsOf(after)).not.toEqual(positionsOf(before));
    expect(after.sun?.radius).toBe(before.sun?.radius);
    expect(after.blackoutOpacity).toBe(before.blackoutOpacity);
  });

  it('reveals the name letter by letter and finishes fully visible', () => {
    const early = getLoaderFrame(DESIGN_CUES.orbits + 0.7, 0);
    const late = getLoaderFrame(DESIGN_CUES.orbits + 2.4, 0);
    expect(early.title.letters.length).toBe(late.title.letters.length);
    expect(early.title.letters[0]!.opacity).toBeGreaterThan(early.title.letters.at(-1)!.opacity);
    expect(late.title.letters.every((letter) => letter.opacity === 1)).toBe(true);
  });

  it('lets the sun grow past the screen and fades everything to black at the end', () => {
    const frame = getLoaderFrame(TOTAL_DESIGN_SECONDS, TOTAL_DESIGN_SECONDS);
    const diagonal = Math.hypot(STAGE_WIDTH, STAGE_HEIGHT);
    expect(frame.sun!.radius * 2).toBeGreaterThan(diagonal * 0.9);
    expect(frame.blackoutOpacity).toBe(1);
    expect(frame.contentOpacity).toBe(0);
  });

  it('shows the sun with a flash and shockwaves right after the ignition', () => {
    const frame = getLoaderFrame(SHOCKWAVE_SECONDS, 0);
    expect(frame.flashOpacity).toBeGreaterThan(0);
    expect(frame.waves.length).toBeGreaterThan(0);
  });

  it('shows the hud and the first stage label at full strength on the very first frame, so the server-rendered page already gives feedback', () => {
    const { hud } = getLoaderFrame(0, 0);
    expect(hud.opacity).toBe(1);
    expect(hud.stageOpacity).toBe(1);
  });

  it('picks the hud stage from the design time and never goes below the first stage', () => {
    expect(getLoaderFrame(0, 0).hud.stageIndex).toBe(1);
    expect(getLoaderFrame(DESIGN_CUES.orbits + 0.1, 0).hud.stageIndex).toBe(5);
    expect(getLoaderFrame(TOTAL_DESIGN_SECONDS, 0).hud.stageIndex).toBe(5);
  });
});
