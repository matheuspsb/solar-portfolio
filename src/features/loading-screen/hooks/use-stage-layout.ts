import { useSyncExternalStore } from 'react';
import { useViewportSize } from '@/hooks/use-viewport-size';
import { getPixelRatio, getStageScale } from '../lib/stage-layout';

export type StageLayout = {
  viewportWidth: number;
  viewportHeight: number;
  stageScale: number;
  pixelRatio: number;
};

const SERVER_PIXEL_RATIO = 1;

function subscribe(onChange: () => void): () => void {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

const getSnapshot = (): number => getPixelRatio(window.devicePixelRatio);
const getServerSnapshot = (): number => SERVER_PIXEL_RATIO;

export function useStageLayout(): StageLayout {
  const viewport = useViewportSize();
  const pixelRatio = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    stageScale: getStageScale(viewport.width, viewport.height),
    pixelRatio,
  };
}
