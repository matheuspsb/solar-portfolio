type OrbitPositionInput = {
  radius: number;
  /** Radians along the orbit, 0 on +x and a quarter turn on +z. */
  angle: number;
};

/** Where a planet is on its circular orbit around the origin, in the horizontal (x, z) plane. */
export function getOrbitPosition({ radius, angle }: OrbitPositionInput): { x: number; z: number } {
  const isRadiusUsable = Number.isFinite(radius) && radius > 0;
  if (!isRadiusUsable) return { x: 0, z: 0 };
  const safeAngle = Number.isFinite(angle) ? angle : 0;
  return { x: radius * Math.cos(safeAngle), z: radius * Math.sin(safeAngle) };
}
