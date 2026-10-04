import { assertValidCelestialBodies } from '@/lib/celestial-body';
import type { CelestialBodyConfig } from '@/lib/celestial-body';
import { aboutContent } from './about';

const SUN_RADIUS = 2.4;
const SUN_ROTATION_PERIOD_SECONDS = 180;

const sun: CelestialBodyConfig = {
  id: 'sun',
  name: 'Sol',
  kind: 'star',
  radius: SUN_RADIUS,
  rotationPeriodSeconds: SUN_ROTATION_PERIOD_SECONDS,
  texture: { url: '/textures/sun.webp', smallUrl: '/textures/sun-small.webp' },
  section: {
    menuLabel: 'Sobre',
    menuTone: 'amber',
    title: 'Sobre',
    panelLabel: 'Sobre · Objeto 001',
    content: aboutContent,
  },
};

/** Adding a planet means adding an item here; no component changes. */
export const celestialBodies = assertValidCelestialBodies([sun]);
