import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Texture } from 'three';
import type { Mesh, ShaderMaterial } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { FULL_TURN_RADIANS, MAX_FRAME_DELTA_SECONDS } from '../lib/rotation';
import { SunMesh } from './SunMesh';

async function renderSun(props: Partial<React.ComponentProps<typeof SunMesh>> = {}) {
  const renderer = await ReactThreeTestRenderer.create(
    <SunMesh
      name="body-test"
      radius={2}
      texture={null}
      rotationPeriodSeconds={10}
      isSurfaceAnimated
      highlight="none"
      highlightEasingRate={10}
      onPointerOver={() => undefined}
      onPointerOut={() => undefined}
      onSelect={() => undefined}
      {...props}
    />,
  );
  const mesh = renderer.scene.children[0]!.instance as Mesh;
  return { renderer, mesh, material: mesh.material as ShaderMaterial };
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

  it('survives a zero delta frame without changing rotation', async () => {
    const { renderer, mesh } = await renderSun();
    await renderer.advanceFrames(1, 0);
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
    const { renderer, material } = await renderSun({ texture: new Texture() });
    await renderer.advanceFrames(1, 0.016);
    await renderer.update(
      <SunMesh
        name="body-test"
        radius={2}
        texture={null}
        rotationPeriodSeconds={10}
        isSurfaceAnimated
        highlight="none"
        highlightEasingRate={10}
        onPointerOver={() => undefined}
        onPointerOut={() => undefined}
        onSelect={() => undefined}
      />,
    );
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

  it('does not jump the plasma after a huge delta (tab resumed)', async () => {
    const { renderer, material } = await renderSun();
    await renderer.advanceFrames(1, 900);
    expect(material.uniforms.uTime!.value).toBeCloseTo(MAX_FRAME_DELTA_SECONDS, 5);
  });

  it('stays at its natural scale with no highlight', async () => {
    const { renderer, mesh } = await renderSun({ highlight: 'none' });
    await renderer.advanceFrames(10, 0.016);
    expect(mesh.scale.x).toBeCloseTo(1, 5);
  });

  it.each(['hovered', 'focused', 'selected'] as const)(
    'grows slightly when %s and stays smooth, not exploding',
    async (highlight) => {
      const { renderer, mesh } = await renderSun({ highlight });
      await renderer.advanceFrames(120, 0.016);
      expect(mesh.scale.x).toBeGreaterThan(1.01);
      expect(mesh.scale.x).toBeLessThan(1.1);
    },
  );

  it('returns to its natural scale when the highlight is removed', async () => {
    const { renderer, mesh } = await renderSun({ highlight: 'hovered' });
    await renderer.advanceFrames(120, 0.016);
    await renderer.update(
      <SunMesh
        name="body-test"
        radius={2}
        texture={null}
        rotationPeriodSeconds={10}
        isSurfaceAnimated
        highlight="none"
        highlightEasingRate={10}
        onPointerOver={() => undefined}
        onPointerOut={() => undefined}
        onSelect={() => undefined}
      />,
    );
    await renderer.advanceFrames(240, 0.016);
    expect(mesh.scale.x).toBeCloseTo(1, 3);
  });

  it('applies the highlight instantly with an infinite easing rate (reduced motion)', async () => {
    const { renderer, mesh } = await renderSun({
      highlight: 'selected',
      highlightEasingRate: Number.POSITIVE_INFINITY,
    });
    await renderer.advanceFrames(1, 0.016);
    expect(mesh.scale.x).toBeGreaterThan(1.01);
  });

  it('notifies pointer over and out', async () => {
    const onPointerOver = vi.fn();
    const onPointerOut = vi.fn();
    const { renderer } = await renderSun({ onPointerOver, onPointerOut });
    const sun = renderer.scene.children[0]!;
    await renderer.fireEvent(sun, 'pointerOver');
    await renderer.fireEvent(sun, 'pointerOut');
    expect(onPointerOver).toHaveBeenCalledOnce();
    expect(onPointerOut).toHaveBeenCalledOnce();
  });

  it('selects on a click', async () => {
    const onSelect = vi.fn();
    const { renderer } = await renderSun({ onSelect });
    await renderer.fireEvent(renderer.scene.children[0]!, 'click', { delta: 0 });
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('does not select when the click was really an orbit drag', async () => {
    const onSelect = vi.fn();
    const { renderer } = await renderSun({ onSelect });
    await renderer.fireEvent(renderer.scene.children[0]!, 'click', { delta: 80 });
    expect(onSelect).not.toHaveBeenCalled();
  });
});
