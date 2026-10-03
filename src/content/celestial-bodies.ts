import { assertValidCelestialBodies } from '@/lib/celestial-body';
import type { CelestialBody } from '@/lib/celestial-body';
import { aboutContent } from './about';

const SUN_RADIUS = 2.4;
const SUN_ROTATION_PERIOD_SECONDS = 180;

const sun: CelestialBody = {
  id: 'sun',
  name: 'Sol',
  kind: 'star',
  radius: SUN_RADIUS,
  rotationPeriodSeconds: SUN_ROTATION_PERIOD_SECONDS,
  texture: null,
  section: {
    menuLabel: 'Sobre',
    title: 'Sobre',
    content: aboutContent,
  },
};

/** Adding a planet means adding an item here; no component changes. */
export const celestialBodies = assertValidCelestialBodies([sun]);
