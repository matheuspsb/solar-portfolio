'use client';

import dynamic from 'next/dynamic';
import type { CelestialBodyConfig } from '@/lib/celestial-body';
import type { Highlight } from '@/lib/interaction-state';
import { useViewportWidth } from '@/hooks/use-viewport-width';
import { getSceneQuality } from '@/lib/scene-quality';

const SolarSystemScene = dynamic(
  () => import('./SolarSystemScene').then((module) => module.SolarSystemScene),
  { ssr: false },
);

type SolarSystemSceneLoaderProps = {
  bodies: readonly CelestialBodyConfig[];
  highlightOf: (id: string) => Highlight;
  onHoverChange: (id: string, isHovered: boolean) => void;
  onSelect: (id: string) => void;
};

export function SolarSystemSceneLoader({
  bodies,
  highlightOf,
  onHoverChange,
  onSelect,
}: SolarSystemSceneLoaderProps) {
  const quality = getSceneQuality(useViewportWidth());
  return (
    <SolarSystemScene
      quality={quality}
      bodies={bodies}
      highlightOf={highlightOf}
      onHoverChange={onHoverChange}
      onSelect={onSelect}
    />
  );
}
