/** Color of a little "planet" (stack items, menu destinations); maps to the `planet-*` color tokens. */
export type PlanetTone = 'cyan' | 'white' | 'blue' | 'green' | 'orchid' | 'amber' | 'periwinkle';

export type PlanetSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type StackItem = {
  name: string;
  tone: PlanetTone;
  size: PlanetSize;
};

export type AboutContent = {
  type: 'about';
  name: string;
  role: string;
  summary: string;
  experience: { value: string; unit: string; description: string };
  location: { name: string; coordinates: string };
  stack: readonly StackItem[];
  links: ReadonlyArray<{ label: string; href: string }>;
};

export type ContactContent = {
  type: 'contact';
  headline: string;
  summary: string;
  channels: ReadonlyArray<{ label: string; href: string }>;
};

/** Union that grows as new sections (projects, experience...) are added. */
export type SectionContent = AboutContent | ContactContent;

export type BodyTexture = {
  url: string;
  smallUrl: string;
};

export type BodyKind = 'star' | 'planet';

/** A circular orbit around the star at the center of the scene. */
export type Orbit = {
  radius: number;
  periodSeconds: number;
  /** Starting angle, in radians, so planets do not all begin on the same line. */
  phaseRadians: number;
};

export type CelestialBodyConfig = {
  id: string;
  name: string;
  kind: BodyKind;
  radius: number;
  rotationPeriodSeconds: number;
  /** Stars stay at the center (`null`); planets orbit it. */
  orbit: Orbit | null;
  texture: BodyTexture | null;
  section: {
    menuLabel: string;
    /** Color of this destination's planet in the quick-access menu. */
    menuTone: PlanetTone;
    title: string;
    /** Small caption in the panel header, e.g. "Sobre · Objeto 001". */
    panelLabel: string;
    content: SectionContent;
  };
};

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
  if (isBlank(body.section.menuLabel)) errors.push(`${label}: section menuLabel must not be blank`);
  if (isBlank(body.section.panelLabel))
    errors.push(`${label}: section panelLabel must not be blank`);
  return errors;
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
