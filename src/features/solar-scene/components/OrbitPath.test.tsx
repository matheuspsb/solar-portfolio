// Use case: a faint ring on the floor of the scene shows where a planet travels, so the visitor
// reads the layout as a solar system. It is only a guide: it must lie flat, match the orbit and
// never intercept clicks meant for the Sun or the planet.
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Raycaster, Vector3 } from 'three';
import type { Mesh, RingGeometry } from 'three';
import { describe, expect, it } from 'vitest';
import { OrbitPath } from './OrbitPath';

async function renderPath(radius: number) {
  const renderer = await ReactThreeTestRenderer.create(<OrbitPath radius={radius} />);
  return renderer.scene.children[0]!.instance as Mesh<RingGeometry>;
}

describe('OrbitPath', () => {
  it('is a thin ring centered on the orbit radius', async () => {
    const ring = await renderPath(4.6);
    const { innerRadius, outerRadius } = ring.geometry.parameters;
    expect(innerRadius).toBeLessThan(4.6);
    expect(outerRadius).toBeGreaterThan(4.6);
    expect(outerRadius - innerRadius).toBeLessThan(0.2);
  });

  it('lies flat in the horizontal plane', async () => {
    const ring = await renderPath(4.6);
    expect(ring.rotation.x).toBeCloseTo(-Math.PI / 2);
  });

  it('is not hit by pointer rays', async () => {
    const ring = await renderPath(4.6);
    ring.updateWorldMatrix(true, false);
    const raycaster = new Raycaster(new Vector3(4.6, 5, 0), new Vector3(0, -1, 0));
    expect(raycaster.intersectObject(ring)).toHaveLength(0);
  });
});
