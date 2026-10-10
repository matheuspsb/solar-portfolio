import { useMemo } from 'react';
import { createSeededRandom, generateStarPositions } from '../lib/star-field';
import { sceneTokens } from '@/styles/scene-tokens';

const STAR_FIELD_RADIUS = 90;
const STAR_FIELD_SEED = 20240611;
const STAR_SIZE = 0.35;

type StarFieldProps = {
  starCount: number;
};

const ignoreRaycast = () => undefined;

export function StarField({ starCount }: StarFieldProps) {
  const positions = useMemo(
    () =>
      generateStarPositions({
        count: starCount,
        radius: STAR_FIELD_RADIUS,
        random: createSeededRandom(STAR_FIELD_SEED),
      }),
    [starCount],
  );

  return (
    <points raycast={ignoreRaycast}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={sceneTokens.starColor}
        size={STAR_SIZE}
        sizeAttenuation
        depthWrite={false}
        transparent
        opacity={0.85}
      />
    </points>
  );
}
