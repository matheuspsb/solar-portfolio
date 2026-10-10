import { useCursor } from '@react-three/drei';
import { useEffect, useState } from 'react';
import type { BodyKind, BodyTexture, Orbit } from '@/lib/celestial-body';
import type { Highlight } from '@/lib/interaction-state';
import { useTexture } from '../hooks/use-texture';
import { getBodySceneName } from '../lib/body-scene-name';
import type { TextureLoadFunction } from '../hooks/use-texture';
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
  rotationPeriodSeconds: number | null;
  isAnimated: boolean;
  highlight: Highlight;
  highlightEasingRate: number;
  onHoverChange: (isHovered: boolean) => void;
  onSelect: () => void;
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
  isAnimated,
  highlight,
  highlightEasingRate,
  onHoverChange,
  onSelect,
  onSettled,
  loadTexture,
}: CelestialBodyProps) {
  const [isPointerOver, setIsPointerOver] = useState(false);
  const textureUrl = pickTextureUrl(texture, prefersSmallTexture);
  const { texture: loadedTexture, status } = useTexture(textureUrl, loadTexture);
  const isSettled = textureUrl === null || status === 'loaded' || status === 'error';
  useEffect(() => {
    if (isSettled) onSettled?.(id);
  }, [isSettled, id, onSettled]);
  useCursor(isPointerOver);

  const changeHover = (isHovered: boolean) => {
    setIsPointerOver(isHovered);
    onHoverChange(isHovered);
  };
  const name = getBodySceneName(id);
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
        <OrbitGroup name={name} orbit={orbit} isAnimated={isAnimated}>
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
        name={name}
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
