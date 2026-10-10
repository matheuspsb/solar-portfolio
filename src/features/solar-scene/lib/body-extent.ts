import type { CelestialBodyConfig } from '@/domain/celestial-body';

export function getBodyExtent({
  radius,
  orbit,
}: Pick<CelestialBodyConfig, 'radius' | 'orbit'>): number {
  return orbit ? orbit.radius + radius : radius;
}
