import { Vector3 } from 'three';
import type { Camera } from 'three';
import type { ScreenFrame } from '@/lib/screen-frame';

const CAMERA_RIGHT_COLUMN = 0;

type ProjectSphereInput = {
  center: Vector3;
  radius: number;
  camera: Camera;
  width: number;
  height: number;
};

function toScreen(point: Vector3, width: number, height: number): { x: number; y: number } {
  return { x: ((point.x + 1) / 2) * width, y: ((1 - point.y) / 2) * height };
}

function isUsableSize(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function projectSphere({
  center,
  radius,
  camera,
  width,
  height,
}: ProjectSphereInput): ScreenFrame | null {
  if (!isUsableSize(radius) || !isUsableSize(width) || !isUsableSize(height)) return null;

  const projectedCenter = center.clone().project(camera);
  const isInFrontOfCamera = projectedCenter.z > -1 && projectedCenter.z < 1;
  if (!isInFrontOfCamera) return null;

  const cameraRight = new Vector3().setFromMatrixColumn(camera.matrixWorld, CAMERA_RIGHT_COLUMN);
  const projectedEdge = center
    .clone()
    .addScaledVector(cameraRight.normalize(), radius)
    .project(camera);

  const screenCenter = toScreen(projectedCenter, width, height);
  const screenEdge = toScreen(projectedEdge, width, height);
  return {
    ...screenCenter,
    radius: Math.hypot(screenEdge.x - screenCenter.x, screenEdge.y - screenCenter.y),
  };
}
