import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Texture } from 'three';
import type { Group, Mesh, MeshLambertMaterial } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { FULL_TURN_RADIANS } from '../lib/rotation';
import { PlanetMesh } from './PlanetMesh';

type Props = React.ComponentProps<typeof PlanetMesh>;

async function renderPlanet(props: Partial<Props> = {}) {
  const renderer = await ReactThreeTestRenderer.create(
    <PlanetMesh
      radius={0.55}
      texture={null}
      rotationPeriodSeconds={10}
      highlight="none"
      highlightEasingRate={10}
      onPointerOver={() => undefined}
      onPointerOut={() => undefined}
      onSelect={() => undefined}
      {...props}
    />,
  );
  const group = renderer.scene.children[0]!.instance as Group;
  const [visible, hitTarget] = group.children as [Mesh, Mesh];
  return {
    renderer,
    visible,
    hitTarget,
    material: visible.material as MeshLambertMaterial,
    hitNode: renderer.scene.children[0]!.children[1]!,
  };
}

describe('PlanetMesh', () => {
  it('rotates proportionally to frame delta', async () => {
    const { renderer, visible } = await renderPlanet({ rotationPeriodSeconds: 1 });
    await renderer.advanceFrames(1, 0.05);
    expect(visible.rotation.y).toBeCloseTo(FULL_TURN_RADIANS * 0.05, 3);
  });

  it('does not rotate when the period is null (reduced motion)', async () => {
    const { renderer, visible } = await renderPlanet({ rotationPeriodSeconds: null });
    await renderer.advanceFrames(5, 0.05);
    expect(visible.rotation.y).toBe(0);
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
      const { renderer, visible } = await renderPlanet({ highlight });
      await renderer.advanceFrames(120, 0.016);
      expect(visible.scale.x).toBeGreaterThan(1.01);
      expect(visible.scale.x).toBeLessThan(1.2);
    },
  );

  it('selects on click and reports hover on the click target', async () => {
    const onSelect = vi.fn();
    const onPointerOver = vi.fn();
    const { renderer, hitNode } = await renderPlanet({ onSelect, onPointerOver });
    await renderer.fireEvent(hitNode, 'pointerOver');
    await renderer.fireEvent(hitNode, 'click', { delta: 0 });
    expect(onPointerOver).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('ignores a click that was really an orbit drag', async () => {
    const onSelect = vi.fn();
    const { renderer, hitNode } = await renderPlanet({ onSelect });
    await renderer.fireEvent(hitNode, 'click', { delta: 80 });
    expect(onSelect).not.toHaveBeenCalled();
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
});
