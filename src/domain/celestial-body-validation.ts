import type { CelestialBodyConfig } from './celestial-body';

type ValidationResult = { valid: true } | { valid: false; errors: string[] };

const SAFE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isBlank = (text: string): boolean => text.trim().length === 0;
const isPositiveFinite = (value: number): boolean => Number.isFinite(value) && value > 0;

function validateOrbit(body: CelestialBodyConfig, label: string, starRadius: number): string[] {
  const { orbit } = body;
  if (body.kind === 'star') {
    return orbit === null
      ? []
      : [`${label}: a star stays at the center and must not have an orbit`];
  }
  if (orbit === null) return [`${label}: a planet needs an orbit`];

  const errors: string[] = [];
  if (!isPositiveFinite(orbit.radius)) {
    errors.push(`${label}: orbit.radius must be a positive finite number (got ${orbit.radius})`);
  } else if (orbit.radius - body.radius <= starRadius) {
    errors.push(`${label}: the orbit passes through the star (radius ${orbit.radius})`);
  }
  if (!isPositiveFinite(orbit.periodSeconds)) {
    errors.push(
      `${label}: orbit.periodSeconds must be a positive finite number (got ${orbit.periodSeconds})`,
    );
  }
  if (!Number.isFinite(orbit.phaseRadians)) {
    errors.push(`${label}: orbit.phaseRadians must be a finite number (got ${orbit.phaseRadians})`);
  }
  return errors;
}

function validateBody(body: CelestialBodyConfig, label: string, starRadius: number): string[] {
  const errors: string[] = [...validateOrbit(body, label, starRadius)];
  if (isBlank(body.id) || !SAFE_ID_PATTERN.test(body.id)) {
    errors.push(`${label}: id must be a non-empty lowercase slug (got ${JSON.stringify(body.id)})`);
  }
  if (isBlank(body.name)) errors.push(`${label}: name must not be blank`);
  if (!isPositiveFinite(body.radius)) {
    errors.push(`${label}: radius must be a positive finite number (got ${body.radius})`);
  }
  if (!isPositiveFinite(body.rotationPeriodSeconds)) {
    errors.push(
      `${label}: rotationPeriodSeconds must be a positive finite number (got ${body.rotationPeriodSeconds})`,
    );
  }
  if (body.texture && (isBlank(body.texture.url) || isBlank(body.texture.smallUrl))) {
    errors.push(`${label}: texture urls must not be blank`);
  }
  if (isBlank(body.targeting.code)) errors.push(`${label}: targeting code must not be blank`);
  if (isBlank(body.targeting.description)) {
    errors.push(`${label}: targeting description must not be blank`);
  }
  return [...errors, ...validateSection(body, label)];
}

function validateSection(body: CelestialBodyConfig, label: string): string[] {
  const { section } = body;
  if (section === null) {
    return body.kind === 'star'
      ? [`${label}: a star needs a section, since it is the way into the portfolio`]
      : [];
  }
  const errors: string[] = [];
  if (isBlank(section.menuLabel)) errors.push(`${label}: section menuLabel must not be blank`);
  if (section.presentation === 'panel' && isBlank(section.panelLabel)) {
    errors.push(`${label}: section panelLabel must not be blank`);
  }
  if (section.presentation === 'immersive' && isBlank(section.callToAction)) {
    errors.push(`${label}: section callToAction must not be blank`);
  }
  return errors;
}

type OrbitBand = { id: string; inner: number; outer: number };

function getOrbitBand(body: CelestialBodyConfig): OrbitBand | null {
  const { orbit } = body;
  if (orbit === null || !isPositiveFinite(orbit.radius) || !isPositiveFinite(body.radius)) {
    return null;
  }
  return { id: body.id, inner: orbit.radius - body.radius, outer: orbit.radius + body.radius };
}

function findOverlappingOrbits(bodies: readonly CelestialBodyConfig[]): string[] {
  const bands = bodies
    .map(getOrbitBand)
    .filter((band) => band !== null)
    .sort((first, second) => first.inner - second.inner);
  return bands.slice(1).flatMap((band, index) => {
    const previous = bands[index]!;
    return band.inner <= previous.outer
      ? [`orbits of "${previous.id}" and "${band.id}" overlap: planets would collide`]
      : [];
  });
}

function findDuplicateIds(bodies: readonly CelestialBodyConfig[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const body of bodies) {
    if (seen.has(body.id)) duplicates.add(body.id);
    seen.add(body.id);
  }
  return [...duplicates];
}

export function validateCelestialBodies(bodies: readonly CelestialBodyConfig[]): ValidationResult {
  if (bodies.length === 0) {
    return { valid: false, errors: ['configuration needs at least one celestial body'] };
  }
  const stars = bodies.filter((body) => body.kind === 'star');
  const starRadius = Math.max(0, ...stars.map((star) => star.radius));
  const errors = [
    ...(stars.length === 1 ? [] : [`configuration needs exactly one star (found ${stars.length})`]),
    ...findDuplicateIds(bodies).map((id) => `duplicate id "${id}"`),
    ...findOverlappingOrbits(bodies),
    ...bodies.flatMap((body, index) =>
      validateBody(body, `body[${index}] "${body.id}"`, starRadius),
    ),
  ];
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

export function assertValidCelestialBodies(
  bodies: readonly CelestialBodyConfig[],
): readonly CelestialBodyConfig[] {
  const result = validateCelestialBodies(bodies);
  if (!result.valid) {
    throw new Error(`Invalid celestial body configuration:\n- ${result.errors.join('\n- ')}`);
  }
  return bodies;
}
