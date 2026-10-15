import { useEffect, useRef } from 'react';
import { joinClassNames } from '@/lib/join-class-names';
import type { SpriteName } from '../sprites/bitmaps';
import { drawSprite, getSpriteSize } from '../sprites/draw-sprite';

type PixelSpriteProps = {
  name: SpriteName;
  color: string;
  detailColor: string;
  scale: number;
  frame?: number;
  className?: string;
};

export function PixelSprite({
  name,
  color,
  detailColor,
  scale,
  frame = 0,
  className,
}: PixelSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = getSpriteSize(name, scale);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, width, height);
    drawSprite(context, name, { color, detailColor, scale, frame });
  }, [name, color, detailColor, scale, frame, width, height]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      width={width}
      height={height}
      className={joinClassNames('[image-rendering:pixelated]', className)}
    />
  );
}
