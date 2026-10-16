import type { CelestialBodyConfig, ImmersiveSection, PanelSection } from '@/domain/celestial-body';

export const panelSection: PanelSection = {
  presentation: 'panel',
  menuLabel: 'Sobre',
  menuTone: 'amber',
  title: 'Sobre',
  panelLabel: 'Sobre · Objeto 001',
  content: {
    type: 'about',
    name: 'Matheus',
    role: 'Software Engineer',
    summary: 'Resumo',
    experience: { value: '~5', unit: 'órbitas', description: 'anos em frontend' },
    location: { name: 'Brasil', coordinates: '0° · 0°' },
    stack: [{ name: 'React', tone: 'cyan', size: 'lg' }],
    links: [{ label: 'LinkedIn', href: 'https://linkedin.com/in/x' }],
    emblem: { textureUrl: null },
  },
};

export function buildBody(overrides: Partial<CelestialBodyConfig> = {}): CelestialBodyConfig {
  return {
    id: 'sun',
    name: 'Sol',
    kind: 'star',
    radius: 2,
    rotationPeriodSeconds: 120,
    orbit: null,
    texture: { url: '/textures/sun.webp', smallUrl: '/textures/sun-small.webp' },
    targeting: { code: '001', description: 'Estrela tipo G', anchor: 'top-left' },
    section: panelSection,
    ...overrides,
  };
}

export function buildPlanet(overrides: Partial<CelestialBodyConfig> = {}): CelestialBodyConfig {
  return buildBody({
    id: 'mercury',
    name: 'Mercúrio',
    kind: 'planet',
    radius: 0.5,
    orbit: { radius: 5, periodSeconds: 60, phaseRadians: 1 },
    ...overrides,
  });
}

export const immersiveSection: ImmersiveSection = {
  presentation: 'immersive',
  experience: 'venus-arcade',
  menuLabel: 'Venus Arcade',
  menuTone: 'copper',
  callToAction: 'Clique para pousar',
};
