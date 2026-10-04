type OrbitPositionInput = {
  radius: number;
  angle: number;
};

export function getOrbitPosition({ radius, angle }: OrbitPositionInput): { x: number; z: number } {
  const isRadiusUsable = Number.isFinite(radius) && radius > 0;
  if (!isRadiusUsable) return { x: 0, z: 0 };
  const safeAngle = Number.isFinite(angle) ? angle : 0;
  return { x: radius * Math.cos(safeAngle), z: radius * Math.sin(safeAngle) };
}
