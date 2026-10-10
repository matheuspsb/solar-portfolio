import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import type { Mesh, ShaderMaterial, Texture } from 'three';
import { sceneTokens } from '@/styles/scene-tokens';
import { getHighlightGlow } from '@/domain/interaction-state';
import type { Highlight } from '@/domain/interaction-state';
import { useBodyMotion } from '../../hooks/use-body-motion';
import { useBodyPointerHandlers } from '../../hooks/use-body-pointer-handlers';
import { clampFrameDelta } from '../../lib/rotation';
import {
  createSunSurfaceUniforms,
  sunSurfaceFragmentShader,
  sunSurfaceVertexShader,
} from '../../shaders/sun-surface';

const SPHERE_SEGMENTS = 96;

type SunMeshProps = {
  name: string;
  radius: number;
  texture: Texture | null;
  rotationPeriodSeconds: number | null;
  isSurfaceAnimated: boolean;
  highlight: Highlight;
  highlightEasingRate: number;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onSelect: () => void;
};

export function SunMesh({
  name,
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
  const [initialUniforms] = useState(() =>
    createSunSurfaceUniforms(sceneTokens.sunTextureTint, sceneTokens.sunCoreColor),
  );
  useBodyMotion({ bodyRef: meshRef, rotationPeriodSeconds, highlight, highlightEasingRate });
  const { handlePointerOver, handlePointerOut, handleClick } = useBodyPointerHandlers({
    onPointerOver,
    onPointerOut,
    onSelect,
    isArmed: highlight !== 'none',
  });

  useFrame((_state, deltaSeconds) => {
    const material = materialRef.current;
    if (!material) return;
    if (isSurfaceAnimated) material.uniforms.uTime!.value += clampFrameDelta(deltaSeconds);
    material.uniforms.uMap!.value = texture;
    material.uniforms.uHasMap!.value = texture ? 1 : 0;
    material.uniforms.uGlow!.value = getHighlightGlow(highlight);
  });

  return (
    <mesh
      ref={meshRef}
      name={name}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
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
