// Use case: the shipped content is what recruiters read. It must validate, hold only the Sun in
// this phase, and contain exactly the facts the owner approved (no invented experience).
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

  it('exposes the about section with the approved facts', () => {
    const [sun] = celestialBodies;
    const content = sun?.section.content;
    expect(content?.type).toBe('about');
    if (content?.type !== 'about') return;
    expect(content.name).toBe('Matheus');
    expect(content.role).toContain('Software Engineer');
    expect(content.role).toContain('frontend');
    expect(content.stack).toEqual([
      'React',
      'Next.js',
      'TypeScript',
      'TanStack Query',
      'React Hook Form',
      'Storybook',
    ]);
    const factValues = content.facts.map((fact) => fact.value).join(' | ');
    expect(factValues).toContain('5 anos');
    expect(factValues).toContain('Campina Grande');
    expect(content.links).toEqual([
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/matheuspaulosouza' },
    ]);
  });
});
