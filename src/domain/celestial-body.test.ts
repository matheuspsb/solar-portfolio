import { describe, expect, it } from 'vitest';
import { buildBody, buildPlanet, immersiveSection } from '@/test/celestial-body-builders';
import { getInteractiveBodies } from './celestial-body';

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
