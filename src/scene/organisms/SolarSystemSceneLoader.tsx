'use client';

import dynamic from 'next/dynamic';
import type { CelestialBodyConfig } from '@/lib/celestial-body';
import { useViewportWidth } from '@/hooks/use-viewport-width';
import { getSceneQuality } from '@/lib/scene-quality';

const SolarSystemScene = dynamic(
  () => import('./SolarSystemScene').then((module) => module.SolarSystemScene),
  { ssr: false },
);

type SolarSystemSceneLoaderProps = {
  bodies: readonly CelestialBodyConfig[];
};

export function SolarSystemSceneLoader({ bodies }: SolarSystemSceneLoaderProps) {
  const quality = getSceneQuality(useViewportWidth());
  return <SolarSystemScene quality={quality} bodies={bodies} />;
}
