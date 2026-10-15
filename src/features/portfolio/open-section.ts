import type {
  ImmersiveSection,
  InteractiveCelestialBody,
  PanelSection,
} from '@/domain/celestial-body';

export function getOpenPanel(body: InteractiveCelestialBody | undefined): PanelSection | null {
  if (!body || body.section.presentation !== 'panel') return null;
  return body.section;
}

export function getOpenExperience(
  body: InteractiveCelestialBody | undefined,
): ImmersiveSection['experience'] | null {
  if (!body || body.section.presentation !== 'immersive') return null;
  return body.section.experience;
}

export function getImmersiveTarget(
  body: InteractiveCelestialBody | undefined,
): { experience: ImmersiveSection['experience']; bodyId: string } | null {
  const experience = getOpenExperience(body);
  if (!body || experience === null) return null;
  return { experience, bodyId: body.id };
}
