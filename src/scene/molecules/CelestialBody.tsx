import { useCursor } from '@react-three/drei';
import { useState } from 'react';
import { useTexture } from '@/hooks/use-texture';
import type { TextureLoadFunction } from '@/hooks/use-texture';
import type { BodyTexture } from '@/lib/celestial-body';
import type { Highlight } from '@/lib/interaction-state';
import { FocusRing } from '../atoms/FocusRing';
import { SunMesh } from '../atoms/SunMesh';

type CelestialBodyProps = {
  radius: number;
  texture: BodyTexture | null;
  prefersSmallTexture: boolean;
  rotationPeriodSeconds: number | null;
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
  radius,
  texture,
  prefersSmallTexture,
  rotationPeriodSeconds,
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

  return (
    <>
      <SunMesh
        radius={radius}
        texture={loadedTexture}
        rotationPeriodSeconds={rotationPeriodSeconds}
        highlight={highlight}
        highlightEasingRate={highlightEasingRate}
        onPointerOver={() => changeHover(true)}
        onPointerOut={() => changeHover(false)}
        onSelect={onSelect}
      />
      {highlight === 'focused' && <FocusRing bodyRadius={radius} />}
    </>
  );
}
