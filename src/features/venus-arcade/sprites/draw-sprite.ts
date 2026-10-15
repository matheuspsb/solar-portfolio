import { SPRITES } from './bitmaps';
import type { SpriteName } from './bitmaps';

export type SpriteContext = Pick<CanvasRenderingContext2D, 'fillRect'> & {
  fillStyle: string | CanvasGradient | CanvasPattern;
};

export type SpriteStyle = {
  color: string;
  detailColor: string;
  scale: number;
  frame: number;
};

const DETAIL_PIXEL = 'o';
const EMPTY_PIXEL = '.';

export function getSpriteSize(name: SpriteName, scale: number): { width: number; height: number } {
  const [firstFrame] = SPRITES[name];
  return {
    width: (firstFrame?.[0]?.length ?? 0) * scale,
    height: (firstFrame?.length ?? 0) * scale,
  };
}

function pickFrame(name: SpriteName, frame: number): readonly string[] {
  const frames = SPRITES[name];
  const index = Number.isFinite(frame) && frame >= 0 ? Math.floor(frame) % frames.length : 0;
  return frames[index] ?? frames[0] ?? [];
}

export function drawSprite(context: SpriteContext, name: SpriteName, style: SpriteStyle): void {
  const rows = pickFrame(name, style.frame);
  rows.forEach((row, rowIndex) => {
    for (let column = 0; column < row.length; column += 1) {
      const pixel = row[column];
      if (pixel === EMPTY_PIXEL) continue;
      context.fillStyle = pixel === DETAIL_PIXEL ? style.detailColor : style.color;
      context.fillRect(column * style.scale, rowIndex * style.scale, style.scale, style.scale);
    }
  });
}
