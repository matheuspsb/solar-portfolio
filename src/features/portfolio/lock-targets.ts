import type { LockTarget } from '@/features/target-lock';
import type { CelestialBodyConfig } from '@/lib/celestial-body';

export function buildLockTargets(bodies: readonly CelestialBodyConfig[]): LockTarget[] {
  return bodies.map((body) => ({
    id: body.id,
    tone: body.section.menuTone,
    code: body.targeting.code,
    name: body.name.toLocaleUpperCase('pt-BR'),
    description: body.targeting.description,
    ctaLabel: body.section.menuLabel,
    anchor: body.targeting.anchor,
  }));
}
