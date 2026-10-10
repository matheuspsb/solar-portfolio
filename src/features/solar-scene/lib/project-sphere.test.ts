import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { projectSphere } from './project-sphere';

const SIZE = { width: 800, height: 500 };

function buildCamera(position: [number, number, number] = [0, 0, 10]) {
  const camera = new PerspectiveCamera(50, SIZE.width / SIZE.height, 0.1, 400);
  camera.position.set(...position);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return camera;
}

describe('projectSphere', () => {
  it('measures the radius in screen pixels: half the height covers tan(fov/2) * distance', () => {
    const frame = projectSphere({
      center: new Vector3(0, 0, 0),
      radius: 1,
      camera: buildCamera(),
      ...SIZE,
    });
    const halfViewHeight = Math.tan((50 / 2) * (Math.PI / 180)) * 10;
    expect(frame?.radius).toBeCloseTo(250 / halfViewHeight, 1);
  });

  it('moves a body that is to the right of the origin to the right of the screen, and a higher one up', () => {
    const frame = projectSphere({
      center: new Vector3(2, 1, 0),
      radius: 1,
      camera: buildCamera(),
      ...SIZE,
    });
    expect(frame!.x).toBeGreaterThan(400);
    expect(frame!.y).toBeLessThan(250);
  });

  it('has no frame for a body behind the camera', () => {
    const frame = projectSphere({
      center: new Vector3(0, 0, 20),
      radius: 1,
      camera: buildCamera(),
      ...SIZE,
    });
    expect(frame).toBeNull();
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'has no frame for the radius %s',
    (radius) => {
      const frame = projectSphere({
        center: new Vector3(0, 0, 0),
        radius,
        camera: buildCamera(),
        ...SIZE,
      });
      expect(frame).toBeNull();
    },
  );

  it.each([
    [0, 500],
    [800, 0],
    [Number.NaN, 500],
  ])('has no frame for an unmeasured screen (%s x %s)', (width, height) => {
    const frame = projectSphere({
      center: new Vector3(0, 0, 0),
      radius: 1,
      camera: buildCamera(),
      width,
      height,
    });
    expect(frame).toBeNull();
  });
});
