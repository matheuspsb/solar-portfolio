import { DoubleSide } from 'three';
import { sceneTokens } from '@/styles/scene-tokens';

const PATH_THICKNESS = 0.03;
const PATH_OPACITY = 0.16;
const PATH_SEGMENTS = 192;

type OrbitPathProps = {
  radius: number;
};

const ignoreRaycast = () => undefined;

export function OrbitPath({ radius }: OrbitPathProps) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={ignoreRaycast}>
      <ringGeometry
        args={[radius - PATH_THICKNESS / 2, radius + PATH_THICKNESS / 2, PATH_SEGMENTS]}
      />
      <meshBasicMaterial
        color={sceneTokens.orbitPathColor}
        transparent
        opacity={PATH_OPACITY}
        side={DoubleSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
