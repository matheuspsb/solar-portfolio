import type { ContactContent } from './contact-content';

export type PlanetTone =
  'cyan' | 'white' | 'blue' | 'green' | 'orchid' | 'amber' | 'periwinkle' | 'copper';

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
  emblem: { textureUrl: string | null };
};

export type SectionContent = AboutContent | ContactContent;

export type BodyTexture = {
  url: string;
  smallUrl: string;
};

export type BodyKind = 'star' | 'planet';

export type Orbit = {
  radius: number;
  periodSeconds: number;
  phaseRadians: number;
};

export type TargetingAnchor = 'top-left' | 'bottom-left';

export type TargetingConfig = {
  code: string;
  description: string;
  anchor: TargetingAnchor;
};

export type CelestialBodyConfig = {
  id: string;
  name: string;
  kind: BodyKind;
  radius: number;
  rotationPeriodSeconds: number;
  orbit: Orbit | null;
  texture: BodyTexture | null;
  targeting: TargetingConfig;
  section: BodySection | null;
};

type SectionEntry = {
  menuLabel: string;
  menuTone: PlanetTone;
};

export type PanelSection = SectionEntry & {
  presentation: 'panel';
  title: string;
  panelLabel: string;
  content: SectionContent;
};

export type ImmersiveExperience = 'venus-arcade';

export type ImmersiveSection = SectionEntry & {
  presentation: 'immersive';
  experience: ImmersiveExperience;
  callToAction: string;
};

export type BodySection = PanelSection | ImmersiveSection;

export type InteractiveCelestialBody = CelestialBodyConfig & { section: BodySection };

export function getInteractiveBodies(
  bodies: readonly CelestialBodyConfig[],
): InteractiveCelestialBody[] {
  return bodies.filter((body): body is InteractiveCelestialBody => body.section !== null);
}
