import type { ReactNode } from 'react';
import { STAGE_CENTER_X, STAGE_CENTER_Y, STAGE_HEIGHT, STAGE_WIDTH } from '../lib/loader-frame';

type StageLayerProps = {
  stageScale: number;
  children: ReactNode;
};

export function StageLayer({ stageScale, children }: StageLayerProps) {
  return (
    <div
      className="pointer-events-none absolute top-1/2 left-1/2"
      style={{
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        marginLeft: -STAGE_CENTER_X,
        marginTop: -STAGE_CENTER_Y,
        transformOrigin: `${STAGE_CENTER_X}px ${STAGE_CENTER_Y}px`,
        transform: `scale(${stageScale})`,
      }}
    >
      {children}
    </div>
  );
}
