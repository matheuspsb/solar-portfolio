import { sceneTokens } from '@/design-system/tokens/scene-tokens';

const AMBIENT_INTENSITY = 0.22;
const SUN_LIGHT_INTENSITY = 70;
const SUN_LIGHT_DISTANCE = 0;
const SUN_LIGHT_DECAY = 2;

export function SceneLights() {
  return (
    <>
      <ambientLight intensity={AMBIENT_INTENSITY} />
      <pointLight
        position={[0, 0, 0]}
        color={sceneTokens.sunCoreColor}
        intensity={SUN_LIGHT_INTENSITY}
        distance={SUN_LIGHT_DISTANCE}
        decay={SUN_LIGHT_DECAY}
      />
    </>
  );
}
