import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { AdditiveBlending, BackSide } from 'three';
import type { ShaderMaterial } from 'three';
import { sceneTokens } from '@/design-system/tokens/scene-tokens';
import { clampFrameDelta } from '../lib/rotation';
import {
  createSunCoronaUniforms,
  sunCoronaFragmentShader,
  sunCoronaVertexShader,
} from '../shaders/sun-corona';

const CORONA_RADIUS_RATIO = 1.38;
const CORONA_INTENSITY = 1.5;
const SPHERE_SEGMENTS = 64;

type SunCoronaProps = {
  /** Radius of the body the corona surrounds. */
  radius: number;
  /** False freezes the shimmer (reduced motion). */
  isAnimated: boolean;
};

const ignoreRaycast = () => undefined;

export function SunCorona({ radius, isAnimated }: SunCoronaProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const [initialUniforms] = useState(() =>
    createSunCoronaUniforms(sceneTokens.sunGlowColor, CORONA_INTENSITY),
  );

  useFrame((_state, deltaSeconds) => {
    const material = materialRef.current;
    if (!material || !isAnimated) return;
    material.uniforms.uTime!.value += clampFrameDelta(deltaSeconds);
  });

  return (
    <mesh raycast={ignoreRaycast}>
      <sphereGeometry args={[radius * CORONA_RADIUS_RATIO, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={initialUniforms}
        vertexShader={sunCoronaVertexShader}
        fragmentShader={sunCoronaFragmentShader}
        side={BackSide}
        blending={AdditiveBlending}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
