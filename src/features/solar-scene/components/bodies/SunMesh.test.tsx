import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Texture } from 'three';
import type { Mesh, ShaderMaterial } from 'three';
import { describe, expect, it } from 'vitest';
import { FULL_TURN_RADIANS } from '../../lib/rotation';
import { createFakeScene, inScene } from '../../test/in-scene';
import type { FakeScene } from '../../test/in-scene';
import { SunMesh } from './SunMesh';

type Props = React.ComponentProps<typeof SunMesh>;

const defaultProps: Props = {
  id: 'sun',
  radius: 2,
  texture: null,
  rotationPeriodSeconds: 10,
  isSurfaceAnimated: true,
};

async function renderSun(props: Partial<Props> = {}, scene: FakeScene = createFakeScene()) {
  const renderer = await ReactThreeTestRenderer.create(
    inScene(<SunMesh {...defaultProps} {...props} />, scene),
  );
  const mesh = renderer.scene.children[0]!.instance as Mesh;
  return { renderer, mesh, material: mesh.material as ShaderMaterial, scene };
}

describe('SunMesh', () => {
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

  it('applies the texture to the surface shader when provided', async () => {
    const texture = new Texture();
    const { renderer, material } = await renderSun({ texture });
    await renderer.advanceFrames(1, 0.016);
    expect(material.uniforms.uMap!.value).toBe(texture);
    expect(material.uniforms.uHasMap!.value).toBe(1);
  });

  it('falls back to a warm solid color when there is no texture', async () => {
    const { renderer, material } = await renderSun({ texture: null });
    await renderer.advanceFrames(1, 0.016);
    expect(material.uniforms.uHasMap!.value).toBe(0);
    const fallback = material.uniforms.uFallbackColor!.value as { r: number; g: number; b: number };
    expect(fallback.r).toBeGreaterThan(fallback.g);
    expect(fallback.g).toBeGreaterThan(fallback.b);
  });

  it('switches back to the fallback color if the texture goes away', async () => {
    const { renderer, material, scene } = await renderSun({ texture: new Texture() });
    await renderer.advanceFrames(1, 0.016);
    await renderer.update(inScene(<SunMesh {...defaultProps} texture={null} />, scene));
    await renderer.advanceFrames(1, 0.016);
    expect(material.uniforms.uHasMap!.value).toBe(0);
  });

  it('moves the plasma over time when the surface is animated', async () => {
    const { renderer, material } = await renderSun();
    await renderer.advanceFrames(10, 0.05);
    expect(material.uniforms.uTime!.value).toBeCloseTo(0.5, 5);
  });

  it('keeps the plasma still when the surface animation is off (reduced motion)', async () => {
    const { renderer, material } = await renderSun({ isSurfaceAnimated: false });
    await renderer.advanceFrames(10, 0.05);
    expect(material.uniforms.uTime!.value).toBe(0);
  });

  it.each(['hovered', 'focused', 'selected'] as const)(
    'grows slightly when %s and stays smooth, not exploding',
    async (highlight) => {
      const { renderer, mesh } = await renderSun(
        {},
        createFakeScene({ highlights: { sun: highlight } }),
      );
      await renderer.advanceFrames(120, 0.016);
      expect(mesh.scale.x).toBeGreaterThan(1.01);
      expect(mesh.scale.x).toBeLessThan(1.1);
    },
  );

  it('grows at once, without easing, with reduced motion', async () => {
    const scene = createFakeScene({ highlights: { sun: 'hovered' }, prefersReducedMotion: true });
    const { renderer, mesh } = await renderSun({}, scene);
    await renderer.advanceFrames(1, 0.016);
    const grownScale = mesh.scale.x;
    await renderer.advanceFrames(120, 0.016);
    expect(grownScale).toBeGreaterThan(1.01);
    expect(mesh.scale.x).toBe(grownScale);
  });

  it('returns to its natural scale when the highlight is removed', async () => {
    const { renderer, mesh } = await renderSun(
      {},
      createFakeScene({ highlights: { sun: 'hovered' } }),
    );
    await renderer.advanceFrames(120, 0.016);
    await renderer.update(inScene(<SunMesh {...defaultProps} />, createFakeScene()));
    await renderer.advanceFrames(240, 0.016);
    expect(mesh.scale.x).toBeCloseTo(1, 3);
  });

  it('ignores the highlight of another body', async () => {
    const { renderer, mesh } = await renderSun(
      {},
      createFakeScene({ highlights: { mercury: 'hovered' } }),
    );
    await renderer.advanceFrames(120, 0.016);
    expect(mesh.scale.x).toBe(1);
  });

  it('reports pointer over and out as hover of the sun', async () => {
    const { renderer, scene } = await renderSun();
    const sun = renderer.scene.children[0]!;
    await ReactThreeTestRenderer.act(async () => {
      await renderer.fireEvent(sun, 'pointerOver');
    });
    expect(scene.onHoverChange).toHaveBeenLastCalledWith('sun', true);
    await ReactThreeTestRenderer.act(async () => {
      await renderer.fireEvent(sun, 'pointerOut');
    });
    expect(scene.onHoverChange).toHaveBeenLastCalledWith('sun', false);
  });

  it('selects the sun on a click', async () => {
    const { renderer, scene } = await renderSun();
    await renderer.fireEvent(renderer.scene.children[0]!, 'click', { delta: 0 });
    expect(scene.onSelect).toHaveBeenCalledExactlyOnceWith('sun');
  });

  it('does not select when the click was really an orbit drag', async () => {
    const { renderer, scene } = await renderSun();
    await renderer.fireEvent(renderer.scene.children[0]!, 'click', { delta: 80 });
    expect(scene.onSelect).not.toHaveBeenCalled();
  });
});
