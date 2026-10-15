import ReactThreeTestRenderer from '@react-three/test-renderer';
import { useThree } from '@react-three/fiber';
import { describe, expect, it } from 'vitest';
import type { Camera } from 'three';
import type { DiveRequest } from '../../types';
import { CameraDive } from './CameraDive';

const BODY_POSITION: [number, number, number] = [4, 0, 0];
const START_POSITION: [number, number, number] = [0, 4, 9];
const RADIUS = 0.6;
const DURATION = 1;

function request(overrides: Partial<DiveRequest> = {}): DiveRequest {
  return { bodyId: 'venus', direction: 'in', nonce: 1, durationSeconds: DURATION, ...overrides };
}

async function setup(initial: DiveRequest | null = null, bodyPosition = BODY_POSITION) {
  const captured: { camera: Camera | null } = { camera: null };
  function Probe() {
    captured.camera = useThree((state) => state.camera);
    return null;
  }
  const element = (dive: DiveRequest | null, position = bodyPosition) => (
    <>
      <CameraDive dive={dive} bodyRadius={RADIUS} fieldOfViewDegrees={50} />
      <group name="body-venus" position={position} />
      <Probe />
    </>
  );
  const renderer = await ReactThreeTestRenderer.create(element(initial));
  captured.camera!.position.set(...START_POSITION);
  return { renderer, camera: captured.camera!, element };
}

function distanceToBody(camera: Camera, bodyPosition = BODY_POSITION) {
  const [bodyX, bodyY, bodyZ] = bodyPosition;
  return Math.hypot(
    camera.position.x - bodyX,
    camera.position.y - bodyY,
    camera.position.z - bodyZ,
  );
}

describe('CameraDive', () => {
  it('leaves the camera alone when there is no dive', async () => {
    const { renderer, camera } = await setup(null);
    await renderer.advanceFrames(10, 0.1);
    expect(camera.position.toArray()).toEqual(START_POSITION);
  });

  it('flies toward the planet while diving in, and ends close to it', async () => {
    const { renderer, camera, element } = await setup(null);
    const before = distanceToBody(camera);
    await renderer.update(element(request()));
    await renderer.advanceFrames(5, 0.1);
    const midway = distanceToBody(camera);
    expect(midway).toBeLessThan(before);
    await renderer.advanceFrames(20, 0.1);
    const after = distanceToBody(camera);
    expect(after).toBeLessThan(midway);
    expect(after).toBeLessThan(RADIUS * 3);
    expect(after).toBeGreaterThan(RADIUS);
  });

  it('stays where it ended once the dive is over', async () => {
    const { renderer, camera, element } = await setup(null);
    await renderer.update(element(request()));
    await renderer.advanceFrames(30, 0.1);
    const ended = camera.position.toArray();
    await renderer.advanceFrames(10, 0.1);
    expect(camera.position.toArray()).toEqual(ended);
  });

  it('comes back to where it started when diving out', async () => {
    const { renderer, camera, element } = await setup(null);
    await renderer.update(element(request()));
    await renderer.advanceFrames(30, 0.1);
    await renderer.update(element(request({ direction: 'out', nonce: 2 })));
    await renderer.advanceFrames(30, 0.1);
    expect(camera.position.x).toBeCloseTo(START_POSITION[0], 4);
    expect(camera.position.y).toBeCloseTo(START_POSITION[1], 4);
    expect(camera.position.z).toBeCloseTo(START_POSITION[2], 4);
  });

  it('does nothing when asked to come out without having gone in', async () => {
    const { renderer, camera, element } = await setup(null);
    await renderer.update(element(request({ direction: 'out' })));
    await renderer.advanceFrames(10, 0.1);
    expect(camera.position.toArray()).toEqual(START_POSITION);
  });

  it('ends in front of the planet where it is by then, not where it was', async () => {
    const { renderer, camera, element } = await setup(null);
    await renderer.update(element(request()));
    await renderer.advanceFrames(3, 0.1);
    const moved: [number, number, number] = [4, 0, -3];
    await renderer.update(element(request(), moved));
    await renderer.advanceFrames(30, 0.1);
    expect(distanceToBody(camera, moved)).toBeLessThan(RADIUS * 3);
    expect(distanceToBody(camera, BODY_POSITION)).toBeGreaterThan(RADIUS * 3);
  });

  it('does not move when the target planet is not in the scene', async () => {
    const { renderer, camera, element } = await setup(null);
    await renderer.update(element(request({ bodyId: 'ghost' })));
    await renderer.advanceFrames(10, 0.1);
    expect(camera.position.toArray()).toEqual(START_POSITION);
  });

  it('jumps to the end for a duration that is not usable', async () => {
    const { renderer, camera, element } = await setup(null);
    await renderer.update(element(request({ durationSeconds: 0 })));
    await renderer.advanceFrames(2, 0.016);
    expect(distanceToBody(camera)).toBeLessThan(RADIUS * 3);
  });
});
