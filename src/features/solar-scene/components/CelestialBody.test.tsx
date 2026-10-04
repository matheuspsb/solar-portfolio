// Use case: a celestial body shows its texture, chosen by screen size, and must still show up as
// a warm sphere when the texture cannot load (404/offline). If the fallback failed, the Sun
// would be missing or black exactly when the network is flaky.
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Texture } from 'three';
import type { Group, Mesh, MeshLambertMaterial, ShaderMaterial } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { CelestialBody } from './CelestialBody';

const texture = { url: '/full.webp', smallUrl: '/small.webp' };

const defaultProps = {
  id: 'sun',
  kind: 'star',
  orbit: null,
  radius: 2,
  texture,
  prefersSmallTexture: false,
  rotationPeriodSeconds: 10,
  isAnimated: true,
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
    await renderer.advanceFrames(1, 0.016);
    expect((readMesh(renderer).material as ShaderMaterial).uniforms.uHasMap!.value).toBe(0);
  });

  it('applies the loaded full-size texture on large screens', async () => {
    const loaded = new Texture();
    const loadTexture = vi.fn(async () => loaded);
    const renderer = await ReactThreeTestRenderer.create(
      <CelestialBody {...defaultProps} loadTexture={loadTexture} />,
    );
    await ReactThreeTestRenderer.act(async () => undefined);
    expect(loadTexture).toHaveBeenCalledWith('/full.webp');
    await renderer.advanceFrames(1, 0.016);
    expect((readMesh(renderer).material as ShaderMaterial).uniforms.uMap!.value).toBe(loaded);
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
    await renderer.advanceFrames(1, 0.016);
    const material = readMesh(renderer).material as ShaderMaterial;
    const tint = material.uniforms.uFallbackColor!.value as { r: number; b: number };
    expect(material.uniforms.uHasMap!.value).toBe(0);
    expect(tint.r).toBeGreaterThan(tint.b);
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
    const unfocusedCount = unfocused.scene.children.length;
    const focused = await ReactThreeTestRenderer.create(
      <CelestialBody {...defaultProps} highlight="focused" />,
    );
    expect(focused.scene.children.length).toBe(unfocusedCount + 1);
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

  describe('planets', () => {
    const planetProps = {
      ...defaultProps,
      id: 'mercury',
      kind: 'planet',
      radius: 0.5,
      orbit: { radius: 5, periodSeconds: 10, phaseRadians: 0 },
    } as const;

    const readOrbitGroup = (renderer: Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>) =>
      renderer.scene.findAll((node) => node.type === 'Group' && node.children.length > 0)[0]!;

    it('draws the orbit path and places the planet on its orbit', async () => {
      const renderer = await ReactThreeTestRenderer.create(
        <CelestialBody {...planetProps} loadTexture={async () => new Texture()} />,
      );
      const rings = renderer.scene.findAll(
        (node) => node.type === 'Mesh' && node.instance.rotation.x < -1,
      );
      expect(rings).toHaveLength(1);
      const group = readOrbitGroup(renderer).instance as Group;
      expect(Math.hypot(group.position.x, group.position.z)).toBeCloseTo(5, 5);
    });

    it('keeps the planet on a lit (Lambert) material and loads its texture', async () => {
      const loaded = new Texture();
      const loadTexture = vi.fn(async () => loaded);
      const renderer = await ReactThreeTestRenderer.create(
        <CelestialBody {...planetProps} loadTexture={loadTexture} />,
      );
      await ReactThreeTestRenderer.act(async () => undefined);
      expect(loadTexture).toHaveBeenCalledWith('/full.webp');
      const planet = renderer.scene.findAll(
        (node) =>
          node.type === 'Mesh' && 'isMeshLambertMaterial' in (node.instance as Mesh).material,
      )[0]!;
      expect(((planet.instance as Mesh).material as MeshLambertMaterial).map).toBe(loaded);
    });

    it('moves along the orbit over time', async () => {
      const renderer = await ReactThreeTestRenderer.create(
        <CelestialBody {...planetProps} loadTexture={async () => new Texture()} />,
      );
      const group = readOrbitGroup(renderer).instance as Group;
      const before = group.position.clone();
      await renderer.advanceFrames(10, 0.1);
      expect(group.position.distanceTo(before)).toBeGreaterThan(0.5);
    });

    it('stays still on its orbit when rotation and motion are reduced', async () => {
      const renderer = await ReactThreeTestRenderer.create(
        <CelestialBody
          {...planetProps}
          rotationPeriodSeconds={null}
          isAnimated={false}
          loadTexture={async () => new Texture()}
        />,
      );
      const group = readOrbitGroup(renderer).instance as Group;
      const before = group.position.clone();
      await renderer.advanceFrames(10, 0.1);
      expect(group.position.distanceTo(before)).toBe(0);
    });

    it('shows a focus ring only while focused', async () => {
      const unfocused = await ReactThreeTestRenderer.create(
        <CelestialBody {...planetProps} loadTexture={async () => new Texture()} />,
      );
      const focused = await ReactThreeTestRenderer.create(
        <CelestialBody
          {...planetProps}
          highlight="focused"
          loadTexture={async () => new Texture()}
        />,
      );
      expect(readOrbitGroup(focused).children.length).toBe(
        readOrbitGroup(unfocused).children.length + 1,
      );
    });

    it('opens its section when the click target is clicked', async () => {
      const onSelect = vi.fn();
      const renderer = await ReactThreeTestRenderer.create(
        <CelestialBody
          {...planetProps}
          onSelect={onSelect}
          loadTexture={async () => new Texture()}
        />,
      );
      const isInvisibleHitTarget = (node: { type: string; instance: unknown }) => {
        if (node.type !== 'Mesh') return false;
        const material = (node.instance as Mesh).material as {
          transparent: boolean;
          opacity: number;
        };
        return material.transparent === true && material.opacity === 0;
      };
      const hitTarget = renderer.scene.findAll(isInvisibleHitTarget)[0]!;
      await renderer.fireEvent(hitTarget, 'click', { delta: 0 });
      expect(onSelect).toHaveBeenCalledOnce();
    });
  });
});
