// Use case: the scene and the quick-access menu are both fed by the celestial body list. A
// malformed entry (duplicate id, radius NaN, no name) would crash the scene or render a
// nameless menu item, so the config is validated before anything uses it.
import { describe, expect, it } from 'vitest';
import { assertValidCelestialBodies, validateCelestialBodies } from './celestial-body';
import type { CelestialBodyConfig } from './celestial-body';

function buildBody(overrides: Partial<CelestialBodyConfig> = {}): CelestialBodyConfig {
  return {
    id: 'sun',
    name: 'Sol',
    kind: 'star',
    radius: 2,
    rotationPeriodSeconds: 120,
    texture: { url: '/textures/sun.webp', smallUrl: '/textures/sun-small.webp' },
    section: {
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
    },
    ...overrides,
  };
}

function errorsFor(bodies: CelestialBodyConfig[]): string[] {
  const result = validateCelestialBodies(bodies);
  return result.valid ? [] : result.errors;
}

describe('validateCelestialBodies', () => {
  it('accepts a single valid body', () => {
    expect(validateCelestialBodies([buildBody()])).toEqual({ valid: true });
  });

  it('accepts several bodies with distinct ids', () => {
    expect(validateCelestialBodies([buildBody(), buildBody({ id: 'earth' })]).valid).toBe(true);
  });

  it('accepts a body without a texture (procedural fallback)', () => {
    expect(validateCelestialBodies([buildBody({ texture: null })]).valid).toBe(true);
  });

  it('rejects an empty list', () => {
    expect(errorsFor([])).toEqual([expect.stringContaining('at least one')]);
  });

  it('rejects duplicated ids and names the id', () => {
    const errors = errorsFor([buildBody(), buildBody()]);
    expect(errors).toEqual([expect.stringContaining('"sun"')]);
    expect(errors[0]).toContain('duplicate');
  });

  it.each(['', '   '])('rejects blank id %j', (id) => {
    expect(errorsFor([buildBody({ id })])).toEqual([expect.stringContaining('id')]);
  });

  it('rejects ids that are not URL/DOM safe', () => {
    expect(errorsFor([buildBody({ id: 'Sol Central' })])).toEqual([expect.stringContaining('id')]);
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

  it('rejects a blank menu label', () => {
    const body = buildBody();
    body.section = { ...body.section, menuLabel: '' };
    expect(errorsFor([body])).toEqual([expect.stringContaining('menuLabel')]);
  });

  it('rejects a blank panel label', () => {
    const body = buildBody();
    body.section = { ...body.section, panelLabel: ' ' };
    expect(errorsFor([body])).toEqual([expect.stringContaining('panelLabel')]);
  });

  it('reports every problem, not only the first', () => {
    const errors = errorsFor([buildBody({ radius: 0, name: '' })]);
    expect(errors).toHaveLength(2);
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
