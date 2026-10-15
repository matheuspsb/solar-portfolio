import type { LockTarget } from '@/features/target-lock';
import { targetingCopy } from '@/content/targeting';
import type { BodySection, InteractiveCelestialBody } from '@/domain/celestial-body';

function buildCallToAction(section: BodySection): LockTarget['cta'] {
  if (section.presentation === 'immersive') {
    return { lead: section.callToAction, accent: targetingCopy.ctaArrow };
  }
  return {
    lead: targetingCopy.ctaPrefix,
    accent: `${section.menuLabel} ${targetingCopy.ctaArrow}`,
  };
}

export function buildLockTargets(bodies: readonly InteractiveCelestialBody[]): LockTarget[] {
  return bodies.map((body) => ({
    id: body.id,
    tone: body.section.menuTone,
    code: body.targeting.code,
    name: body.name.toLocaleUpperCase('pt-BR'),
    description: body.targeting.description,
    cta: buildCallToAction(body.section),
    anchor: body.targeting.anchor,
  }));
}
