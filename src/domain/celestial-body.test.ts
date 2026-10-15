import { describe, expect, it } from 'vitest';
import {
  assertValidCelestialBodies,
  getInteractiveBodies,
  validateCelestialBodies,
} from './celestial-body';
import type { BodySection, CelestialBodyConfig, PanelSection } from './celestial-body';

const panelSection: PanelSection = {
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
  },
};

function buildBody(overrides: Partial<CelestialBodyConfig> = {}): CelestialBodyConfig {
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

function buildPlanet(overrides: Partial<CelestialBodyConfig> = {}): CelestialBodyConfig {
  return buildBody({
    id: 'mercury',
    name: 'Mercúrio',
    kind: 'planet',
    radius: 0.5,
    orbit: { radius: 5, periodSeconds: 60, phaseRadians: 1 },
    ...overrides,
  });
}

const immersiveSection: BodySection = {
  presentation: 'immersive',
  experience: 'venus-arcade',
  menuLabel: 'Venus Arcade',
  menuTone: 'copper',
  callToAction: 'Clique para pousar',
};

function errorsFor(bodies: CelestialBodyConfig[]): string[] {
  const result = validateCelestialBodies(bodies);
  return result.valid ? [] : result.errors;
}

describe('validateCelestialBodies', () => {
  it('accepts a single valid body', () => {
    expect(validateCelestialBodies([buildBody()])).toEqual({ valid: true });
  });

  it('accepts a star with planets that have distinct ids', () => {
    const venus = buildPlanet({
      id: 'venus',
      orbit: { radius: 7, periodSeconds: 120, phaseRadians: 0 },
    });
    const bodies = [buildBody(), buildPlanet(), venus];
    expect(validateCelestialBodies(bodies).valid).toBe(true);
  });

  it('accepts a body without a texture (procedural fallback)', () => {
    expect(validateCelestialBodies([buildBody({ texture: null })]).valid).toBe(true);
  });

  it('rejects an empty list', () => {
    expect(errorsFor([])).toEqual([expect.stringContaining('at least one')]);
  });

  it('rejects duplicated ids and names the id', () => {
    const errors = errorsFor([buildBody(), buildPlanet({ id: 'sun' })]);
    expect(errors).toEqual([expect.stringContaining('"sun"')]);
    expect(errors[0]).toContain('duplicate');
  });

  it.each(['', '   '])('rejects blank id %j', (id) => {
    expect(errorsFor([buildBody({ id })])).toEqual([expect.stringContaining('id')]);
  });

  it('rejects ids that are not URL/DOM safe', () => {
    expect(errorsFor([buildBody({ id: 'Sol Central' })])).toEqual([expect.stringContaining('id')]);
  });

  it.each([
    ['code', { code: '  ', description: 'Estrela tipo G', anchor: 'top-left' as const }],
    ['description', { code: '001', description: '', anchor: 'top-left' as const }],
  ])('rejects a blank targeting %s', (field, targeting) => {
    const errors = errorsFor([buildBody({ targeting })]);
    expect(errors.some((message) => message.includes(`targeting ${field}`))).toBe(true);
  });

  it('rejects a blank name', () => {
    expect(errorsFor([buildBody({ name: ' ' })])).toEqual([expect.stringContaining('name')]);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rejects radius %s', (radius) => {
    expect(errorsFor([buildBody({ radius })])).toEqual([expect.stringContaining('radius')]);
  });

  it.each([0, -5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects rotation period %s',
    (rotationPeriodSeconds) => {
      expect(errorsFor([buildBody({ rotationPeriodSeconds })])).toEqual([
        expect.stringContaining('rotationPeriodSeconds'),
      ]);
    },
  );

  it('rejects a texture with an empty url', () => {
    const errors = errorsFor([buildBody({ texture: { url: '', smallUrl: '/a.webp' } })]);
    expect(errors).toEqual([expect.stringContaining('texture')]);
  });

  it('reports every problem, not only the first', () => {
    const errors = errorsFor([buildBody({ radius: 0, name: '' })]);
    expect(errors).toHaveLength(2);
  });
});

describe('orbits', () => {
  it('rejects a planet without an orbit', () => {
    expect(errorsFor([buildBody(), buildPlanet({ orbit: null })])).toEqual([
      expect.stringContaining('orbit'),
    ]);
  });

  it('rejects a star that has an orbit', () => {
    const star = buildBody({ orbit: { radius: 5, periodSeconds: 60, phaseRadians: 0 } });
    expect(errorsFor([star])).toEqual([expect.stringContaining('orbit')]);
  });

  it('rejects a planet whose orbit passes through the star', () => {
    const planet = buildPlanet({ orbit: { radius: 2.2, periodSeconds: 60, phaseRadians: 0 } });
    expect(errorsFor([buildBody(), planet])).toEqual([expect.stringContaining('star')]);
  });

  it.each([0, -3, Number.NaN, Number.POSITIVE_INFINITY])('rejects orbit radius %s', (radius) => {
    const planet = buildPlanet({ orbit: { radius, periodSeconds: 60, phaseRadians: 0 } });
    expect(errorsFor([buildBody(), planet]).join(' ')).toContain('orbit.radius');
  });

  it.each([0, -3, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects orbit period %s',
    (periodSeconds) => {
      const planet = buildPlanet({ orbit: { radius: 5, periodSeconds, phaseRadians: 0 } });
      expect(errorsFor([buildBody(), planet]).join(' ')).toContain('orbit.periodSeconds');
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY])('rejects orbit phase %s', (phaseRadians) => {
    const planet = buildPlanet({ orbit: { radius: 5, periodSeconds: 60, phaseRadians } });
    expect(errorsFor([buildBody(), planet]).join(' ')).toContain('orbit.phaseRadians');
  });

  it('accepts a negative or large phase (any starting angle is fine)', () => {
    const planet = buildPlanet({ orbit: { radius: 5, periodSeconds: 60, phaseRadians: -9 } });
    expect(validateCelestialBodies([buildBody(), planet]).valid).toBe(true);
  });

  it('requires exactly one star at the center', () => {
    expect(errorsFor([buildPlanet()]).join(' ')).toContain('exactly one star');
    expect(errorsFor([buildBody(), buildBody({ id: 'sirius' })]).join(' ')).toContain(
      'exactly one star',
    );
  });
});

describe('sections', () => {
  it('accepts a planet without a section, shown in the scene but not opened', () => {
    expect(validateCelestialBodies([buildBody(), buildPlanet({ section: null })]).valid).toBe(true);
  });

  it('rejects a star without a section, since it is the way into the portfolio', () => {
    expect(errorsFor([buildBody({ section: null })])).toEqual([expect.stringContaining('section')]);
  });

  it('still checks the labels of a section that exists', () => {
    const planet = buildPlanet();
    const blankMenu = buildPlanet({ section: { ...planet.section!, menuLabel: ' ' } });
    expect(errorsFor([buildBody(), blankMenu])).toEqual([expect.stringContaining('menuLabel')]);
  });

  it('accepts a planet that opens an immersive experience instead of a panel', () => {
    const venus = buildPlanet({ section: immersiveSection });
    expect(validateCelestialBodies([buildBody(), venus]).valid).toBe(true);
  });

  it('rejects an immersive section without a call to action for the target lock', () => {
    const venus = buildPlanet({ section: { ...immersiveSection, callToAction: '  ' } });
    expect(errorsFor([buildBody(), venus])).toEqual([expect.stringContaining('callToAction')]);
  });

  it('rejects an immersive section without a menu label, like any other section', () => {
    const venus = buildPlanet({ section: { ...immersiveSection, menuLabel: '' } });
    expect(errorsFor([buildBody(), venus])).toEqual([expect.stringContaining('menuLabel')]);
  });

  it('keeps asking a panel section for the label of its panel', () => {
    const blankPanel = buildPlanet({ section: { ...panelSection, panelLabel: '' } });
    expect(errorsFor([buildBody(), blankPanel])).toEqual([expect.stringContaining('panelLabel')]);
  });
});

describe('orbits between planets', () => {
  const orbitAt = (radius: number) => ({ radius, periodSeconds: 60, phaseRadians: 0 });

  it('rejects two planets whose paths touch and names both', () => {
    const venus = buildPlanet({ id: 'venus', radius: 0.8, orbit: orbitAt(6) });
    const errors = errorsFor([buildBody(), buildPlanet({ orbit: orbitAt(5) }), venus]);
    expect(errors).toEqual([expect.stringMatching(/mercury.*venus|venus.*mercury/)]);
  });

  it('rejects two planets on the same orbit', () => {
    const venus = buildPlanet({ id: 'venus', orbit: orbitAt(5) });
    expect(errorsFor([buildBody(), buildPlanet(), venus])).toHaveLength(1);
  });

  it('accepts planets whose paths are close but clear of each other', () => {
    const venus = buildPlanet({ id: 'venus', radius: 0.5, orbit: orbitAt(6.01) });
    expect(validateCelestialBodies([buildBody(), buildPlanet(), venus]).valid).toBe(true);
  });

  it('does not double report an orbit that is already invalid', () => {
    const broken = buildPlanet({ id: 'venus', orbit: orbitAt(Number.NaN) });
    expect(errorsFor([buildBody(), buildPlanet(), broken])).toHaveLength(1);
  });
});

describe('getInteractiveBodies', () => {
  it('keeps only the bodies that open a section, in their original order', () => {
    const sun = buildBody();
    const venus = buildPlanet({ id: 'venus', section: null });
    const mercury = buildPlanet();
    expect(getInteractiveBodies([sun, venus, mercury])).toEqual([sun, mercury]);
  });

  it('keeps a body that opens an immersive experience', () => {
    const venus = buildPlanet({ id: 'venus', section: immersiveSection });
    expect(getInteractiveBodies([buildBody(), venus])).toHaveLength(2);
  });

  it('returns an empty list when nothing opens a section', () => {
    expect(getInteractiveBodies([buildPlanet({ section: null })])).toEqual([]);
    expect(getInteractiveBodies([])).toEqual([]);
  });
});

describe('assertValidCelestialBodies', () => {
  it('returns the same list when valid', () => {
    const bodies = [buildBody()];
    expect(assertValidCelestialBodies(bodies)).toBe(bodies);
  });

  it('throws one error listing all problems when invalid', () => {
    expect(() => assertValidCelestialBodies([])).toThrow(/at least one/);
  });
});
