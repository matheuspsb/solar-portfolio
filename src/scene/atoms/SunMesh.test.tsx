// Use case: the visitor sees a textured, slowly rotating Sun. If the rotation ignored the delta
// time it would spin at monitor-refresh speed; if reduced motion still rotated it, motion-sensitive
// visitors would be affected; if a missing texture left no material color the Sun would turn black.
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Texture } from 'three';
import type { Mesh, MeshBasicMaterial } from 'three';
import { describe, expect, it } from 'vitest';
import { FULL_TURN_RADIANS } from '@/lib/rotation';
import { SunMesh } from './SunMesh';

async function renderSun(props: Partial<React.ComponentProps<typeof SunMesh>> = {}) {
  const renderer = await ReactThreeTestRenderer.create(
    <SunMesh radius={2} texture={null} rotationPeriodSeconds={10} {...props} />,
  );
  const mesh = renderer.scene.children[0]!.instance as Mesh;
  return { renderer, mesh, material: mesh.material as MeshBasicMaterial };
}

describe('SunMesh', () => {
  it('has the requested radius', async () => {
    const { mesh } = await renderSun({ radius: 3 });
    mesh.geometry.computeBoundingSphere();
    expect(mesh.geometry.boundingSphere?.radius).toBeCloseTo(3);
  });

  it('rotates proportionally to frame delta', async () => {
    const { renderer, mesh } = await renderSun({ rotationPeriodSeconds: 1 });
    await renderer.advanceFrames(1, 0.05);
    expect(mesh.rotation.y).toBeCloseTo(FULL_TURN_RADIANS * 0.05, 3);
  });

  it('does not rotate when the period is null (reduced motion)', async () => {
    const { renderer, mesh } = await renderSun({ rotationPeriodSeconds: null });
    await renderer.advanceFrames(5, 0.05);
    expect(mesh.rotation.y).toBe(0);
  });

  it('survives a zero delta frame without changing rotation', async () => {
    const { renderer, mesh } = await renderSun();
    await renderer.advanceFrames(1, 0);
    expect(mesh.rotation.y).toBe(0);
  });

  it('applies the texture map when provided', async () => {
    const texture = new Texture();
    const { material } = await renderSun({ texture });
    expect(material.map).toBe(texture);
  });

  it('falls back to a warm solid color when there is no texture', async () => {
    const { material } = await renderSun({ texture: null });
    expect(material.map).toBeNull();
    expect(material.color.r).toBeGreaterThan(material.color.b);
  });
});
