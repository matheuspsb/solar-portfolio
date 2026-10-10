import { assertValidCelestialBodies } from '@/lib/celestial-body';
import type { CelestialBodyConfig } from '@/lib/celestial-body';
import { aboutContent } from './about';
import { contactContent } from './contact';

const SUN_RADIUS = 2.4;
const SUN_ROTATION_PERIOD_SECONDS = 180;

const MERCURY_RADIUS = 0.55;
const MERCURY_ROTATION_PERIOD_SECONDS = 90;
const MERCURY_ORBIT_RADIUS = 4.6;
const MERCURY_ORBIT_PERIOD_SECONDS = 70;
const MERCURY_ORBIT_PHASE_RADIANS = 0.9;

const sun: CelestialBodyConfig = {
  id: 'sun',
  name: 'Sol',
  kind: 'star',
  radius: SUN_RADIUS,
  rotationPeriodSeconds: SUN_ROTATION_PERIOD_SECONDS,
  orbit: null,
  texture: { url: '/textures/sun.webp', smallUrl: '/textures/sun-small.webp' },
  targeting: { code: '001', description: 'Estrela tipo G · centro do sistema', anchor: 'top-left' },
  section: {
    menuLabel: 'Sobre',
    menuTone: 'amber',
    title: 'Sobre',
    panelLabel: 'Sobre · Objeto 001',
    content: aboutContent,
  },
};

const mercury: CelestialBodyConfig = {
  id: 'mercury',
  name: 'Mercúrio',
  kind: 'planet',
  radius: MERCURY_RADIUS,
  rotationPeriodSeconds: MERCURY_ROTATION_PERIOD_SECONDS,
  orbit: {
    radius: MERCURY_ORBIT_RADIUS,
    periodSeconds: MERCURY_ORBIT_PERIOD_SECONDS,
    phaseRadians: MERCURY_ORBIT_PHASE_RADIANS,
  },
  texture: { url: '/textures/mercury.webp', smallUrl: '/textures/mercury-small.webp' },
  targeting: { code: '002', description: 'Planeta mensageiro · 0,39 UA', anchor: 'bottom-left' },
  section: {
    menuLabel: 'Contato',
    menuTone: 'periwinkle',
    title: 'Contato',
    panelLabel: 'Contato · Objeto 002',
    content: contactContent,
  },
};

export const celestialBodies = assertValidCelestialBodies([sun, mercury]);
