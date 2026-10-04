/** Visual identity of a stack item's "planet"; maps to the `planet-*` color tokens. */
export type StackTone = 'cyan' | 'white' | 'blue' | 'green' | 'coral' | 'orchid' | 'amber';

export type PlanetSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type StackItem = {
  name: string;
  tone: StackTone;
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

/** Union that grows as new sections (projects, experience...) are added. */
export type SectionContent = AboutContent;

export type BodyTexture = {
  url: string;
  smallUrl: string;
};

export type CelestialBodyConfig = {
  id: string;
  name: string;
  kind: 'star';
  radius: number;
  rotationPeriodSeconds: number;
  texture: BodyTexture | null;
  section: {
    menuLabel: string;
    title: string;
    /** Small caption in the panel header, e.g. "Sobre · Objeto 001". */
    panelLabel: string;
    content: SectionContent;
  };
};

export type ValidationResult = { valid: true } | { valid: false; errors: string[] };

const SAFE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isBlank = (text: string): boolean => text.trim().length === 0;
const isPositiveFinite = (value: number): boolean => Number.isFinite(value) && value > 0;

function validateBody(body: CelestialBodyConfig, label: string): string[] {
  const errors: string[] = [];
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
  const errors = [
    ...findDuplicateIds(bodies).map((id) => `duplicate id "${id}"`),
    ...bodies.flatMap((body, index) => validateBody(body, `body[${index}] "${body.id}"`)),
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
