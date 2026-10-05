import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Raycaster, Vector3 } from 'three';
import type { Mesh, ShaderMaterial, SphereGeometry } from 'three';
import { describe, expect, it } from 'vitest';
import { MAX_FRAME_DELTA_SECONDS } from '../lib/rotation';
import { SunCorona } from './SunCorona';

async function renderCorona(props: Partial<React.ComponentProps<typeof SunCorona>> = {}) {
  const renderer = await ReactThreeTestRenderer.create(
    <SunCorona radius={2} isAnimated {...props} />,
  );
  const mesh = renderer.scene.children[0]!.instance as Mesh<SphereGeometry, ShaderMaterial>;
  return { renderer, mesh, material: mesh.material };
}

describe('SunCorona', () => {
  it('is larger than the body it surrounds', async () => {
    const { mesh } = await renderCorona({ radius: 3 });
    expect(mesh.geometry.parameters.radius).toBeGreaterThan(3);
  });

  it('is not hit by pointer rays', async () => {
    const { mesh } = await renderCorona();
    mesh.updateWorldMatrix(true, false);
    const raycaster = new Raycaster(new Vector3(0, 0, 10), new Vector3(0, 0, -1));
    expect(raycaster.intersectObject(mesh)).toHaveLength(0);
  });

  it('flickers over time when animated', async () => {
    const { renderer, material } = await renderCorona();
    await renderer.advanceFrames(10, 0.05);
    expect(material.uniforms.uTime!.value).toBeCloseTo(0.5, 5);
  });

  it('stays still when not animated (reduced motion)', async () => {
    const { renderer, material } = await renderCorona({ isAnimated: false });
    await renderer.advanceFrames(10, 0.05);
    expect(material.uniforms.uTime!.value).toBe(0);
  });

  it('does not jump after a huge delta', async () => {
    const { renderer, material } = await renderCorona();
    await renderer.advanceFrames(1, 900);
    expect(material.uniforms.uTime!.value).toBeCloseTo(MAX_FRAME_DELTA_SECONDS, 5);
  });
});
