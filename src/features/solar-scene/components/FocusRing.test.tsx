import ReactThreeTestRenderer from '@react-three/test-renderer';
import { describe, expect, it } from 'vitest';
import { Raycaster, Vector3 } from 'three';
import type { Mesh, RingGeometry } from 'three';
import { FocusRing } from './FocusRing';

async function findRing(bodyRadius: number) {
  const renderer = await ReactThreeTestRenderer.create(<FocusRing bodyRadius={bodyRadius} />);
  const meshes = renderer.scene.findAll((node) => node.type === 'Mesh');
  return meshes[0]!.instance as Mesh<RingGeometry>;
}

describe('FocusRing', () => {
  it('encircles the body: its inner radius is larger than the body radius', async () => {
    const ring = await findRing(2);
    expect(ring.geometry.parameters.innerRadius).toBeGreaterThan(2);
  });

  it('scales with the body radius', async () => {
    const small = await findRing(1);
    const large = await findRing(4);
    expect(large.geometry.parameters.innerRadius).toBeGreaterThan(
      small.geometry.parameters.innerRadius,
    );
  });

  it('is not hit by pointer rays (clicks go to the body)', async () => {
    const ring = await findRing(2);
    ring.updateWorldMatrix(true, false);
    const innerRadius = ring.geometry.parameters.innerRadius;
    const raycaster = new Raycaster(new Vector3(innerRadius + 0.05, 0, 10), new Vector3(0, 0, -1));
    expect(raycaster.intersectObject(ring)).toHaveLength(0);
  });
});
