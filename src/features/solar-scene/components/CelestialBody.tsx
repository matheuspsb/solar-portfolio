import { useCursor } from '@react-three/drei';
import { useState } from 'react';
import type { BodyKind, BodyTexture, Orbit } from '@/lib/celestial-body';
import type { Highlight } from '@/lib/interaction-state';
import { useTexture } from '../hooks/use-texture';
import type { TextureLoadFunction } from '../hooks/use-texture';
import { FocusRing } from './FocusRing';
import { OrbitGroup } from './OrbitGroup';
import { OrbitPath } from './OrbitPath';
import { PlanetMesh } from './PlanetMesh';
import { SunCorona } from './SunCorona';
import { SunMesh } from './SunMesh';

type CelestialBodyProps = {
  kind: BodyKind;
  /** Where a planet travels; stars stay at the center (`null`). */
  orbit: Orbit | null;
  radius: number;
  texture: BodyTexture | null;
  prefersSmallTexture: boolean;
  /** `null` disables automatic rotation (reduced motion). */
  rotationPeriodSeconds: number | null;
  /** False freezes the plasma, the corona shimmer and the orbit (reduced motion). */
  isAnimated: boolean;
  highlight: Highlight;
  highlightEasingRate: number;
  onHoverChange: (isHovered: boolean) => void;
  onSelect: () => void;
  loadTexture?: TextureLoadFunction;
};

function pickTextureUrl(texture: BodyTexture | null, prefersSmallTexture: boolean): string | null {
  if (!texture) return null;
  return prefersSmallTexture ? texture.smallUrl : texture.url;
}

export function CelestialBody({
  kind,
  orbit,
  radius,
  texture,
  prefersSmallTexture,
  rotationPeriodSeconds,
  isAnimated,
  highlight,
  highlightEasingRate,
  onHoverChange,
  onSelect,
  loadTexture,
}: CelestialBodyProps) {
  const [isPointerOver, setIsPointerOver] = useState(false);
  const textureUrl = pickTextureUrl(texture, prefersSmallTexture);
  const { texture: loadedTexture } = useTexture(textureUrl, loadTexture);
  useCursor(isPointerOver);

  const changeHover = (isHovered: boolean) => {
    setIsPointerOver(isHovered);
    onHoverChange(isHovered);
  };
  const focusRing = highlight === 'focused' && <FocusRing bodyRadius={radius} />;
  const interaction = {
    highlight,
    highlightEasingRate,
    onPointerOver: () => changeHover(true),
    onPointerOut: () => changeHover(false),
    onSelect,
  };

  if (kind === 'planet' && orbit) {
    return (
      <>
        <OrbitPath radius={orbit.radius} />
        <OrbitGroup orbit={orbit} isAnimated={isAnimated}>
          <PlanetMesh
            radius={radius}
            texture={loadedTexture}
            rotationPeriodSeconds={rotationPeriodSeconds}
            {...interaction}
          />
          {focusRing}
        </OrbitGroup>
      </>
    );
  }

  return (
    <>
      <SunMesh
        radius={radius}
        texture={loadedTexture}
        rotationPeriodSeconds={rotationPeriodSeconds}
        isSurfaceAnimated={isAnimated}
        {...interaction}
      />
      <SunCorona radius={radius} isAnimated={isAnimated} />
      {focusRing}
    </>
  );
}
