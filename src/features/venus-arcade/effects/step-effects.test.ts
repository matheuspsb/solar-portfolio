import { describe, expect, it } from 'vitest';
import { arcadeTokens } from '@/styles/arcade-tokens';
import { createPatch } from '../engine/entities';
import { createRunStats } from '../engine/scoring';
import type { StepEvents } from '../session/advance-session';
import { createSession } from '../session/session';
import type { GameSession } from '../session/session';
import { createEffects } from './effects';
import { applyStepEffects } from './step-effects';

const field = { width: 1000, height: 600 };
const middle = () => 0.5;
const NO_EVENTS: StepEvents = {
  awards: [],
  collectedPatches: [],
  leakedBugs: 0,
  leakedXs: [],
  hasHurt: false,
  hasFired: false,
};

function sessionWith(stats: Partial<GameSession['stats']> = {}): GameSession {
  const session = createSession({ field, mode: 'standard', previousBest: 0 });
  return { ...session, phase: 'running', stats: { ...createRunStats(), ...stats } };
}

function apply(
  events: Partial<StepEvents>,
  before = sessionWith(),
  after = before,
  reducedMotion = false,
) {
  return applyStepEffects({
    effects: createEffects(),
    before,
    after,
    events: { ...NO_EVENTS, ...events },
    random: middle,
    reducedMotion,
  });
}

describe('applyStepEffects awards', () => {
  const award = { kind: 'crawler', x: 300, y: 200, radius: 16, points: 10, multiplier: 1 } as const;

  it('floats the points above the target and bursts into particles', () => {
    const effects = apply({ awards: [award] });
    expect(effects.texts).toHaveLength(1);
    expect(effects.texts[0]).toMatchObject({ x: 300, y: 200 - 16 });
    expect(effects.particles.length).toBeGreaterThan(0);
  });

  it('bursts bigger for a beetle than for a crawler', () => {
    const beetle = apply({ awards: [{ ...award, kind: 'beetle' }] });
    const crawler = apply({ awards: [award] });
    expect(beetle.particles.length).toBeGreaterThan(crawler.particles.length);
  });

  it('paints the burst with the color of what was destroyed', () => {
    const beetle = apply({ awards: [{ ...award, kind: 'beetle' }] });
    expect(beetle.particles.every((particle) => particle.color === arcadeTokens.beetleColor)).toBe(
      true,
    );
  });

  it('highlights the text when a multiplier is on', () => {
    const plain = apply({ awards: [award] }).texts[0]!.color;
    const boosted = apply({ awards: [{ ...award, multiplier: 3 }] }).texts[0]!.color;
    expect(boosted).not.toBe(plain);
  });
});

describe('applyStepEffects damage', () => {
  it('bursts red on the drone and shakes the screen', () => {
    const session = sessionWith();
    const effects = apply({ hasHurt: true }, session);
    expect(effects.shakeSeconds).toBeGreaterThan(0);
    expect(effects.particles.every((particle) => particle.color === arcadeTokens.glitchColor)).toBe(
      true,
    );
    expect(effects.particles[0]).toMatchObject({ x: session.drone.x, y: session.drone.y });
  });

  it('does not shake with reduced motion, but still shows the burst', () => {
    const effects = apply({ hasHurt: true }, sessionWith(), undefined, true);
    expect(effects.shakeSeconds).toBe(0);
    expect(effects.particles.length).toBeGreaterThan(0);
  });
});

describe('applyStepEffects leaks', () => {
  it('flags a leak once, in its lane, only while there was a combo to lose', () => {
    const withCombo = apply({ leakedBugs: 2, leakedXs: [120, 800] }, sessionWith({ combo: 4 }));
    expect(withCombo.texts).toHaveLength(1);
    expect(withCombo.texts[0]!.x).toBe(120);
    const withoutCombo = apply({ leakedBugs: 1, leakedXs: [120] }, sessionWith({ combo: 0 }));
    expect(withoutCombo.texts).toEqual([]);
  });
});

describe('applyStepEffects patches', () => {
  const patch = createPatch({ x: 500, y: 400, radius: 12 });

  it('says integrity came back when it did, and a bonus when it was already full', () => {
    const restored = apply(
      { collectedPatches: [patch] },
      sessionWith({ integrity: 2 }),
      sessionWith({ integrity: 3 }),
    );
    const bonus = apply(
      { collectedPatches: [patch] },
      sessionWith({ integrity: 3 }),
      sessionWith({ integrity: 3, score: 50 }),
    );
    expect(restored.texts).toHaveLength(1);
    expect(bonus.texts).toHaveLength(1);
    expect(restored.texts[0]!.text).not.toBe(bonus.texts[0]!.text);
    expect(restored.texts[0]).toMatchObject({ x: 500, y: 400 });
  });
});

describe('applyStepEffects with nothing happening', () => {
  it('leaves the effects as they were', () => {
    expect(apply({})).toEqual(createEffects());
  });
});
