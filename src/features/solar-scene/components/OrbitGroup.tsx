import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import type { Group } from 'three';
import type { Orbit } from '@/lib/celestial-body';
import { getOrbitPosition } from '../lib/orbit';
import { advanceRotation } from '../lib/rotation';

type OrbitGroupProps = {
  orbit: Orbit;
  /** False freezes the planet at its starting phase (reduced motion). */
  isAnimated: boolean;
  children: ReactNode;
};

/** Carries its children along a circular orbit around the origin, at a frame-rate independent pace. */
export function OrbitGroup({ orbit, isAnimated, children }: OrbitGroupProps) {
  const groupRef = useRef<Group>(null);
  const angleRef = useRef(orbit.phaseRadians);
  const start = getOrbitPosition({ radius: orbit.radius, angle: orbit.phaseRadians });

  useFrame((_state, deltaSeconds) => {
    const group = groupRef.current;
    if (!group || !isAnimated) return;
    angleRef.current = advanceRotation({
      angle: angleRef.current,
      deltaSeconds,
      periodSeconds: orbit.periodSeconds,
    });
    const { x, z } = getOrbitPosition({ radius: orbit.radius, angle: angleRef.current });
    group.position.set(x, 0, z);
  });

  return (
    <group ref={groupRef} position={[start.x, 0, start.z]}>
      {children}
    </group>
  );
}
