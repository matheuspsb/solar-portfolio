import { useThree } from '@react-three/fiber';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { describe, expect, it, vi } from 'vitest';
import type { Group } from 'three';
import type { ScreenFrame } from '@/lib/screen-frame';
import { INSTANT_EASING_RATE } from '../../lib/motion';
import { BodyTracker } from './BodyTracker';

const BODIES = [
  { id: 'sun', radius: 2.4 },
  { id: 'mercury', radius: 0.55 },
] as const;

type Props = Partial<React.ComponentProps<typeof BodyTracker>>;

async function setup(props: Props = {}) {
  const onFrame = vi.fn<(frame: ScreenFrame | null) => void>();
  const captured: { width: number; height: number } = { width: 0, height: 0 };
  function Probe() {
    const size = useThree((state) => state.size);
    captured.width = size.width;
    captured.height = size.height;
    return null;
  }
  const element = (nextProps: Props = {}) => (
    <>
      <BodyTracker
        targetId="sun"
        bodies={BODIES}
        easingRate={INSTANT_EASING_RATE}
        onFrame={onFrame}
        {...props}
        {...nextProps}
      />
      <group name="body-sun" position={[0, 0, 0]} />
      <group name="body-mercury" position={[4, 0, 0]} />
      <Probe />
    </>
  );
  const renderer = await ReactThreeTestRenderer.create(element());
  const lastFrame = () => onFrame.mock.calls.at(-1)?.[0];
  return { renderer, onFrame, element, captured, lastFrame };
}

function groupNamed(renderer: Awaited<ReturnType<typeof setup>>['renderer'], name: string) {
  return renderer.scene.children.find((child) => child.instance.name === name)!.instance as Group;
}

describe('BodyTracker', () => {
  it('publishes nothing while no body is tracked', async () => {
    const { renderer, onFrame } = await setup({ targetId: null });
    await renderer.advanceFrames(3, 0.016);
    expect(onFrame).not.toHaveBeenCalled();
  });

  it('follows the body when it moves', async () => {
    const { renderer, lastFrame } = await setup({ targetId: 'mercury' });
    await renderer.advanceFrames(1, 0.016);
    const before = lastFrame()!.x;
    groupNamed(renderer, 'body-mercury').position.x = 2;
    await renderer.advanceFrames(1, 0.016);
    expect(lastFrame()!.x).toBeLessThan(before);
  });

  it('glides toward a moving body when motion is allowed and jumps with reduced motion', async () => {
    const gliding = await setup({ targetId: 'mercury', easingRate: 8 });
    await gliding.renderer.advanceFrames(1, 0.016);
    const start = gliding.lastFrame()!.x;
    groupNamed(gliding.renderer, 'body-mercury').position.x = 0;
    await gliding.renderer.advanceFrames(1, 0.016);
    const afterOneFrame = gliding.lastFrame()!.x;
    expect(afterOneFrame).toBeLessThan(start);
    expect(afterOneFrame).toBeGreaterThan(gliding.captured.width / 2);
    await gliding.renderer.advanceFrames(240, 0.016);
    expect(gliding.lastFrame()!.x).toBeCloseTo(gliding.captured.width / 2, 0);

    const instant = await setup({ targetId: 'mercury' });
    await instant.renderer.advanceFrames(1, 0.016);
    groupNamed(instant.renderer, 'body-mercury').position.x = 0;
    await instant.renderer.advanceFrames(1, 0.016);
    expect(instant.lastFrame()!.x).toBeCloseTo(instant.captured.width / 2, 0);
  });

  it('starts on the new body when the target changes, without gliding from the previous one', async () => {
    const { renderer, element, onFrame, lastFrame } = await setup({
      targetId: 'sun',
      easingRate: 4,
    });
    await renderer.advanceFrames(1, 0.016);
    const sunX = lastFrame()!.x;
    await renderer.update(element({ targetId: 'mercury', easingRate: 4 }));
    await renderer.advanceFrames(1, 0.016);
    expect(onFrame).toHaveBeenCalled();
    expect(lastFrame()!.x).toBeGreaterThan(sunX + 50);
  });

  it('clears the frame when the target goes away', async () => {
    const { renderer, element, lastFrame } = await setup();
    await renderer.advanceFrames(1, 0.016);
    await renderer.update(element({ targetId: null }));
    await renderer.advanceFrames(1, 0.016);
    expect(lastFrame()).toBeNull();
  });

  it('publishes nothing for an id that is not in the scene', async () => {
    const { renderer, onFrame } = await setup({ targetId: 'pluto' });
    await renderer.advanceFrames(3, 0.016);
    expect(onFrame).not.toHaveBeenCalled();
  });

  it('stays quiet once the frame has settled', async () => {
    const { renderer, onFrame } = await setup();
    await renderer.advanceFrames(3, 0.016);
    const callsWhenSettled = onFrame.mock.calls.length;
    await renderer.advanceFrames(10, 0.016);
    expect(onFrame.mock.calls.length).toBe(callsWhenSettled);
  });

  it('survives a zero delta frame', async () => {
    const { renderer, lastFrame } = await setup({ easingRate: 8 });
    await renderer.advanceFrames(1, 0);
    expect(Number.isFinite(lastFrame()?.x ?? Number.NaN)).toBe(true);
  });
});
