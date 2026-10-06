import type { ReactNode } from 'react';
import { ARC_HEIGHT, ARC_WIDTH, DELIVERY_HEIGHT } from './arc-geometry';
import { getStageScale } from './stage-scale';
import { useElementWidth } from './use-element-width';

type JourneyStageProps = {
  isDelivered: boolean;
  children: ReactNode;
};

export function JourneyStage({ isDelivered, children }: JourneyStageProps) {
  const [stageRef, stageWidth] = useElementWidth<HTMLDivElement>();
  const scale = getStageScale(stageWidth);
  const stageHeight = (isDelivered ? DELIVERY_HEIGHT : ARC_HEIGHT) * scale;

  return (
    <div
      ref={stageRef}
      className="relative shrink-0 overflow-hidden border-b border-line-faint transition-[height] duration-slow ease-orbit-ring"
      style={{ height: stageHeight }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: ARC_WIDTH, height: DELIVERY_HEIGHT, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
