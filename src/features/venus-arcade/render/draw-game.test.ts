import { describe, expect, it, vi } from 'vitest';
import { arcadeTokens } from '@/styles/arcade-tokens';
import {
  createBug,
  createCorruptedData,
  createPatch,
  createShard,
  createTear,
} from '../engine/entities';
import type { Entity } from '../engine/entities';
import { createEffects, addBurst, addFloatingText, addShake } from '../effects/effects';
import { createSession } from '../session/session';
import type { GameSession } from '../session/session';
import { drawGame } from './draw-game';
import type { GameContext } from './draw-game';

const field = { width: 1000, height: 600 };
const middle = () => 0.5;
const view = { width: 1000, height: 600, pixelScale: 4, fontFamily: 'Pixel' };

type Recorded = {
  fillColors: string[];
  texts: string[];
  translations: number[][];
  strokes: number;
};

function createContext(): GameContext & { recorded: Recorded } {
  const recorded: Recorded = { fillColors: [], texts: [], translations: [], strokes: 0 };
  const context = {
    fillStyle: '' as string,
    strokeStyle: '' as string,
    lineWidth: 1,
    globalAlpha: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    shadowColor: '',
    shadowBlur: 0,
    recorded,
    fillRect: vi.fn(() => {
      recorded.fillColors.push(context.fillStyle);
    }),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(() => {
      recorded.strokes += 1;
    }),
    fillText: vi.fn((text: string) => {
      recorded.texts.push(text);
    }),
    setLineDash: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn((shiftX: number, shiftY: number) => {
      recorded.translations.push([shiftX, shiftY]);
    }),
    setTransform: vi.fn(),
  };
  return context as unknown as GameContext & { recorded: Recorded };
}

function sessionWith(overrides: Partial<GameSession> = {}): GameSession {
  return {
    ...createSession({ field, mode: 'standard', previousBest: 0 }),
    phase: 'running',
    ...overrides,
  };
}

function draw(session: GameSession, effects = createEffects(), scrollSeconds = 0) {
  const context = createContext();
  drawGame(context, { session, effects, scrollSeconds, random: middle }, view);
  return context.recorded;
}

function bugAt(kind: 'crawler' | 'beetle', overrides: Partial<Entity> = {}): Entity {
  return {
    ...createBug({ kind, x: 300, speed: 0, radius: 16, amplitude: 0, frequency: 1, phase: 0 }),
    y: 200,
    ...overrides,
  } as Entity;
}

describe('drawGame background', () => {
  it('paints the screen color first and the dotted grid after it', () => {
    const recorded = draw(sessionWith());
    expect(recorded.fillColors[0]).toBe(arcadeTokens.screenColor);
    expect(recorded.fillColors).toContain(arcadeTokens.gridColor);
  });

  it('scrolls the grid with the time', () => {
    const still = createContext();
    const scrolled = createContext();
    drawGame(
      still,
      { session: sessionWith(), effects: createEffects(), scrollSeconds: 0, random: middle },
      view,
    );
    drawGame(
      scrolled,
      { session: sessionWith(), effects: createEffects(), scrollSeconds: 0.5, random: middle },
      view,
    );
    expect(vi.mocked(still.fillRect).mock.calls[1]).not.toEqual(
      vi.mocked(scrolled.fillRect).mock.calls[1],
    );
  });
});

describe('drawGame entities', () => {
  it('draws crawlers and beetles in their own colors, and white while they flash', () => {
    const crawler = draw(sessionWith({ entities: [bugAt('crawler')] }));
    expect(crawler.fillColors).toContain(arcadeTokens.crawlerColor);
    const beetle = draw(sessionWith({ entities: [bugAt('beetle')] }));
    expect(beetle.fillColors).toContain(arcadeTokens.beetleColor);
    const flashing = draw(sessionWith({ entities: [bugAt('crawler', { flashSeconds: 0.05 })] }));
    expect(flashing.fillColors).not.toContain(arcadeTokens.crawlerColor);
    expect(flashing.fillColors).toContain(arcadeTokens.flashColor);
  });

  it('draws corrupted data with its glyph and a crack once it is hurt', () => {
    const data = {
      ...createCorruptedData({ x: 300, speed: 10, radius: 18 }),
      y: 200,
      glyph: '404',
    };
    const whole = draw(sessionWith({ entities: [data] }));
    expect(whole.texts).toContain('404');
    const hurt = draw(sessionWith({ entities: [{ ...data, hitPoints: 1 }] }));
    expect(hurt.strokes).toBeGreaterThan(whole.strokes);
  });

  it('draws shards in red with a blue ghost, and patches', () => {
    const shard = { ...createShard({ x: 300, speed: 200, radius: 14 }), y: 200 };
    const recorded = draw(sessionWith({ entities: [shard] }));
    expect(recorded.fillColors).toContain(arcadeTokens.glitchColor);
    expect(recorded.fillColors).toContain(arcadeTokens.glitchGhostColor);
    const patch = draw(sessionWith({ entities: [createPatch({ x: 300, y: 200, radius: 12 })] }));
    expect(patch.fillColors).toContain(arcadeTokens.droneColor);
  });

  it('warns about a tear with text, then draws the glitch bands once it is active', () => {
    const warning = { ...createTear({ y: 300, height: 28 }), age: 0.2 };
    const warned = draw(sessionWith({ entities: [warning] }));
    expect(warned.texts.length).toBeGreaterThan(0);
    const active = { ...warning, age: 1.2 };
    const glitching = draw(sessionWith({ entities: [active] }));
    expect(glitching.texts).toEqual([]);
    expect(glitching.fillColors).toContain(arcadeTokens.glitchColor);
  });
});

describe('drawGame drone and shots', () => {
  it('draws the drone in its color, golden in hotfix mode', () => {
    expect(draw(sessionWith()).fillColors).toContain(arcadeTokens.droneColor);
    expect(draw(sessionWith({ mode: 'hotfix' })).fillColors).toContain(
      arcadeTokens.hotfixDroneColor,
    );
  });

  it('blinks the drone while it is invulnerable', () => {
    const base = sessionWith();
    const visible = draw({ ...base, stats: { ...base.stats, invulnerableSeconds: 1.4 } });
    const hidden = draw({ ...base, stats: { ...base.stats, invulnerableSeconds: 1.4 - 1 / 14 } });
    const shownCounts = [visible, hidden].map(
      (recorded) => recorded.fillColors.filter((color) => color === arcadeTokens.droneColor).length,
    );
    expect(Math.min(...shownCounts)).toBe(0);
    expect(Math.max(...shownCounts)).toBeGreaterThan(0);
  });

  it('does not draw a drone that has no integrity left', () => {
    const base = sessionWith();
    const recorded = draw({ ...base, stats: { ...base.stats, integrity: 0 } });
    expect(recorded.fillColors).not.toContain(arcadeTokens.droneColor);
  });

  it('draws the shots', () => {
    const recorded = draw(sessionWith({ shots: [{ x: 500, y: 300, vx: 0, vy: -780 }] }));
    expect(recorded.fillColors).toContain(arcadeTokens.shotColor);
  });
});

describe('drawGame effects', () => {
  it('draws the particles and the floating texts', () => {
    let effects = addBurst(createEffects(), { x: 50, y: 50, color: '#123456', count: 3 }, middle);
    effects = addFloatingText(effects, { text: '+10', x: 100, y: 100, color: '#fff' });
    const recorded = draw(sessionWith(), effects);
    expect(recorded.fillColors.filter((color) => color === '#123456')).toHaveLength(3);
    expect(recorded.texts).toContain('+10');
  });

  it('shakes the picture only while the shake lasts', () => {
    expect(draw(sessionWith()).translations).toEqual([]);
    expect(draw(sessionWith(), addShake(createEffects())).translations).toHaveLength(1);
  });
});
