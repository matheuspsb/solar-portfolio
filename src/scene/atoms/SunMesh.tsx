import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh, Texture } from 'three';
import { sceneTokens } from '@/design-system/tokens/scene-tokens';
import { advanceRotation } from '@/lib/rotation';

const SPHERE_SEGMENTS = 96;

type SunMeshProps = {
  radius: number;
  texture: Texture | null;
  /** `null` disables automatic rotation (reduced motion). */
  rotationPeriodSeconds: number | null;
};

export function SunMesh({ radius, texture, rotationPeriodSeconds }: SunMeshProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_state, deltaSeconds) => {
    const mesh = meshRef.current;
    if (!mesh || rotationPeriodSeconds === null) return;
    mesh.rotation.y = advanceRotation({
      angle: mesh.rotation.y,
      deltaSeconds,
      periodSeconds: rotationPeriodSeconds,
    });
  });

  const surfaceColor = texture ? sceneTokens.sunTextureTint : sceneTokens.sunCoreColor;

  return (
    <mesh ref={meshRef}>
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
