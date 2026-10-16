import type { BodyKind, BodyTexture, Orbit } from '@/domain/celestial-body';
import { useBodyHighlight, useScenePrefersReducedMotion } from '../../hooks/use-body-interaction';
import { useTexture } from '../../hooks/use-texture';
import type { TextureLoadFunction } from '../../hooks/use-texture';
import { getBodySceneName } from '../../lib/body-scene-name';
import { getRotationPeriodForMotion } from '../../lib/motion';
import { FocusRing } from './FocusRing';
import { OrbitGroup } from './OrbitGroup';
import { OrbitPath } from './OrbitPath';
import { PlanetMesh } from './PlanetMesh';
import { SunCorona } from './SunCorona';
import { SunMesh } from './SunMesh';

type CelestialBodyProps = {
  id: string;
  kind: BodyKind;
  orbit: Orbit | null;
  radius: number;
  texture: BodyTexture | null;
  prefersSmallTexture: boolean;
  rotationPeriodSeconds: number;
  isInteractive: boolean;
  onSettled?: (id: string) => void;
  loadTexture?: TextureLoadFunction;
};

function pickTextureUrl(texture: BodyTexture | null, prefersSmallTexture: boolean): string | null {
  if (!texture) return null;
  return prefersSmallTexture ? texture.smallUrl : texture.url;
}

export function CelestialBody({
  id,
  kind,
  orbit,
  radius,
  texture,
  prefersSmallTexture,
  rotationPeriodSeconds,
  isInteractive,
  onSettled,
  loadTexture,
}: CelestialBodyProps) {
  const textureUrl = pickTextureUrl(texture, prefersSmallTexture);
  const { texture: loadedTexture } = useTexture(textureUrl, loadTexture, () => onSettled?.(id));

  const prefersReducedMotion = useScenePrefersReducedMotion();
  const isAnimated = !prefersReducedMotion;
  const rotationPeriodForMotion = getRotationPeriodForMotion(
    rotationPeriodSeconds,
    prefersReducedMotion,
  );
  const isFocused = useBodyHighlight(id) === 'focused';
  const focusRing = isFocused && <FocusRing bodyRadius={radius} />;

  if (kind === 'planet' && orbit) {
    return (
      <>
        <OrbitPath radius={orbit.radius} />
        <OrbitGroup name={getBodySceneName(id)} orbit={orbit} isAnimated={isAnimated}>
          <PlanetMesh
            id={id}
            radius={radius}
            texture={loadedTexture}
            rotationPeriodSeconds={rotationPeriodForMotion}
            isInteractive={isInteractive}
          />
          {focusRing}
        </OrbitGroup>
      </>
    );
  }

  return (
    <>
      <SunMesh
        id={id}
        radius={radius}
        texture={loadedTexture}
        rotationPeriodSeconds={rotationPeriodForMotion}
        isSurfaceAnimated={isAnimated}
      />
      <SunCorona radius={radius} isAnimated={isAnimated} />
      {focusRing}
    </>
  );
}
