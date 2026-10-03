// Use case: a celestial body shows its texture, chosen by screen size, and must still show up as
// a warm sphere when the texture cannot load (404/offline). If the fallback failed, the Sun
// would be missing or black exactly when the network is flaky.
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Texture } from 'three';
import type { Mesh, MeshBasicMaterial } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { CelestialBody } from './CelestialBody';

const texture = { url: '/full.webp', smallUrl: '/small.webp' };

const defaultProps = {
  radius: 2,
  texture,
  prefersSmallTexture: false,
  rotationPeriodSeconds: 10,
  highlight: 'none',
  highlightEasingRate: 10,
  onHoverChange: () => undefined,
  onSelect: () => undefined,
} as const;

function readMesh(renderer: Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>) {
  return renderer.scene.children[0]!.instance as Mesh;
}

describe('CelestialBody', () => {
  it('renders the sphere immediately, before the texture arrives', async () => {
    const loadTexture = vi.fn(() => new Promise<Texture>(() => undefined));
    const renderer = await ReactThreeTestRenderer.create(
      <CelestialBody {...defaultProps} loadTexture={loadTexture} />,
    );
    expect((readMesh(renderer).material as MeshBasicMaterial).map).toBeNull();
  });

  it('applies the loaded full-size texture on large screens', async () => {
    const loaded = new Texture();
    const loadTexture = vi.fn(async () => loaded);
    const renderer = await ReactThreeTestRenderer.create(
      <CelestialBody {...defaultProps} loadTexture={loadTexture} />,
    );
    await ReactThreeTestRenderer.act(async () => undefined);
    expect(loadTexture).toHaveBeenCalledWith('/full.webp');
    expect((readMesh(renderer).material as MeshBasicMaterial).map).toBe(loaded);
  });

  it('requests the small texture on small screens', async () => {
    const loadTexture = vi.fn(async () => new Texture());
    await ReactThreeTestRenderer.create(
      <CelestialBody {...defaultProps} prefersSmallTexture loadTexture={loadTexture} />,
    );
    expect(loadTexture).toHaveBeenCalledWith('/small.webp');
  });

  it('keeps a visible solid sphere when the texture fails to load', async () => {
    const loadTexture = vi.fn(async () => {
      throw new Error('404');
    });
    const renderer = await ReactThreeTestRenderer.create(
      <CelestialBody {...defaultProps} loadTexture={loadTexture} />,
    );
    await ReactThreeTestRenderer.act(async () => undefined);
    const material = readMesh(renderer).material as MeshBasicMaterial;
    expect(material.map).toBeNull();
    expect(material.color.r).toBeGreaterThan(material.color.b);
  });

  it('does not load anything for a body without texture', async () => {
    const loadTexture = vi.fn(async () => new Texture());
    await ReactThreeTestRenderer.create(
      <CelestialBody {...defaultProps} texture={null} loadTexture={loadTexture} />,
    );
    expect(loadTexture).not.toHaveBeenCalled();
  });

  it('shows a focus ring only while focused', async () => {
    const unfocused = await ReactThreeTestRenderer.create(<CelestialBody {...defaultProps} />);
    expect(unfocused.scene.children).toHaveLength(1);
    const focused = await ReactThreeTestRenderer.create(
      <CelestialBody {...defaultProps} highlight="focused" />,
    );
    expect(focused.scene.children.length).toBeGreaterThan(1);
  });

  it('reports hover changes and shows a pointer cursor while hovered', async () => {
    const onHoverChange = vi.fn();
    const renderer = await ReactThreeTestRenderer.create(
      <CelestialBody {...defaultProps} onHoverChange={onHoverChange} />,
    );
    const sun = renderer.scene.children[0]!;
    await ReactThreeTestRenderer.act(async () => {
      await renderer.fireEvent(sun, 'pointerOver');
    });
    expect(onHoverChange).toHaveBeenLastCalledWith(true);
    expect(document.body.style.cursor).toBe('pointer');
    await ReactThreeTestRenderer.act(async () => {
      await renderer.fireEvent(sun, 'pointerOut');
    });
    expect(onHoverChange).toHaveBeenLastCalledWith(false);
    expect(document.body.style.cursor).toBe('auto');
  });

  it('forwards selection', async () => {
    const onSelect = vi.fn();
    const renderer = await ReactThreeTestRenderer.create(
      <CelestialBody {...defaultProps} onSelect={onSelect} />,
    );
    await renderer.fireEvent(renderer.scene.children[0]!, 'click', { delta: 0 });
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
