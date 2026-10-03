import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh, Texture } from 'three';
import { sceneTokens } from '@/design-system/tokens/scene-tokens';
import { dampValue } from '@/lib/damp';
import { getHighlightScale, isClickGesture } from '@/lib/interaction-state';
import type { Highlight } from '@/lib/interaction-state';
import { advanceRotation } from '@/lib/rotation';

const SPHERE_SEGMENTS = 96;

type SunMeshProps = {
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

export function SunMesh({
  radius,
  texture,
  rotationPeriodSeconds,
  highlight,
  highlightEasingRate,
  onPointerOver,
  onPointerOut,
  onSelect,
}: SunMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const targetScale = getHighlightScale(highlight);

  useFrame((_state, deltaSeconds) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (rotationPeriodSeconds !== null) {
      mesh.rotation.y = advanceRotation({
        angle: mesh.rotation.y,
        deltaSeconds,
        periodSeconds: rotationPeriodSeconds,
      });
    }
    const nextScale = dampValue({
      current: mesh.scale.x,
      target: targetScale,
      rate: highlightEasingRate,
      deltaSeconds,
    });
    mesh.scale.setScalar(nextScale);
  });

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onPointerOver();
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!isClickGesture(event.delta)) return;
    event.stopPropagation();
    onSelect();
  };

  const surfaceColor = texture ? sceneTokens.sunTextureTint : sceneTokens.sunCoreColor;

  return (
    <mesh
      ref={meshRef}
      onPointerOver={handlePointerOver}
      onPointerOut={onPointerOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[radius, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
      {/* New material when the texture appears: three only re-checks `map` on material.version. */}
      <meshBasicMaterial
        key={texture ? 'textured' : 'plain'}
        map={texture}
        color={surfaceColor}
        toneMapped={false}
      />
    </mesh>
  );
}
