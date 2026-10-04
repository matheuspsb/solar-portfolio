import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import type { Mesh, ShaderMaterial, Texture } from 'three';
import { sceneTokens } from '@/design-system/tokens/scene-tokens';
import type { Highlight } from '@/lib/interaction-state';
import { useBodyMotion } from '../hooks/use-body-motion';
import { useBodyPointerHandlers } from '../hooks/use-body-pointer-handlers';
import { clampFrameDelta } from '../lib/rotation';
import {
  createSunSurfaceUniforms,
  sunSurfaceFragmentShader,
  sunSurfaceVertexShader,
} from '../shaders/sun-surface';

const SPHERE_SEGMENTS = 96;

type SunMeshProps = {
  /** Lets the camera find this body by name. */
  name: string;
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
  // Created once: R3F would otherwise swap the uniforms object (and reset time) on every render.
  const [initialUniforms] = useState(() =>
    createSunSurfaceUniforms(sceneTokens.sunTextureTint, sceneTokens.sunCoreColor),
  );
  useBodyMotion({ bodyRef: meshRef, rotationPeriodSeconds, highlight, highlightEasingRate });
  const { handlePointerOver, handleClick } = useBodyPointerHandlers({ onPointerOver, onSelect });

  useFrame((_state, deltaSeconds) => {
    const material = materialRef.current;
    if (!material) return;
    if (isSurfaceAnimated) material.uniforms.uTime!.value += clampFrameDelta(deltaSeconds);
    material.uniforms.uMap!.value = texture;
    material.uniforms.uHasMap!.value = texture ? 1 : 0;
  });

  return (
    <mesh
      ref={meshRef}
      name={name}
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
