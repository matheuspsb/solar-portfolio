import { assertValidCelestialBodies } from '@/domain/celestial-body-validation';
import type { CelestialBodyConfig } from '@/domain/celestial-body';
import { aboutContent } from './about';
import { contactContent } from './contact';
import { sunTexture } from './textures';

const SUN_RADIUS = 2.4;
const SUN_ROTATION_PERIOD_SECONDS = 180;

const MERCURY_RADIUS = 0.55;
const MERCURY_ROTATION_PERIOD_SECONDS = 90;
const MERCURY_ORBIT_RADIUS = 4.6;
const MERCURY_ORBIT_PERIOD_SECONDS = 70;
const MERCURY_ORBIT_PHASE_RADIANS = 0.9;

const VENUS_RADIUS = 0.72;
const VENUS_ROTATION_PERIOD_SECONDS = 240;
const VENUS_ORBIT_RADIUS = 6.2;
const VENUS_ORBIT_PERIOD_SECONDS = 180;
const VENUS_ORBIT_PHASE_RADIANS = 4;

const sun: CelestialBodyConfig = {
  id: 'sun',
  name: 'Sol',
  kind: 'star',
  radius: SUN_RADIUS,
  rotationPeriodSeconds: SUN_ROTATION_PERIOD_SECONDS,
  orbit: null,
  texture: sunTexture,
  targeting: { code: '001', description: 'Estrela tipo G · centro do sistema', anchor: 'top-left' },
  section: {
    presentation: 'panel',
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
    presentation: 'panel',
    menuLabel: 'Contato',
    menuTone: 'periwinkle',
    title: 'Contato',
    panelLabel: 'Contato · Objeto 002',
    content: contactContent,
  },
};

const venus: CelestialBodyConfig = {
  id: 'venus',
  name: 'Vênus',
  kind: 'planet',
  radius: VENUS_RADIUS,
  rotationPeriodSeconds: VENUS_ROTATION_PERIOD_SECONDS,
  orbit: {
    radius: VENUS_ORBIT_RADIUS,
    periodSeconds: VENUS_ORBIT_PERIOD_SECONDS,
    phaseRadians: VENUS_ORBIT_PHASE_RADIANS,
  },
  texture: { url: '/textures/venus.webp', smallUrl: '/textures/venus-small.webp' },
  targeting: {
    code: '003',
    description: 'Algo zumbe sob as nuvens',
    anchor: 'bottom-left',
  },
  section: {
    presentation: 'immersive',
    experience: 'venus-arcade',
    menuLabel: 'Venus Arcade',
    menuTone: 'copper',
    callToAction: 'Clique para pousar',
  },
};

export const celestialBodies = assertValidCelestialBodies([sun, mercury, venus]);
