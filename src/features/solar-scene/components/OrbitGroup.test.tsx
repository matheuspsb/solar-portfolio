import ReactThreeTestRenderer from '@react-three/test-renderer';
import { describe, expect, it } from 'vitest';
import type { Group } from 'three';
import { OrbitGroup } from './OrbitGroup';

const orbit = { radius: 5, periodSeconds: 10, phaseRadians: 0 };

async function renderOrbit(props: Partial<React.ComponentProps<typeof OrbitGroup>> = {}) {
  const renderer = await ReactThreeTestRenderer.create(
    <OrbitGroup name="body-test" orbit={orbit} isAnimated {...props}>
      <mesh name="passenger" />
    </OrbitGroup>,
  );
  const group = renderer.scene.children[0]!.instance as Group;
  return { renderer, group };
}

describe('OrbitGroup', () => {
  it('starts at the orbit phase', async () => {
    const { group } = await renderOrbit({ orbit: { ...orbit, phaseRadians: Math.PI / 2 } });
    expect(group.position.x).toBeCloseTo(0);
    expect(group.position.z).toBeCloseTo(5);
    expect(group.position.y).toBe(0);
  });

  it('advances proportionally to elapsed time and stays on the circle', async () => {
    const { renderer, group } = await renderOrbit();
    await renderer.advanceFrames(1, 0.05);
    const expectedAngle = (Math.PI * 2 * 0.05) / 10;
    expect(group.position.x).toBeCloseTo(5 * Math.cos(expectedAngle), 5);
    expect(group.position.z).toBeCloseTo(5 * Math.sin(expectedAngle), 5);
    await renderer.advanceFrames(20, 0.05);
    expect(Math.hypot(group.position.x, group.position.z)).toBeCloseTo(5, 5);
  });

  it('returns to where it started after one full period', async () => {
    const { renderer, group } = await renderOrbit();
    await renderer.advanceFrames(100, 0.1);
    expect(group.position.x).toBeCloseTo(5, 3);
    expect(group.position.z).toBeCloseTo(0, 3);
  });

  it('does not move when the animation is off (reduced motion), staying at its phase', async () => {
    const { renderer, group } = await renderOrbit({
      isAnimated: false,
      orbit: { ...orbit, phaseRadians: 1 },
    });
    await renderer.advanceFrames(20, 0.1);
    expect(group.position.x).toBeCloseTo(5 * Math.cos(1), 5);
    expect(group.position.z).toBeCloseTo(5 * Math.sin(1), 5);
  });

  it('does not teleport after a huge delta (tab resumed)', async () => {
    const { renderer, group } = await renderOrbit();
    await renderer.advanceFrames(1, 900);
    const largestStep = (Math.PI * 2 * 0.1) / 10;
    expect(Math.atan2(group.position.z, group.position.x)).toBeLessThanOrEqual(largestStep + 1e-6);
  });

  it('keeps its children', async () => {
    const { group } = await renderOrbit();
    expect(group.children.map((child) => child.name)).toContain('passenger');
  });

  it('survives a zero delta frame', async () => {
    const { renderer, group } = await renderOrbit();
    await renderer.advanceFrames(1, 0);
    expect(Number.isFinite(group.position.x)).toBe(true);
  });
});
