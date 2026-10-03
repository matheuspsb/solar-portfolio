import type { InteractionState } from './interaction-state';

export type LabeledBody = {
  id: string;
  name: string;
  menuLabel: string;
};

export function getBodyAccessibleLabel(body: LabeledBody): string {
  return `${body.name}: abrir seção ${body.menuLabel}`;
}

export function getHintLabel(
  state: InteractionState,
  bodies: readonly LabeledBody[],
): string | null {
  if (state.selectedId !== null) return null;
  const pointedId = state.focusedId ?? state.hoveredId;
  const body = bodies.find((candidate) => candidate.id === pointedId);
  return body ? `${body.name} · ${body.menuLabel}` : null;
}
