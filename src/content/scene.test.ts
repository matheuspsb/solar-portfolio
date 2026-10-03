// Use case: screen-reader users hear this text instead of seeing the 3D canvas. It must exist and
// be informative (mention the Sun and the section it opens), otherwise the scene is a silent void.
import { expect, it } from 'vitest';
import { celestialBodies } from './celestial-bodies';
import { sceneDescription } from './scene';

it('describes the scene and names the Sun and its section', () => {
  expect(sceneDescription.trim().length).toBeGreaterThan(20);
  expect(sceneDescription).toContain('Sol');
  const [sun] = celestialBodies;
  expect(sceneDescription).toContain(sun!.section.menuLabel);
});
