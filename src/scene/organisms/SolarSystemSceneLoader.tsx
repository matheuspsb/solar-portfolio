'use client';

import dynamic from 'next/dynamic';
import { useViewportWidth } from '@/hooks/use-viewport-width';
import { getSceneQuality } from '@/lib/scene-quality';

const SolarSystemScene = dynamic(
  () => import('./SolarSystemScene').then((module) => module.SolarSystemScene),
  { ssr: false },
);

export function SolarSystemSceneLoader() {
  const quality = getSceneQuality(useViewportWidth());
  return <SolarSystemScene quality={quality} />;
}
