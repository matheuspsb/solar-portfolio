import { Bloom, EffectComposer } from '@react-three/postprocessing';

const BLOOM_INTENSITY = 1.1;
const BLOOM_LUMINANCE_THRESHOLD = 0.55;
const BLOOM_LUMINANCE_SMOOTHING = 0.4;

export function SceneEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={BLOOM_INTENSITY}
        luminanceThreshold={BLOOM_LUMINANCE_THRESHOLD}
        luminanceSmoothing={BLOOM_LUMINANCE_SMOOTHING}
      />
    </EffectComposer>
  );
}
