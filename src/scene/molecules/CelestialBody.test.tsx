// Use case: a celestial body shows its texture, chosen by screen size, and must still show up as
// a warm sphere when the texture cannot load (404/offline). If the fallback failed, the Sun
// would be missing or black exactly when the network is flaky.
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Texture } from 'three';
import type { Mesh, MeshBasicMaterial } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { CelestialBody } from './CelestialBody';

const texture = { url: '/full.webp', smallUrl: '/small.webp' };

function readMesh(renderer: Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>) {
  return renderer.scene.children[0]!.instance as Mesh;
}

describe('CelestialBody', () => {
  it('renders the sphere immediately, before the texture arrives', async () => {
    const loadTexture = vi.fn(() => new Promise<Texture>(() => undefined));
    const renderer = await ReactThreeTestRenderer.create(
      <CelestialBody
        radius={2}
        texture={texture}
        prefersSmallTexture={false}
        rotationPeriodSeconds={10}
        loadTexture={loadTexture}
      />,
    );
    expect((readMesh(renderer).material as MeshBasicMaterial).map).toBeNull();
  });

  it('applies the loaded full-size texture on large screens', async () => {
    const loaded = new Texture();
    const loadTexture = vi.fn(async () => loaded);
    const renderer = await ReactThreeTestRenderer.create(
      <CelestialBody
        radius={2}
        texture={texture}
        prefersSmallTexture={false}
        rotationPeriodSeconds={10}
        loadTexture={loadTexture}
      />,
    );
    await ReactThreeTestRenderer.act(async () => undefined);
    expect(loadTexture).toHaveBeenCalledWith('/full.webp');
    expect((readMesh(renderer).material as MeshBasicMaterial).map).toBe(loaded);
  });

  it('requests the small texture on small screens', async () => {
    const loadTexture = vi.fn(async () => new Texture());
    await ReactThreeTestRenderer.create(
      <CelestialBody
        radius={2}
        texture={texture}
        prefersSmallTexture
        rotationPeriodSeconds={10}
        loadTexture={loadTexture}
      />,
    );
    expect(loadTexture).toHaveBeenCalledWith('/small.webp');
  });

  it('keeps a visible solid sphere when the texture fails to load', async () => {
    const loadTexture = vi.fn(async () => {
      throw new Error('404');
    });
    const renderer = await ReactThreeTestRenderer.create(
      <CelestialBody
        radius={2}
        texture={texture}
        prefersSmallTexture={false}
        rotationPeriodSeconds={10}
        loadTexture={loadTexture}
      />,
    );
    await ReactThreeTestRenderer.act(async () => undefined);
    const material = readMesh(renderer).material as MeshBasicMaterial;
    expect(material.map).toBeNull();
    expect(material.color.r).toBeGreaterThan(material.color.b);
  });

  it('does not load anything for a body without texture', async () => {
    const loadTexture = vi.fn(async () => new Texture());
    await ReactThreeTestRenderer.create(
      <CelestialBody
        radius={2}
        texture={null}
        prefersSmallTexture={false}
        rotationPeriodSeconds={10}
        loadTexture={loadTexture}
      />,
    );
    expect(loadTexture).not.toHaveBeenCalled();
  });
});
