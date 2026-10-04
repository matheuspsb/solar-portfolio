import { Color } from 'three';
import type { IUniform } from 'three';

export const sunCoronaVertexShader = /* glsl */ `
  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

/**
 * Drawn on the inside faces of a sphere slightly larger than the Sun: the visible part is a ring
 * that is brightest next to the Sun's limb and fades to nothing at the outer silhouette. Rays
 * shimmer around the ring over time.
 */
export const sunCoronaFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uIntensity;

  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  void main() {
    vec3 normal = normalize(vViewNormal);
    float facing = abs(dot(normal, normalize(vViewDirection)));
    float falloff = pow(facing, 2.2);

    float angle = atan(normal.y, normal.x);
    float rays = 0.82 + 0.18 * sin(angle * 7.0 + uTime * 0.9) * sin(angle * 3.0 - uTime * 0.5);

    float alpha = falloff * rays * uIntensity;
    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`;

type SunCoronaUniforms = {
  uColor: IUniform<Color>;
  uTime: IUniform<number>;
  uIntensity: IUniform<number>;
};

export function createSunCoronaUniforms(color: string, intensity: number): SunCoronaUniforms {
  return {
    uColor: { value: new Color(color) },
    uTime: { value: 0 },
    uIntensity: { value: intensity },
  };
}
