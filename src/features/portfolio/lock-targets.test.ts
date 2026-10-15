import { describe, expect, it } from 'vitest';
import { celestialBodies } from '@/content/celestial-bodies';
import { getInteractiveBodies } from '@/domain/celestial-body';
import type { ImmersiveSection, InteractiveCelestialBody } from '@/domain/celestial-body';
import { buildLockTargets } from './lock-targets';

const [sun] = getInteractiveBodies(celestialBodies) as [InteractiveCelestialBody];

const arcadeSection: ImmersiveSection = {
  presentation: 'immersive',
  experience: 'venus-arcade',
  menuLabel: 'Venus Arcade',
  menuTone: 'copper',
  callToAction: 'Clique para pousar',
};

const venus: InteractiveCelestialBody = { ...sun, id: 'venus', section: arcadeSection };

describe('buildLockTargets', () => {
  it('invites to open a panel section by its name', () => {
    const [target] = buildLockTargets([sun]);
    expect(target!.cta.accent).toContain(sun.section.menuLabel);
  });

  it('uses the call to action of an immersive experience instead of naming a section', () => {
    const [target] = buildLockTargets([venus]);
    expect(target!.cta.lead).toBe(arcadeSection.callToAction);
    expect(target!.cta.accent).not.toContain(arcadeSection.menuLabel);
  });

  it('keeps one target per body, in order', () => {
    expect(buildLockTargets([sun, venus]).map((target) => target.id)).toEqual(['sun', 'venus']);
  });
});
