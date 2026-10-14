import type { PlanetTone, TargetingAnchor } from '@/domain/celestial-body';

export type LockTarget = {
  id: string;
  tone: PlanetTone;
  code: string;
  name: string;
  description: string;
  cta: { lead: string; accent: string };
  anchor: TargetingAnchor;
};
