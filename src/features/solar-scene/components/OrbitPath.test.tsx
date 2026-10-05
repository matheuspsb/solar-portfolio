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
  it('is not hit by pointer rays', async () => {
    const ring = await renderPath(4.6);
    ring.updateWorldMatrix(true, false);
    const raycaster = new Raycaster(new Vector3(4.6, 5, 0), new Vector3(0, -1, 0));
    expect(raycaster.intersectObject(ring)).toHaveLength(0);
  });
});
