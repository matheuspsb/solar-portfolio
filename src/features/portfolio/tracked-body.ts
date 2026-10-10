import type { InteractionState } from '@/lib/interaction-state';

export function getTrackedBodyId(state: InteractionState): string | null {
  if (state.selectedId !== null) return null;
  return state.focusedId ?? state.hoveredId;
}
