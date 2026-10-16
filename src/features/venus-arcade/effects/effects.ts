import {
  BURST_LIFE_RANGE_SECONDS,
  BURST_LIFT,
  BURST_SIZE_RANGE,
  BURST_SPEED_RANGE,
  FLOATING_TEXT_RISE,
  FLOATING_TEXT_SECONDS,
  MAX_PARTICLES,
  PARTICLE_GRAVITY,
  SHAKE_SECONDS,
} from '../engine/constants';
import { randomBetween } from '../engine/random';
import type { Random } from '../engine/random';
import { isValidStep } from '@/lib/time-step';

export { MAX_PARTICLES, SHAKE_SECONDS };

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifeSeconds: number;
  color: string;
  size: number;
};

export type FloatingText = {
  text: string;
  x: number;
  y: number;
  color: string;
  lifeSeconds: number;
};

export type Effects = {
  particles: Particle[];
  texts: FloatingText[];
  shakeSeconds: number;
};

type BurstInput = { x: number; y: number; color: string; count: number };

type TextInput = { text: string; x: number; y: number; color: string };

const FULL_TURN = Math.PI * 2;

export function createEffects(): Effects {
  return { particles: [], texts: [], shakeSeconds: 0 };
}

function createParticle({ x, y, color }: BurstInput, random: Random): Particle {
  const angle = randomBetween(random, 0, FULL_TURN);
  const speed = randomBetween(random, BURST_SPEED_RANGE[0], BURST_SPEED_RANGE[1]);
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - BURST_LIFT,
    lifeSeconds: randomBetween(random, BURST_LIFE_RANGE_SECONDS[0], BURST_LIFE_RANGE_SECONDS[1]),
    color,
    size: randomBetween(random, BURST_SIZE_RANGE[0], BURST_SIZE_RANGE[1]),
  };
}

export function addBurst(effects: Effects, burst: BurstInput, random: Random): Effects {
  if (!(burst.count > 0)) return effects;

  const created = Array.from({ length: Math.floor(burst.count) }, () =>
    createParticle(burst, random),
  );
  return { ...effects, particles: [...effects.particles, ...created].slice(-MAX_PARTICLES) };
}

export function addFloatingText(effects: Effects, input: TextInput): Effects {
  return {
    ...effects,
    texts: [...effects.texts, { ...input, lifeSeconds: FLOATING_TEXT_SECONDS }],
  };
}

export function addShake(effects: Effects): Effects {
  return { ...effects, shakeSeconds: SHAKE_SECONDS };
}

export function advanceEffects(effects: Effects, deltaSeconds: number): Effects {
  if (!isValidStep(deltaSeconds)) return effects;

  const particles = effects.particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * deltaSeconds,
      y: particle.y + particle.vy * deltaSeconds,
      vy: particle.vy + PARTICLE_GRAVITY * deltaSeconds,
      lifeSeconds: particle.lifeSeconds - deltaSeconds,
    }))
    .filter((particle) => particle.lifeSeconds > 0);
  const texts = effects.texts
    .map((text) => ({
      ...text,
      y: text.y - FLOATING_TEXT_RISE * deltaSeconds,
      lifeSeconds: text.lifeSeconds - deltaSeconds,
    }))
    .filter((text) => text.lifeSeconds > 0);
  return { particles, texts, shakeSeconds: Math.max(0, effects.shakeSeconds - deltaSeconds) };
}
