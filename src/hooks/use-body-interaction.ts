import { useReducer } from 'react';
import { getHighlight, initialInteractionState, interactionReducer } from '@/lib/interaction-state';
import type { Highlight, InteractionState } from '@/lib/interaction-state';

export type BodyInteraction = {
  state: InteractionState;
  hover: (id: string) => void;
  unhover: (id: string) => void;
  focus: (id: string) => void;
  blur: (id: string) => void;
  select: (id: string) => void;
  deselect: () => void;
  highlightOf: (id: string) => Highlight;
};

function dropUnknownIds(state: InteractionState, knownIds: readonly string[]): InteractionState {
  const keepKnown = (id: string | null): string | null =>
    id !== null && knownIds.includes(id) ? id : null;
  return {
    hoveredId: keepKnown(state.hoveredId),
    focusedId: keepKnown(state.focusedId),
    selectedId: keepKnown(state.selectedId),
  };
}

export function useBodyInteraction(bodyIds: readonly string[]): BodyInteraction {
  const [rawState, dispatch] = useReducer(interactionReducer, initialInteractionState);
  const state = dropUnknownIds(rawState, bodyIds);

  const dispatchForKnownId = (type: 'hover' | 'unhover' | 'focus' | 'blur' | 'select') => {
    return (id: string) => {
      if (bodyIds.includes(id)) dispatch({ type, id });
    };
  };

  return {
    state,
    hover: dispatchForKnownId('hover'),
    unhover: dispatchForKnownId('unhover'),
    focus: dispatchForKnownId('focus'),
    blur: dispatchForKnownId('blur'),
    select: dispatchForKnownId('select'),
    deselect: () => dispatch({ type: 'deselect' }),
    highlightOf: (id) => getHighlight(state, id),
  };
}
