// Use case: the shipped configuration feeds the scene, the menu and the panel. It must pass the
// validation, so a typo (duplicate id, blank label, bad radius) fails here instead of in production.
// What the texts say is content, not behavior, so it is deliberately not asserted.
import { describe, expect, it } from 'vitest';
import { validateCelestialBodies } from '@/lib/celestial-body';
import { celestialBodies } from './celestial-bodies';

describe('celestialBodies', () => {
  it('is a valid configuration', () => {
    expect(validateCelestialBodies(celestialBodies)).toEqual({ valid: true });
  });

  it('contains only the Sun in this phase', () => {
    expect(celestialBodies.map((body) => body.id)).toEqual(['sun']);
  });
});
