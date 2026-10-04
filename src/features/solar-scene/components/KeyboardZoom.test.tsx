import ReactThreeTestRenderer from '@react-three/test-renderer';
import { useThree } from '@react-three/fiber';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import type { Camera } from 'three';
import { KeyboardZoom } from './KeyboardZoom';

async function setup({ isEnabled = true } = {}) {
  const captured: { camera: Camera | null } = { camera: null };
  function Probe() {
    captured.camera = useThree((state) => state.camera);
    return null;
  }
  await ReactThreeTestRenderer.create(
    <>
      <KeyboardZoom minDistance={5} maxDistance={20} isEnabled={isEnabled} />
      <Probe />
    </>,
  );
  captured.camera!.position.set(0, 0, 10);
  const press = (key: string, init: KeyboardEventInit = {}) =>
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key, ...init }));
    });
  return { camera: captured.camera!, press };
}

describe('KeyboardZoom', () => {
  it('zooms in with + and out with -', async () => {
    const { camera, press } = await setup();
    await press('+');
    expect(camera.position.length()).toBeLessThan(10);
    const closer = camera.position.length();
    await press('-');
    expect(camera.position.length()).toBeGreaterThan(closer);
  });

  it('keeps the viewing direction', async () => {
    const { camera, press } = await setup();
    camera.position.set(0, 6, 8);
    await press('+');
    expect(camera.position.y / camera.position.z).toBeCloseTo(6 / 8, 8);
  });

  it('stops at the limits', async () => {
    const { camera, press } = await setup();
    for (let step = 0; step < 40; step += 1) await press('+');
    expect(camera.position.length()).toBeCloseTo(5, 8);
    for (let step = 0; step < 60; step += 1) await press('-');
    expect(camera.position.length()).toBeCloseTo(20, 8);
  });

  it.each([{ ctrlKey: true }, { metaKey: true }, { altKey: true }])(
    'leaves browser shortcuts alone (%o)',
    async (modifier) => {
      const { camera, press } = await setup();
      await press('+', modifier);
      expect(camera.position.length()).toBeCloseTo(10, 8);
    },
  );

  it('ignores other keys', async () => {
    const { camera, press } = await setup();
    await press('a');
    await press('Enter');
    expect(camera.position.length()).toBeCloseTo(10, 8);
  });

  it('does nothing while disabled (content panel open)', async () => {
    const { camera, press } = await setup({ isEnabled: false });
    await press('+');
    expect(camera.position.length()).toBeCloseTo(10, 8);
  });

  it('ignores keystrokes aimed at text fields', async () => {
    const { camera } = await setup();
    const input = document.createElement('input');
    document.body.append(input);
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }));
    });
    input.remove();
    expect(camera.position.length()).toBeCloseTo(10, 8);
  });
});
