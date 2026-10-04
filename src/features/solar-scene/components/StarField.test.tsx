// Use case: the visitor sees a starry background around the Sun. If the field stopped producing
// one point per requested star (or crashed with 0 stars on a degraded device) the sky would be
// empty or the whole scene would fail to mount.
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { describe, expect, it } from 'vitest';
import { Raycaster, Vector3 } from 'three';
import type { Points } from 'three';
import { StarField } from './StarField';

function isPoints(instance: unknown): instance is Points {
  return (instance as Partial<Points> | undefined)?.isPoints === true;
}

async function renderStarField(starCount: number): Promise<Points> {
  const renderer = await ReactThreeTestRenderer.create(<StarField starCount={starCount} />);
  const instance = renderer.scene.children[0]?.instance;
  if (!isPoints(instance)) throw new Error('StarField did not render Points');
  return instance;
}

describe('StarField', () => {
  it('renders one point per requested star', async () => {
    const points = await renderStarField(120);
    expect(points.type).toBe('Points');
    expect(points.geometry.getAttribute('position').count).toBe(120);
  });

  it('renders an empty field without crashing for zero stars', async () => {
    const points = await renderStarField(0);
    expect(points.geometry.getAttribute('position').count).toBe(0);
  });

  it('does not take part in pointer events (it must not steal clicks from the Sun)', async () => {
    const points = await renderStarField(50);
    const position = points.geometry.getAttribute('position');
    const target = new Vector3().fromBufferAttribute(position, 0);
    const raycaster = new Raycaster(new Vector3(0, 0, 0), target.clone().normalize());
    raycaster.params.Points = { threshold: 5 };
    expect(raycaster.intersectObject(points)).toHaveLength(0);
  });
});
