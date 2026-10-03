import { Color, Texture } from 'three';
import type { IUniform } from 'three';

export const sunSurfaceVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  void main() {
    vUv = uv;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

/**
 * Two copies of the texture drift in different directions so granulation seems to boil, then the
 * limb is darkened a little like a real star. Without a texture it renders a solid tint.
 */
export const sunSurfaceFragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform vec3 uTint;
  uniform vec3 uFallbackColor;
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying vec3 vViewDirection;

  void main() {
    // The detail layer repeats an integer number of times so the wrap-around seam stays invisible.
    // Flow only along longitude (like the Sun's differential rotation): scaling or drifting the
    // latitude would fold the texture and smear a visible band across the disc.
    float wobble = 0.003 * sin(vUv.x * 40.0 + uTime * 0.35);
    vec2 slowUv = vec2(vUv.x + uTime * 0.004, vUv.y + wobble);
    vec2 detailUv = vec2(vUv.x * 2.0 - uTime * 0.0065, vUv.y - wobble);
    vec3 base = mix(uFallbackColor, texture2D(uMap, slowUv).rgb, uHasMap);
    vec3 detail = mix(uFallbackColor, texture2D(uMap, detailUv).rgb, uHasMap);
    vec3 tint = mix(vec3(1.0), uTint, uHasMap);
    float pulse = 1.0 + 0.06 * sin(uTime * 0.7 + vUv.x * 24.0 + vUv.y * 11.0);

    float facing = clamp(dot(normalize(vViewNormal), normalize(vViewDirection)), 0.0, 1.0);
    float limbDarkening = mix(0.62, 1.0, pow(facing, 0.45));

    vec3 color = mix(base, detail, 0.35) * tint * pulse * limbDarkening * 1.18;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export type SunSurfaceUniforms = {
  uMap: IUniform<Texture | null>;
  uHasMap: IUniform<number>;
  uTint: IUniform<Color>;
  uFallbackColor: IUniform<Color>;
  uTime: IUniform<number>;
};

export function createSunSurfaceUniforms(tint: string, fallbackColor: string): SunSurfaceUniforms {
  return {
    uMap: { value: null },
    uHasMap: { value: 0 },
    uTint: { value: new Color(tint) },
    uFallbackColor: { value: new Color(fallbackColor) },
    uTime: { value: 0 },
  };
}
