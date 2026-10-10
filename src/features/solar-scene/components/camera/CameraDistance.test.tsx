import ReactThreeTestRenderer from '@react-three/test-renderer';
import { useThree } from '@react-three/fiber';
import { describe, expect, it } from 'vitest';
import type { Camera } from 'three';
import { CameraDistance } from './CameraDistance';

function setup(distance: number) {
  const captured: { camera: Camera | null } = { camera: null };
  function Probe() {
    captured.camera = useThree((state) => state.camera);
    return null;
  }
  const element = (nextDistance: number) => (
    <>
      <CameraDistance distance={nextDistance} />
      <Probe />
    </>
  );
  return { captured, element, initial: element(distance) };
}

describe('CameraDistance', () => {
  it('places the camera at the requested distance from the origin', async () => {
    const { captured, initial } = setup(12);
    await ReactThreeTestRenderer.create(initial);
    expect(captured.camera!.position.length()).toBeCloseTo(12, 5);
  });

  it('keeps the viewing direction when the distance changes', async () => {
    const { captured, element, initial } = setup(10);
    const renderer = await ReactThreeTestRenderer.create(initial);
    captured.camera!.position.set(0, 3, 4);
    await renderer.update(element(20));
    const { x, y, z } = captured.camera!.position;
    expect(x).toBeCloseTo(0, 5);
    expect(y).toBeCloseTo(12, 5);
    expect(z).toBeCloseTo(16, 5);
  });

  it.each([0, -4, Number.NaN, Number.POSITIVE_INFINITY])(
    'leaves the camera untouched for invalid distance %s',
    async (distance) => {
      const { captured, element, initial } = setup(10);
      const renderer = await ReactThreeTestRenderer.create(initial);
      const before = captured.camera!.position.clone();
      await renderer.update(element(distance));
      expect(captured.camera!.position.toArray()).toEqual(before.toArray());
    },
  );

  it('handles a camera sitting exactly at the origin without producing NaN', async () => {
    const { captured, element, initial } = setup(10);
    const renderer = await ReactThreeTestRenderer.create(initial);
    captured.camera!.position.set(0, 0, 0);
    await renderer.update(element(15));
    expect(captured.camera!.position.toArray().every(Number.isFinite)).toBe(true);
  });
});
