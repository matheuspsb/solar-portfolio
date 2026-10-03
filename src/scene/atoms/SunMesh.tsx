import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { useRef, useState } from 'react';
import type { Mesh, ShaderMaterial, Texture } from 'three';
import { sceneTokens } from '@/design-system/tokens/scene-tokens';
import { dampValue } from '@/lib/damp';
import { getHighlightScale, isClickGesture } from '@/lib/interaction-state';
import type { Highlight } from '@/lib/interaction-state';
import { advanceRotation, clampFrameDelta } from '@/lib/rotation';
import {
  createSunSurfaceUniforms,
  sunSurfaceFragmentShader,
  sunSurfaceVertexShader,
} from '../shaders/sun-surface';

const SPHERE_SEGMENTS = 96;

type SunMeshProps = {
  radius: number;
  texture: Texture | null;
  /** `null` disables automatic rotation (reduced motion). */
  rotationPeriodSeconds: number | null;
  /** False freezes the drifting plasma (reduced motion). */
  isSurfaceAnimated: boolean;
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
  isSurfaceAnimated,
  highlight,
  highlightEasingRate,
  onPointerOver,
  onPointerOut,
  onSelect,
}: SunMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  // Created once: R3F would otherwise swap the uniforms object (and reset time) on every render.
  const [initialUniforms] = useState(() => createSunSurfaceUniforms(sceneTokens.sunTextureTint));
  const targetScale = getHighlightScale(highlight);

  useFrame((_state, deltaSeconds) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;
    if (rotationPeriodSeconds !== null) {
      mesh.rotation.y = advanceRotation({
        angle: mesh.rotation.y,
        deltaSeconds,
        periodSeconds: rotationPeriodSeconds,
      });
    }
    if (isSurfaceAnimated) material.uniforms.uTime!.value += clampFrameDelta(deltaSeconds);
    material.uniforms.uMap!.value = texture;
    material.uniforms.uHasMap!.value = texture ? 1 : 0;
    mesh.scale.setScalar(
      dampValue({
        current: mesh.scale.x,
        target: targetScale,
        rate: highlightEasingRate,
        deltaSeconds,
      }),
    );
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

  return (
    <mesh
      ref={meshRef}
      onPointerOver={handlePointerOver}
      onPointerOut={onPointerOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[radius, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={initialUniforms}
        vertexShader={sunSurfaceVertexShader}
        fragmentShader={sunSurfaceFragmentShader}
        toneMapped={false}
      />
    </mesh>
  );
}
