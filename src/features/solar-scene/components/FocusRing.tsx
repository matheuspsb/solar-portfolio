import { Billboard } from '@react-three/drei';
import { DoubleSide } from 'three';
import { sceneTokens } from '@/design-system/tokens/scene-tokens';

const RING_GAP_RATIO = 1.12;
const RING_THICKNESS_RATIO = 0.035;
const RING_SEGMENTS = 128;

type FocusRingProps = {
  bodyRadius: number;
};

const ignoreRaycast = () => undefined;

export function FocusRing({ bodyRadius }: FocusRingProps) {
  const innerRadius = bodyRadius * RING_GAP_RATIO;
  const outerRadius = innerRadius + bodyRadius * RING_THICKNESS_RATIO;

  return (
    <Billboard>
      <mesh raycast={ignoreRaycast}>
        <ringGeometry args={[innerRadius, outerRadius, RING_SEGMENTS]} />
        <meshBasicMaterial
          color={sceneTokens.focusRingColor}
          side={DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </Billboard>
  );
}
