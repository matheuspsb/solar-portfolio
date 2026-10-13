import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Texture } from 'three';
import type { Group, Mesh, MeshLambertMaterial } from 'three';
import { describe, expect, it } from 'vitest';
import { createFakeScene, inScene } from '../../test/in-scene';
import type { FakeScene } from '../../test/in-scene';
import { PlanetMesh } from './PlanetMesh';

type Props = React.ComponentProps<typeof PlanetMesh>;

const defaultProps: Props = {
  id: 'mercury',
  radius: 0.55,
  texture: null,
  rotationPeriodSeconds: 10,
  isInteractive: true,
};

async function renderPlanet(props: Partial<Props> = {}, scene: FakeScene = createFakeScene()) {
  const renderer = await ReactThreeTestRenderer.create(
    inScene(<PlanetMesh {...defaultProps} {...props} />, scene),
  );
  const group = renderer.scene.children[0]!.instance as Group;
  const [visible, hitTarget] = group.children as [Mesh, Mesh];
  return {
    renderer,
    scene,
    visible,
    hitTarget,
    material: visible.material as MeshLambertMaterial,
    hitNode: renderer.scene.children[0]!.children[1]!,
  };
}

describe('PlanetMesh', () => {
  it('brightens its own texture when pointed at instead of washing it out with white', async () => {
    const texture = new Texture();
    const { material } = await renderPlanet(
      { texture },
      createFakeScene({ highlights: { mercury: 'hovered' } }),
    );
    expect(material.emissiveMap).toBe(texture);
  });

  it('shows the texture when it is available', async () => {
    const texture = new Texture();
    const { material } = await renderPlanet({ texture });
    expect(material.map).toBe(texture);
  });

  it('falls back to a visible solid color without texture', async () => {
    const { material } = await renderPlanet({ texture: null });
    expect(material.map).toBeNull();
    expect(material.color.getHex()).not.toBe(0x000000);
  });

  it.each(['hovered', 'focused', 'selected'] as const)(
    'grows slightly when %s',
    async (highlight) => {
      const { renderer, visible } = await renderPlanet(
        {},
        createFakeScene({ highlights: { mercury: highlight } }),
      );
      await renderer.advanceFrames(120, 0.016);
      expect(visible.scale.x).toBeGreaterThan(1.01);
      expect(visible.scale.x).toBeLessThan(1.2);
    },
  );

  it('selects its own body on click and reports hover on the click target', async () => {
    const { renderer, scene, hitNode } = await renderPlanet();
    await ReactThreeTestRenderer.act(async () => {
      await renderer.fireEvent(hitNode, 'pointerOver');
    });
    await renderer.fireEvent(hitNode, 'click', { delta: 0 });
    expect(scene.onHoverChange).toHaveBeenCalledExactlyOnceWith('mercury', true);
    expect(scene.onSelect).toHaveBeenCalledExactlyOnceWith('mercury');
  });

  it('has a click target larger than a tiny planet but invisible', async () => {
    const { hitTarget } = await renderPlanet({ radius: 0.2 });
    hitTarget.geometry.computeBoundingSphere();
    expect(hitTarget.geometry.boundingSphere!.radius).toBeGreaterThan(0.2);
    const material = hitTarget.material as { opacity: number; transparent: boolean };
    expect(material.transparent).toBe(true);
    expect(material.opacity).toBe(0);
  });

  it('never shrinks the click target below the planet itself', async () => {
    const { hitTarget } = await renderPlanet({ radius: 3 });
    hitTarget.geometry.computeBoundingSphere();
    expect(hitTarget.geometry.boundingSphere!.radius).toBeGreaterThanOrEqual(3);
  });

  it('offers nothing to point at or click when it is only scenery', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      inScene(<PlanetMesh {...defaultProps} id="venus" isInteractive={false} />),
    );
    const pointerTargets = renderer.scene.findAll(
      (node) => node.props.onClick !== undefined || node.props.onPointerOver !== undefined,
    );
    expect(pointerTargets).toHaveLength(0);
  });
});
