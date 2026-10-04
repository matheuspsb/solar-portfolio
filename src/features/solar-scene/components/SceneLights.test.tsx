// Use case: planets added later are lit by the Sun. The lights must exist and the point light
// must sit at the Sun's position (origin), otherwise future bodies would be lit from the wrong side.
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { expect, it } from 'vitest';
import { SceneLights } from './SceneLights';

it('provides a faint ambient light and a point light at the origin', async () => {
  const renderer = await ReactThreeTestRenderer.create(<SceneLights />);
  const types = renderer.scene.children.map((child) => child.type);
  expect(types).toContain('AmbientLight');
  const pointLight = renderer.scene.children.find((child) => child.type === 'PointLight');
  expect(pointLight).toBeDefined();
  expect(pointLight?.instance.position.toArray()).toEqual([0, 0, 0]);
});
