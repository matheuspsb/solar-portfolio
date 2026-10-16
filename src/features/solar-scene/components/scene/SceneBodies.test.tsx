import ReactThreeTestRenderer from '@react-three/test-renderer';
import { describe, expect, it, vi } from 'vitest';
import type { CelestialBodyConfig } from '@/domain/celestial-body';
import { buildBody, buildPlanet } from '@/test/celestial-body-builders';
import { createFakeScene } from '../../test/in-scene';
import { SceneBodies } from './SceneBodies';

const withoutTexture = (body: CelestialBodyConfig): CelestialBodyConfig => ({
  ...body,
  texture: null,
});

function renderBodies(bodies: readonly CelestialBodyConfig[], onBodySettled = vi.fn()) {
  const scene = createFakeScene();
  return ReactThreeTestRenderer.create(
    <SceneBodies
      bodies={bodies}
      prefersSmallTexture={false}
      highlightOf={scene.highlightOf}
      onHoverChange={scene.onHoverChange}
      onSelect={scene.onSelect}
      prefersReducedMotion={scene.prefersReducedMotion}
      onBodySettled={onBodySettled}
    />,
  );
}

describe('SceneBodies', () => {
  const sun = withoutTexture(buildBody());
  const mercury = withoutTexture(buildPlanet());
  const venus = withoutTexture(
    buildPlanet({ id: 'venus', orbit: { radius: 7, periodSeconds: 90, phaseRadians: 2 } }),
  );

  it('puts every body in the scene under its own name, so the camera and the tracker can find it', async () => {
    const renderer = await renderBodies([sun, mercury, venus]);
    const names = renderer.scene.findAll((node) => node.instance.name.startsWith('body-'));
    expect(names.map((node) => node.instance.name).sort()).toEqual([
      'body-mercury',
      'body-sun',
      'body-venus',
    ]);
  });

  it('tells the scene each body is ready, once its texture is settled', async () => {
    const onBodySettled = vi.fn();
    await renderBodies([sun, mercury, venus], onBodySettled);
    expect(onBodySettled.mock.calls.map(([id]) => id).sort()).toEqual(['mercury', 'sun', 'venus']);
  });

  it('draws nothing without bodies', async () => {
    const renderer = await renderBodies([]);
    expect(renderer.scene.children).toHaveLength(0);
  });

  it('draws the new body when one is added to the list', async () => {
    const renderer = await renderBodies([sun, mercury]);
    const scene = createFakeScene();
    await renderer.update(
      <SceneBodies
        bodies={[sun, mercury, venus]}
        prefersSmallTexture={false}
        highlightOf={scene.highlightOf}
        onHoverChange={scene.onHoverChange}
        onSelect={scene.onSelect}
        prefersReducedMotion={scene.prefersReducedMotion}
        onBodySettled={vi.fn()}
      />,
    );
    const names = renderer.scene.findAll((node) => node.instance.name.startsWith('body-'));
    expect(names).toHaveLength(3);
  });
});
