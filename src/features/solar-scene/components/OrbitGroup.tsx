import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import type { Group } from 'three';
import type { Orbit } from '@/domain/celestial-body';
import { getOrbitPosition } from '../lib/orbit';
import { advanceRotation } from '../lib/rotation';

type OrbitGroupProps = {
  name: string;
  orbit: Orbit;
  isAnimated: boolean;
  children: ReactNode;
};

export function OrbitGroup({ name, orbit, isAnimated, children }: OrbitGroupProps) {
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
    <group ref={groupRef} name={name} position={[start.x, 0, start.z]}>
      {children}
    </group>
  );
}
