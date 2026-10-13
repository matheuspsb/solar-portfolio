import { useRef } from 'react';
import type { Mesh, Texture } from 'three';
import { sceneTokens } from '@/styles/scene-tokens';
import { getHighlightGlow } from '@/domain/interaction-state';
import { useBodyInteraction } from '../../hooks/use-body-interaction';
import { useBodyMotion } from '../../hooks/use-body-motion';
import { useBodyPointerHandlers } from '../../hooks/use-body-pointer-handlers';

const SPHERE_SEGMENTS = 64;
const MIN_HIT_RADIUS = 0.9;

type PlanetMeshProps = {
  id: string;
  radius: number;
  texture: Texture | null;
  rotationPeriodSeconds: number | null;
  isInteractive: boolean;
};

export function PlanetMesh({
  id,
  radius,
  texture,
  rotationPeriodSeconds,
  isInteractive,
}: PlanetMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const { highlight, highlightEasingRate, onPointerOver, onPointerOut, onSelect } =
    useBodyInteraction(id);
  useBodyMotion({ bodyRef: meshRef, rotationPeriodSeconds, highlight, highlightEasingRate });
  const { handlePointerOver, handlePointerOut, handleClick } = useBodyPointerHandlers({
    onPointerOver,
    onPointerOut,
    onSelect,
    isArmed: highlight !== 'none',
  });
  const hitRadius = Math.max(radius, MIN_HIT_RADIUS);
  const fallbackColor = texture ? undefined : sceneTokens.planetFallbackColor;

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
        <meshLambertMaterial
          key={texture ? 'textured' : 'plain'}
          map={texture}
          color={fallbackColor}
          emissive={texture ? sceneTokens.planetGlowColor : sceneTokens.planetFallbackColor}
          emissiveMap={texture}
          emissiveIntensity={getHighlightGlow(highlight)}
        />
      </mesh>
      {isInteractive && (
        <mesh
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <sphereGeometry args={[hitRadius, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
