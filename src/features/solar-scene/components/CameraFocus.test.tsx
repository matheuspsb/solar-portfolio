// Use case: a visitor presses Tab and lands on Mercury while it is behind the Sun. The camera must
// swing around so the planet comes into view, keep following it as it orbits, jump instantly with
// reduced motion, and leave the camera alone when nothing is focused or the id is unknown.
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { useThree } from '@react-three/fiber';
import { describe, expect, it } from 'vitest';
import type { Camera, Group } from 'three';
import { getAzimuth, wrapAngle } from '../lib/camera-focus';
import { CameraFocus } from './CameraFocus';

const SIDE_OFFSET = 0.5;
const HOME_AZIMUTH = Math.PI / 2;

type Props = Partial<React.ComponentProps<typeof CameraFocus>>;

async function setup(props: Props = {}, planetPosition: [number, number, number] = [0, 0, 4]) {
  const captured: { camera: Camera | null } = { camera: null };
  function Probe() {
    captured.camera = useThree((state) => state.camera);
    return null;
  }
  const element = (nextProps: Props = {}) => (
    <>
      <CameraFocus
        targetId="mercury"
        nonce={1}
        easingRate={8}
        homeAzimuth={HOME_AZIMUTH}
        sideOffset={SIDE_OFFSET}
        {...props}
        {...nextProps}
      />
      <group name="body-mercury" position={planetPosition} />
      <group name="body-sun" position={[0, 0, 0]} />
      <Probe />
    </>
  );
  const renderer = await ReactThreeTestRenderer.create(element());
  // Start in front of the scene, high enough to look down at the orbits.
  captured.camera!.position.set(0, 4, 9);
  return { renderer, camera: captured.camera!, element };
}

const azimuthOf = (camera: Camera) => getAzimuth(camera.position);

describe('CameraFocus', () => {
  it('swings the camera around to the focused planet plus the side offset', async () => {
    const { renderer, camera } = await setup({ easingRate: Number.POSITIVE_INFINITY });
    await renderer.advanceFrames(1, 0.016);
    expect(wrapAngle(azimuthOf(camera) - (Math.PI / 2 + SIDE_OFFSET))).toBeCloseTo(0, 5);
  });

  it('keeps its distance and height while swinging', async () => {
    const { renderer, camera } = await setup({ easingRate: Number.POSITIVE_INFINITY });
    const horizontalBefore = Math.hypot(camera.position.x, camera.position.z);
    await renderer.advanceFrames(1, 0.016);
    expect(Math.hypot(camera.position.x, camera.position.z)).toBeCloseTo(horizontalBefore, 5);
    expect(camera.position.y).toBe(4);
  });

  it('moves gradually when motion is allowed', async () => {
    const { renderer, camera } = await setup({ easingRate: 6 }, [4, 0, 0]);
    const before = azimuthOf(camera);
    await renderer.advanceFrames(2, 0.016);
    const moved = Math.abs(wrapAngle(azimuthOf(camera) - before));
    expect(moved).toBeGreaterThan(0.001);
    expect(moved).toBeLessThan(Math.abs(wrapAngle(0 + SIDE_OFFSET - before)));
  });

  it('eventually arrives', async () => {
    const { renderer, camera } = await setup({ easingRate: 6 }, [4, 0, 0]);
    await renderer.advanceFrames(400, 0.016);
    expect(wrapAngle(azimuthOf(camera) - SIDE_OFFSET)).toBeCloseTo(0, 2);
  });

  it('follows the planet when it moves', async () => {
    const { renderer, camera } = await setup({ easingRate: Number.POSITIVE_INFINITY });
    const planet = renderer.scene.findAll((node) => node.instance.name === 'body-mercury')[0]!
      .instance as Group;
    planet.position.set(4, 0, 0);
    await renderer.advanceFrames(1, 0.016);
    expect(wrapAngle(azimuthOf(camera) - SIDE_OFFSET)).toBeCloseTo(0, 5);
  });

  it('returns to the home azimuth when the star is focused', async () => {
    const { renderer, camera } = await setup({
      targetId: 'sun',
      easingRate: Number.POSITIVE_INFINITY,
    });
    camera.position.set(9, 4, 0);
    await renderer.advanceFrames(1, 0.016);
    expect(wrapAngle(azimuthOf(camera) - HOME_AZIMUTH)).toBeCloseTo(0, 5);
  });

  it('does nothing when nothing is focused', async () => {
    const { renderer, camera } = await setup({ targetId: null });
    const before = camera.position.clone();
    await renderer.advanceFrames(5, 0.016);
    expect(camera.position.toArray()).toEqual(before.toArray());
  });

  it('does nothing for an id that is not in the scene', async () => {
    const { renderer, camera } = await setup({ targetId: 'pluto' });
    const before = camera.position.clone();
    await renderer.advanceFrames(5, 0.016);
    expect(camera.position.toArray()).toEqual(before.toArray());
  });

  it('survives a zero delta frame', async () => {
    const { renderer, camera } = await setup();
    await renderer.advanceFrames(1, 0);
    expect(camera.position.toArray().every(Number.isFinite)).toBe(true);
  });

  it('takes the short way round across the back of the scene', async () => {
    const { renderer, camera } = await setup({ easingRate: 6 }, [-4, 0, -0.5]);
    camera.position.set(-9, 4, 0.5);
    const before = azimuthOf(camera);
    await renderer.advanceFrames(2, 0.016);
    expect(Math.abs(wrapAngle(azimuthOf(camera) - before))).toBeLessThan(0.5);
  });
});
