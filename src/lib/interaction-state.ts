export type InteractionState = {
  hoveredId: string | null;
  focusedId: string | null;
  selectedId: string | null;
};

export type InteractionAction =
  | { type: 'hover'; id: string }
  | { type: 'unhover'; id: string }
  | { type: 'focus'; id: string }
  | { type: 'blur'; id: string }
  | { type: 'select'; id: string }
  | { type: 'deselect' };

export type Highlight = 'none' | 'hovered' | 'focused' | 'selected';

export const initialInteractionState: InteractionState = {
  hoveredId: null,
  focusedId: null,
  selectedId: null,
};

/** Pointer travel (in px) above which a press is an orbit drag, not a click. */
const MAX_CLICK_MOVEMENT_PIXELS = 5;

export function interactionReducer(
  state: InteractionState,
  action: InteractionAction,
): InteractionState {
  switch (action.type) {
    case 'hover':
      return state.hoveredId === action.id ? state : { ...state, hoveredId: action.id };
    case 'unhover':
      return state.hoveredId === action.id ? { ...state, hoveredId: null } : state;
    case 'focus':
      return state.focusedId === action.id ? state : { ...state, focusedId: action.id };
    case 'blur':
      return state.focusedId === action.id ? { ...state, focusedId: null } : state;
    case 'select':
      return state.selectedId === action.id ? state : { ...state, selectedId: action.id };
    case 'deselect':
      return state.selectedId === null ? state : { ...state, selectedId: null };
  }
}

export function getHighlight(state: InteractionState, id: string): Highlight {
  if (state.selectedId === id) return 'selected';
  if (state.focusedId === id) return 'focused';
  if (state.hoveredId === id) return 'hovered';
  return 'none';
}

export function isClickGesture(movementPixels: number): boolean {
  return movementPixels >= 0 && movementPixels <= MAX_CLICK_MOVEMENT_PIXELS;
}

const scaleByHighlight: Record<Highlight, number> = {
  none: 1,
  hovered: 1.03,
  focused: 1.04,
  selected: 1.05,
};

export function getHighlightScale(highlight: Highlight): number {
  return scaleByHighlight[highlight];
}
