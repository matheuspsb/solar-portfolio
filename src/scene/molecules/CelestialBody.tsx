import { useTexture } from '@/hooks/use-texture';
import type { TextureLoadFunction } from '@/hooks/use-texture';
import type { BodyTexture } from '@/lib/celestial-body';
import { SunMesh } from '../atoms/SunMesh';

type CelestialBodyProps = {
  radius: number;
  texture: BodyTexture | null;
  prefersSmallTexture: boolean;
  rotationPeriodSeconds: number | null;
  loadTexture?: TextureLoadFunction;
};

function pickTextureUrl(texture: BodyTexture | null, prefersSmallTexture: boolean): string | null {
  if (!texture) return null;
  return prefersSmallTexture ? texture.smallUrl : texture.url;
}

export function CelestialBody({
  radius,
  texture,
  prefersSmallTexture,
  rotationPeriodSeconds,
  loadTexture,
}: CelestialBodyProps) {
  const textureUrl = pickTextureUrl(texture, prefersSmallTexture);
  const { texture: loadedTexture } = useTexture(textureUrl, loadTexture);

  return (
    <SunMesh
      radius={radius}
      texture={loadedTexture}
      rotationPeriodSeconds={rotationPeriodSeconds}
    />
  );
}
