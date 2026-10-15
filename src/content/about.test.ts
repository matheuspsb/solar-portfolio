import { describe, expect, it } from 'vitest';
import { aboutContent } from './about';
import { celestialBodies } from './celestial-bodies';

describe('aboutContent', () => {
  it('uses the small texture of the Sun, the body that opens it, for the emblem', () => {
    const sun = celestialBodies.find(
      (body) => body.section?.presentation === 'panel' && body.section.content === aboutContent,
    );
    expect(sun?.texture?.smallUrl).toBeDefined();
    expect(aboutContent.emblem.textureUrl).toBe(sun?.texture?.smallUrl);
  });
});
