import type { CelestialBodyConfig } from '@/lib/celestial-body';

/** How far the outer edge of a body reaches from the center of the scene. */
export function getBodyExtent({
  radius,
  orbit,
}: Pick<CelestialBodyConfig, 'radius' | 'orbit'>): number {
  return orbit ? orbit.radius + radius : radius;
}
