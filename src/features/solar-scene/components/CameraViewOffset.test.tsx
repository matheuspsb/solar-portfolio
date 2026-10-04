// Use case: when the content panel opens on desktop the Sun glides to the left so it stays fully
// visible next to the panel, and glides back when it closes. With reduced motion it jumps
// instantly. A stuck or NaN offset would leave the Sun off-center (or blank the scene).
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { useThree } from '@react-three/fiber';
import { describe, expect, it } from 'vitest';
import type { PerspectiveCamera } from 'three';
import { CameraViewOffset } from './CameraViewOffset';

function setup(offsetPixels: number, easingRate = 8) {
  const captured: { camera: PerspectiveCamera | null } = { camera: null };
  function Probe() {
    captured.camera = useThree((state) => state.camera) as PerspectiveCamera;
    return null;
  }
  const element = (nextOffset: number, nextRate = easingRate) => (
    <>
      <CameraViewOffset targetOffsetPixels={nextOffset} easingRate={nextRate} />
      <Probe />
    </>
  );
  return { captured, element, initial: element(offsetPixels) };
}

describe('CameraViewOffset', () => {
  it('leaves the camera without a view offset when the target is zero', async () => {
    const { captured, initial } = setup(0);
    const renderer = await ReactThreeTestRenderer.create(initial);
    await renderer.advanceFrames(5, 0.016);
    expect(captured.camera!.view?.enabled ?? false).toBe(false);
  });

  it('eases toward the target offset without overshooting', async () => {
    const { captured, initial } = setup(200);
    const renderer = await ReactThreeTestRenderer.create(initial);
    await renderer.advanceFrames(3, 0.016);
    const offsetX = captured.camera!.view!.offsetX;
    expect(offsetX).toBeGreaterThan(0);
    expect(offsetX).toBeLessThan(200);
    await renderer.advanceFrames(200, 0.016);
    expect(captured.camera!.view!.offsetX).toBeCloseTo(200, 0);
  });

  it('jumps straight to the target with an infinite rate (reduced motion)', async () => {
    const { captured, initial } = setup(200, Number.POSITIVE_INFINITY);
    const renderer = await ReactThreeTestRenderer.create(initial);
    await renderer.advanceFrames(1, 0.016);
    expect(captured.camera!.view!.offsetX).toBe(200);
  });

  it('returns to centered and clears the view offset when the target goes back to zero', async () => {
    const { captured, element, initial } = setup(200, Number.POSITIVE_INFINITY);
    const renderer = await ReactThreeTestRenderer.create(initial);
    await renderer.advanceFrames(1, 0.016);
    await renderer.update(element(0, Number.POSITIVE_INFINITY));
    await renderer.advanceFrames(2, 0.016);
    expect(captured.camera!.view?.enabled ?? false).toBe(false);
  });

  it('keeps the full viewport size when applying the offset', async () => {
    const { captured, initial } = setup(120, Number.POSITIVE_INFINITY);
    const renderer = await ReactThreeTestRenderer.create(initial);
    await renderer.advanceFrames(1, 0.016);
    const { view } = captured.camera!;
    expect(view!.fullWidth).toBe(view!.width);
    expect(view!.fullHeight).toBe(view!.height);
    expect(view!.offsetY).toBe(0);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    'ignores an invalid target offset %s',
    async (invalid) => {
      const { captured, initial } = setup(invalid);
      const renderer = await ReactThreeTestRenderer.create(initial);
      await renderer.advanceFrames(5, 0.016);
      expect(captured.camera!.view?.enabled ?? false).toBe(false);
    },
  );

  it('survives a zero delta frame', async () => {
    const { captured, initial } = setup(200);
    const renderer = await ReactThreeTestRenderer.create(initial);
    await renderer.advanceFrames(1, 0);
    expect(captured.camera!.view === null || Number.isFinite(captured.camera!.view.offsetX)).toBe(
      true,
    );
  });
});
