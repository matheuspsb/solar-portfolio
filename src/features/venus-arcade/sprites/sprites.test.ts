import { describe, expect, it, vi } from 'vitest';
import { SPRITES } from './bitmaps';
import type { SpriteName } from './bitmaps';
import { drawSprite, getSpriteSize } from './draw-sprite';
import type { SpriteContext } from './draw-sprite';

const names = Object.keys(SPRITES) as SpriteName[];

function createContext(): SpriteContext & { fills: Array<{ color: string; args: number[] }> } {
  const fills: Array<{ color: string; args: number[] }> = [];
  const context = {
    fillStyle: '' as string,
    fills,
    fillRect: vi.fn((...args: number[]) => {
      fills.push({ color: context.fillStyle, args });
    }),
  };
  return context as unknown as SpriteContext & { fills: typeof fills };
}

describe('SPRITES', () => {
  it.each(names)('has the same width on every row of every frame of %s', (name) => {
    for (const frame of SPRITES[name]) {
      const width = frame[0]!.length;
      for (const row of frame) expect(row).toHaveLength(width);
    }
  });

  it.each(names)('uses only the known pixels in %s', (name) => {
    for (const frame of SPRITES[name]) {
      for (const row of frame) expect(row).toMatch(/^[.Xo]+$/);
    }
  });

  it.each(names)('keeps the frames of %s the same size so the animation does not jump', (name) => {
    const [first, ...others] = SPRITES[name];
    for (const frame of others) {
      expect(frame).toHaveLength(first!.length);
      expect(frame[0]).toHaveLength(first![0]!.length);
    }
  });
});

describe('getSpriteSize', () => {
  it('multiplies the bitmap size by the scale', () => {
    expect(getSpriteSize('patch', 3)).toEqual({ width: 15, height: 15 });
    expect(getSpriteSize('crawler', 4)).toEqual({ width: 32, height: 28 });
  });
});

describe('drawSprite', () => {
  it('paints one square per filled pixel, with the detail pixels in the detail color', () => {
    const context = createContext();
    drawSprite(context, 'patch', { color: '#ffffff', detailColor: '#000000', scale: 2, frame: 0 });
    const filledPixels = SPRITES.patch[0]!.join('').replaceAll('.', '').length;
    expect(context.fills).toHaveLength(filledPixels);
    expect(context.fills.every((fill) => fill.args[2] === 2 && fill.args[3] === 2)).toBe(true);
    expect(context.fills.every((fill) => fill.color === '#ffffff')).toBe(true);
  });

  it('uses the detail color on the eyes of a crawler', () => {
    const context = createContext();
    drawSprite(context, 'crawler', {
      color: '#ffb347',
      detailColor: '#1a0d06',
      scale: 1,
      frame: 0,
    });
    expect(context.fills.filter((fill) => fill.color === '#1a0d06')).toHaveLength(2);
  });

  it('puts each square at its own cell', () => {
    const context = createContext();
    drawSprite(context, 'patch', { color: '#fff', detailColor: '#000', scale: 3, frame: 0 });
    expect(context.fills[0]!.args.slice(0, 2)).toEqual([6, 0]);
  });

  it('wraps the frame number around the frames of the sprite', () => {
    const wrapped = createContext();
    const direct = createContext();
    drawSprite(wrapped, 'crawler', { color: '#fff', detailColor: '#000', scale: 1, frame: 3 });
    drawSprite(direct, 'crawler', { color: '#fff', detailColor: '#000', scale: 1, frame: 1 });
    expect(wrapped.fills).toEqual(direct.fills);
  });

  it.each([-1, Number.NaN])('falls back to the first frame for the frame %s', (frame) => {
    const odd = createContext();
    const first = createContext();
    drawSprite(odd, 'crawler', { color: '#fff', detailColor: '#000', scale: 1, frame });
    drawSprite(first, 'crawler', { color: '#fff', detailColor: '#000', scale: 1, frame: 0 });
    expect(odd.fills).toEqual(first.fills);
  });
});
