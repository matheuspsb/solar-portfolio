import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Texture } from 'three';
import type { Group, Mesh, MeshLambertMaterial, ShaderMaterial } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { createFakeScene, inScene } from '../../test/in-scene';
import type { FakeScene } from '../../test/in-scene';
import { CelestialBody } from './CelestialBody';

type Props = React.ComponentProps<typeof CelestialBody>;
type Renderer = Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>;

const texture = { url: '/full.webp', smallUrl: '/small.webp' };

const defaultProps: Props = {
  id: 'sun',
  kind: 'star',
  orbit: null,
  radius: 2,
  texture,
  prefersSmallTexture: false,
  rotationPeriodSeconds: 10,
  isInteractive: true,
};

function renderBody(props: Partial<Props> = {}, scene: FakeScene = createFakeScene()) {
  return ReactThreeTestRenderer.create(
    inScene(<CelestialBody {...defaultProps} {...props} />, scene),
  );
}

function readMesh(renderer: Renderer) {
  return renderer.scene.children[0]!.instance as Mesh;
}

const countFocusRings = (renderer: Renderer) =>
  renderer.scene.findAll(
    (node) => node.type === 'Mesh' && (node.instance as Mesh).geometry.type === 'RingGeometry',
  ).length;

const neverLoads = () => new Promise<Texture>(() => undefined);

describe('CelestialBody', () => {
  it('renders the sphere immediately, before the texture arrives', async () => {
    const renderer = await renderBody({ loadTexture: neverLoads });
    await renderer.advanceFrames(1, 0.016);
    expect((readMesh(renderer).material as ShaderMaterial).uniforms.uHasMap!.value).toBe(0);
  });

  it('applies the loaded full-size texture on large screens', async () => {
    const loaded = new Texture();
    const loadTexture = vi.fn(async () => loaded);
    const renderer = await renderBody({ loadTexture });
    await ReactThreeTestRenderer.act(async () => undefined);
    expect(loadTexture).toHaveBeenCalledWith('/full.webp');
    await renderer.advanceFrames(1, 0.016);
    expect((readMesh(renderer).material as ShaderMaterial).uniforms.uMap!.value).toBe(loaded);
  });

  it('requests the small texture on small screens', async () => {
    const loadTexture = vi.fn(async () => new Texture());
    await renderBody({ prefersSmallTexture: true, loadTexture });
    expect(loadTexture).toHaveBeenCalledWith('/small.webp');
  });

  it('tells the scene it is ready once its texture has loaded, not before', async () => {
    const onSettled = vi.fn();
    let finishLoading: (loaded: Texture) => void = () => undefined;
    const loadTexture = vi.fn(
      () =>
        new Promise<Texture>((resolve) => {
          finishLoading = resolve;
        }),
    );
    await renderBody({ onSettled, loadTexture });
    expect(onSettled).not.toHaveBeenCalled();
    await ReactThreeTestRenderer.act(async () => finishLoading(new Texture()));
    expect(onSettled).toHaveBeenCalledWith('sun');
  });

  it('tells the scene it is ready even when the texture fails, so the scene does not wait forever', async () => {
    const onSettled = vi.fn();
    const loadTexture = vi.fn(async () => {
      throw new Error('404');
    });
    await renderBody({ onSettled, loadTexture });
    await ReactThreeTestRenderer.act(async () => undefined);
    expect(onSettled).toHaveBeenCalledWith('sun');
  });

  it('is ready at once when it has no texture to wait for', async () => {
    const onSettled = vi.fn();
    await renderBody({ texture: null, onSettled });
    expect(onSettled).toHaveBeenCalledWith('sun');
  });

  it('keeps a visible solid sphere when the texture fails to load', async () => {
    const loadTexture = vi.fn(async () => {
      throw new Error('404');
    });
    const renderer = await renderBody({ loadTexture });
    await ReactThreeTestRenderer.act(async () => undefined);
    await renderer.advanceFrames(1, 0.016);
    const material = readMesh(renderer).material as ShaderMaterial;
    const tint = material.uniforms.uFallbackColor!.value as { r: number; b: number };
    expect(material.uniforms.uHasMap!.value).toBe(0);
    expect(tint.r).toBeGreaterThan(tint.b);
  });

  it('does not load anything for a body without texture', async () => {
    const loadTexture = vi.fn(async () => new Texture());
    await renderBody({ texture: null, loadTexture });
    expect(loadTexture).not.toHaveBeenCalled();
  });

  it('reports hover changes of its own body and shows a pointer cursor while hovered', async () => {
    const scene = createFakeScene();
    const renderer = await renderBody({ loadTexture: neverLoads }, scene);
    const sun = renderer.scene.children[0]!;
    await ReactThreeTestRenderer.act(async () => {
      await renderer.fireEvent(sun, 'pointerOver');
    });
    expect(scene.onHoverChange).toHaveBeenLastCalledWith('sun', true);
    expect(document.body.style.cursor).toBe('pointer');
    await ReactThreeTestRenderer.act(async () => {
      await renderer.fireEvent(sun, 'pointerOut');
    });
    expect(scene.onHoverChange).toHaveBeenLastCalledWith('sun', false);
    expect(document.body.style.cursor).toBe('auto');
  });

  it('draws the focus ring only while its own body has keyboard focus', async () => {
    const focusedSun = await renderBody(
      { loadTexture: neverLoads },
      createFakeScene({ highlights: { sun: 'focused' } }),
    );
    const focusedElsewhere = await renderBody(
      { loadTexture: neverLoads },
      createFakeScene({ highlights: { mercury: 'focused', sun: 'hovered' } }),
    );
    expect(countFocusRings(focusedSun)).toBe(1);
    expect(countFocusRings(focusedElsewhere)).toBe(0);
  });

  it('keeps the sun surface still with reduced motion', async () => {
    const renderer = await renderBody(
      { loadTexture: neverLoads },
      createFakeScene({ prefersReducedMotion: true }),
    );
    await renderer.advanceFrames(10, 0.1);
    const material = readMesh(renderer).material as ShaderMaterial;
    expect(readMesh(renderer).rotation.y).toBe(0);
    expect(material.uniforms.uTime!.value).toBe(0);
  });

  describe('planets', () => {
    const planetProps: Partial<Props> = {
      id: 'mercury',
      kind: 'planet',
      radius: 0.5,
      orbit: { radius: 5, periodSeconds: 10, phaseRadians: 0 },
      loadTexture: async () => new Texture(),
    };

    const readOrbitGroup = (renderer: Renderer) =>
      renderer.scene.findAll((node) => node.type === 'Group' && node.children.length > 0)[0]!;

    it('draws the orbit path and places the planet on its orbit', async () => {
      const renderer = await renderBody(planetProps);
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
      const renderer = await renderBody({ ...planetProps, loadTexture });
      await ReactThreeTestRenderer.act(async () => undefined);
      expect(loadTexture).toHaveBeenCalledWith('/full.webp');
      const planet = renderer.scene.findAll(
        (node) =>
          node.type === 'Mesh' && 'isMeshLambertMaterial' in (node.instance as Mesh).material,
      )[0]!;
      expect(((planet.instance as Mesh).material as MeshLambertMaterial).map).toBe(loaded);
    });

    it('moves along the orbit over time', async () => {
      const renderer = await renderBody(planetProps);
      const group = readOrbitGroup(renderer).instance as Group;
      const before = group.position.clone();
      await renderer.advanceFrames(10, 0.1);
      expect(group.position.distanceTo(before)).toBeGreaterThan(0.5);
    });

    it('stays still on its orbit with reduced motion', async () => {
      const renderer = await renderBody(
        planetProps,
        createFakeScene({ prefersReducedMotion: true }),
      );
      const group = readOrbitGroup(renderer).instance as Group;
      const before = group.position.clone();
      await renderer.advanceFrames(10, 0.1);
      expect(group.position.distanceTo(before)).toBe(0);
    });

    it('opens its own section when the click target is clicked', async () => {
      const scene = createFakeScene();
      const renderer = await renderBody(planetProps, scene);
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
      expect(scene.onSelect).toHaveBeenCalledExactlyOnceWith('mercury');
    });
  });
});
