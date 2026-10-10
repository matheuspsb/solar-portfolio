import type { PlanetTone, TargetingAnchor } from '@/lib/celestial-body';

export type LockTarget = {
  id: string;
  tone: PlanetTone;
  code: string;
  name: string;
  description: string;
  ctaLabel: string;
  anchor: TargetingAnchor;
};
