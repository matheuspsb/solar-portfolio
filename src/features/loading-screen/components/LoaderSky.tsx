import { useEffect, useRef } from 'react';
import type { DustMark } from '../lib/dust-marks';
import { drawSky } from '../lib/sky-canvas';
import type { SkyView } from '../lib/sky-canvas';
import type { StarMark } from '../lib/star-marks';

type LoaderSkyProps = {
  stars: readonly StarMark[];
  dust: readonly DustMark[];
  view: SkyView;
};

export function LoaderSky({ stars, dust, view }: LoaderSkyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context) drawSky(context, stars, dust, view);
  }, [stars, dust, view]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      width={Math.round(view.viewportWidth * view.pixelRatio)}
      height={Math.round(view.viewportHeight * view.pixelRatio)}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
