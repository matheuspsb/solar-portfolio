import type { BodySection } from '@/domain/celestial-body';

export type LabeledBody = {
  id: string;
  name: string;
  menuLabel: string;
  presentation: BodySection['presentation'];
};

const actionByPresentation: Record<BodySection['presentation'], string> = {
  panel: 'abrir seção',
  immersive: 'abrir',
};

export function getBodyAccessibleLabel(body: LabeledBody): string {
  return `${body.name}: ${actionByPresentation[body.presentation]} ${body.menuLabel}`;
}
