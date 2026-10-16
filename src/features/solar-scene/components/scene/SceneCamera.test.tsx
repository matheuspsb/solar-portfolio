import ReactThreeTestRenderer from '@react-three/test-renderer';
import { useThree } from '@react-three/fiber';
import { describe, expect, it } from 'vitest';
import type { Camera } from 'three';
import { SceneCamera } from './SceneCamera';

type Props = React.ComponentProps<typeof SceneCamera>;

const defaultProps: Props = {
  cameraDistance: 12,
  cameraTarget: { id: null, nonce: 0 },
  cameraFocusEasingRate: 8,
  viewOffsetPixels: 0,
  viewOffsetEasingRate: 8,
  dive: null,
  diveBodyRadius: 0,
  isActive: true,
  prefersReducedMotion: false,
};

async function setup(props: Partial<Props> = {}) {
  const captured: { camera: Camera | null } = { camera: null };
  function Probe() {
    captured.camera = useThree((state) => state.camera);
    return null;
  }
  const renderer = await ReactThreeTestRenderer.create(
    <>
      <SceneCamera {...defaultProps} {...props} />
      <Probe />
    </>,
  );
  return { renderer, camera: captured.camera! };
}

describe('SceneCamera', () => {
  it('places the camera at the distance the scene settings ask for', async () => {
    const { camera } = await setup({ cameraDistance: 15 });
    expect(camera.position.length()).toBeCloseTo(15);
  });

  it('moves the camera when the distance changes, for example when the panel opens', async () => {
    const { renderer, camera } = await setup({ cameraDistance: 15 });
    await renderer.update(<SceneCamera {...defaultProps} cameraDistance={9} />);
    expect(camera.position.length()).toBeCloseTo(9);
  });
});
