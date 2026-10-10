import { describe, expect, it, vi } from 'vitest';
import { drawSky } from './sky-canvas';
import type { SkyContext } from './sky-canvas';
import { STAGE_CENTER_X, STAGE_CENTER_Y } from './star-marks';

const transforms: number[][] = [];

function createContext(): SkyContext {
  transforms.length = 0;
  return {
    clearRect: vi.fn(),
    setTransform: vi.fn((...values: number[]) => {
      transforms.push(values);
    }) as unknown as SkyContext['setTransform'],
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    globalAlpha: 1,
    lineWidth: 1,
    lineCap: 'butt',
    strokeStyle: '',
    fillStyle: '',
  };
}

const view = { viewportWidth: 800, viewportHeight: 600, pixelRatio: 2, stageScale: 0.5 };

describe('drawSky', () => {
  it('maps the stage center to the viewport center, whatever the scale and pixel ratio', () => {
    const context = createContext();
    drawSky(context, [], [], view);
    const [scaleX = 0, , , scaleY = 0, offsetX = 0, offsetY = 0] = transforms.at(-1) ?? [];
    expect(STAGE_CENTER_X * scaleX + offsetX).toBeCloseTo(
      (view.viewportWidth * view.pixelRatio) / 2,
    );
    expect(STAGE_CENTER_Y * scaleY + offsetY).toBeCloseTo(
      (view.viewportHeight * view.pixelRatio) / 2,
    );
  });

  it('leaves the context balanced and the alpha restored when there is dust', () => {
    const context = createContext();
    const speck = { fromX: 0, fromY: 0, toX: 1, toY: 1, width: 1, color: '#fff', opacity: 0.2 };
    drawSky(context, [], [speck], view);
    expect(context.save).toHaveBeenCalledTimes(1);
    expect(context.restore).toHaveBeenCalledTimes(1);
    expect(context.globalAlpha).toBe(1);
  });

  it('does not touch the context stack when there is no dust', () => {
    const context = createContext();
    drawSky(context, [], [], view);
    expect(context.save).not.toHaveBeenCalled();
  });
});
