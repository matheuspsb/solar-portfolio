import { describe, expect, it } from 'vitest';
import {
  MAX_PARTICLES,
  SHAKE_SECONDS,
  addBurst,
  addFloatingText,
  addShake,
  advanceEffects,
  createEffects,
} from './effects';

const lowest = () => 0;
const highest = () => 1;
const middle = () => 0.5;

describe('addBurst', () => {
  it('adds the asked number of particles in the asked color at the spot', () => {
    const effects = addBurst(createEffects(), { x: 100, y: 50, color: '#fff', count: 5 }, middle);
    expect(effects.particles).toHaveLength(5);
    for (const particle of effects.particles) {
      expect(particle).toMatchObject({ x: 100, y: 50, color: '#fff' });
    }
  });

  it('keeps speed, life and size inside their ranges at both ends of the dice', () => {
    for (const random of [lowest, highest]) {
      const [particle] = addBurst(
        createEffects(),
        { x: 0, y: 0, color: '#fff', count: 1 },
        random,
      ).particles;
      const speed = Math.hypot(particle!.vx, particle!.vy + 60);
      expect(speed).toBeGreaterThanOrEqual(60 - 0.001);
      expect(speed).toBeLessThanOrEqual(260 + 0.001);
      expect(particle!.lifeSeconds).toBeGreaterThanOrEqual(0.3);
      expect(particle!.lifeSeconds).toBeLessThanOrEqual(0.7);
      expect(particle!.size).toBeGreaterThanOrEqual(2);
      expect(particle!.size).toBeLessThanOrEqual(4);
    }
  });

  it('never keeps more particles than the cap, dropping the oldest', () => {
    let effects = createEffects();
    for (let burst = 0; burst < 100; burst += 1) {
      effects = addBurst(effects, { x: burst, y: 0, color: '#fff', count: 30 }, middle);
    }
    expect(effects.particles).toHaveLength(MAX_PARTICLES);
    expect(effects.particles[effects.particles.length - 1]!.x).toBe(99);
  });

  it.each([0, -3, Number.NaN])('adds nothing for the count %s', (count) => {
    expect(
      addBurst(createEffects(), { x: 0, y: 0, color: '#fff', count }, middle).particles,
    ).toEqual([]);
  });

  it('does not change the effects it was given', () => {
    const effects = createEffects();
    addBurst(effects, { x: 0, y: 0, color: '#fff', count: 3 }, middle);
    expect(effects.particles).toEqual([]);
  });
});

describe('addFloatingText and addShake', () => {
  it('adds a text that is fully alive', () => {
    const effects = addFloatingText(createEffects(), { text: '+10', x: 5, y: 9, color: '#fff' });
    expect(effects.texts).toHaveLength(1);
    expect(effects.texts[0]).toMatchObject({ text: '+10', x: 5, y: 9, color: '#fff' });
    expect(effects.texts[0]!.lifeSeconds).toBeGreaterThan(0);
  });

  it('starts a shake and refreshes it instead of stacking', () => {
    const shaken = addShake(createEffects());
    expect(shaken.shakeSeconds).toBe(SHAKE_SECONDS);
    expect(addShake(advanceEffects(shaken, 0.2)).shakeSeconds).toBe(SHAKE_SECONDS);
  });
});

describe('advanceEffects', () => {
  it('moves particles, pulls them down and retires them when their time is up', () => {
    const effects = addBurst(createEffects(), { x: 0, y: 0, color: '#fff', count: 1 }, lowest);
    const before = effects.particles[0]!;
    const after = advanceEffects(effects, 0.1).particles[0]!;
    expect(after.x).toBeCloseTo(before.x + before.vx * 0.1);
    expect(after.vy).toBeGreaterThan(before.vy);
    expect(advanceEffects(effects, 1).particles).toEqual([]);
  });

  it('floats the texts up and retires them', () => {
    const effects = addFloatingText(createEffects(), { text: 'x', x: 0, y: 100, color: '#fff' });
    expect(advanceEffects(effects, 0.5).texts[0]!.y).toBeLessThan(100);
    expect(advanceEffects(effects, 2).texts).toEqual([]);
  });

  it('counts the shake down and stops at zero', () => {
    const shaken = addShake(createEffects());
    expect(advanceEffects(shaken, 0.1).shakeSeconds).toBeCloseTo(SHAKE_SECONDS - 0.1);
    expect(advanceEffects(shaken, 5).shakeSeconds).toBe(0);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('ignores the step %s', (deltaSeconds) => {
    const effects = addShake(
      addFloatingText(addBurst(createEffects(), { x: 0, y: 0, color: '#fff', count: 2 }, middle), {
        text: 'x',
        x: 0,
        y: 0,
        color: '#fff',
      }),
    );
    expect(advanceEffects(effects, deltaSeconds)).toEqual(effects);
  });
});
