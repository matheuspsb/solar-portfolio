import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import type { Object3D } from 'three';
import { getHighlightScale } from '@/lib/interaction-state';
import type { Highlight } from '@/lib/interaction-state';
import { dampValue } from '../lib/damp';
import { advanceRotation } from '../lib/rotation';

type BodyMotionOptions = {
  bodyRef: RefObject<Object3D | null>;
  rotationPeriodSeconds: number | null;
  highlight: Highlight;
  highlightEasingRate: number;
};

export function useBodyMotion({
  bodyRef,
  rotationPeriodSeconds,
  highlight,
  highlightEasingRate,
}: BodyMotionOptions): void {
  const targetScale = getHighlightScale(highlight);

  useFrame((_state, deltaSeconds) => {
    const body = bodyRef.current;
    if (!body) return;
    if (rotationPeriodSeconds !== null) {
      body.rotation.y = advanceRotation({
        angle: body.rotation.y,
        deltaSeconds,
        periodSeconds: rotationPeriodSeconds,
      });
    }
    body.scale.setScalar(
      dampValue({
        current: body.scale.x,
        target: targetScale,
        rate: highlightEasingRate,
        deltaSeconds,
      }),
    );
  });
}
