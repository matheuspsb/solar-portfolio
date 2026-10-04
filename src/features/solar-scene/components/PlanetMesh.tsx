import { useRef } from 'react';
import type { Mesh, Texture } from 'three';
import { sceneTokens } from '@/design-system/tokens/scene-tokens';
import type { Highlight } from '@/lib/interaction-state';
import { useBodyMotion } from '../hooks/use-body-motion';
import { useBodyPointerHandlers } from '../hooks/use-body-pointer-handlers';

const SPHERE_SEGMENTS = 64;
/** Planets are small; this keeps their click target comfortable for a fingertip. */
const MIN_HIT_RADIUS = 0.9;

type PlanetMeshProps = {
  radius: number;
  texture: Texture | null;
  /** `null` disables automatic rotation (reduced motion). */
  rotationPeriodSeconds: number | null;
  highlight: Highlight;
  /** `Infinity` applies highlight changes instantly (reduced motion). */
  highlightEasingRate: number;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onSelect: () => void;
};

/**
 * A lit, textured planet plus an invisible, larger click target. Lambert (diffuse only) is plenty
 * for a rough rocky planet and compiles a much cheaper shader than the standard PBR material.
 */
export function PlanetMesh({
  radius,
  texture,
  rotationPeriodSeconds,
  highlight,
  highlightEasingRate,
  onPointerOver,
  onPointerOut,
  onSelect,
}: PlanetMeshProps) {
  const meshRef = useRef<Mesh>(null);
  useBodyMotion({ bodyRef: meshRef, rotationPeriodSeconds, highlight, highlightEasingRate });
  const { handlePointerOver, handleClick } = useBodyPointerHandlers({ onPointerOver, onSelect });
  const hitRadius = Math.max(radius, MIN_HIT_RADIUS);
  // With a texture the material keeps its default white so the map shows unaltered.
  const fallbackColor = texture ? undefined : sceneTokens.planetFallbackColor;

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
        {/* New material when the texture appears: three only re-checks `map` on material.version. */}
        <meshLambertMaterial
          key={texture ? 'textured' : 'plain'}
          map={texture}
          color={fallbackColor}
        />
      </mesh>
      <mesh onPointerOver={handlePointerOver} onPointerOut={onPointerOut} onClick={handleClick}>
        <sphereGeometry args={[hitRadius, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
