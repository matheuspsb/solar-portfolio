export type ContactStepIndex = 0 | 1 | 2;

export type FieldMotion = { kind: 'enter' | 'shake'; id: number };

export type ContactFlowState = {
  step: ContactStepIndex;
  status: 'asking' | 'sending' | 'done';
  error: string | null;
  fieldMotion: FieldMotion;
};

export type ContactFlowAction =
  | { type: 'advance' }
  | { type: 'back' }
  | { type: 'jump'; step: ContactStepIndex }
  | { type: 'reject'; error: string }
  | { type: 'edit' }
  | { type: 'send' }
  | { type: 'delivered' }
  | { type: 'failed'; error: string }
  | { type: 'reset' };

const LAST_STEP: ContactStepIndex = 2;

export function createInitialFlowState(): ContactFlowState {
  return { step: 0, status: 'asking', error: null, fieldMotion: { kind: 'enter', id: 0 } };
}

function withMotion(
  state: ContactFlowState,
  kind: FieldMotion['kind'],
  changes: Partial<ContactFlowState>,
): ContactFlowState {
  return { ...state, ...changes, fieldMotion: { kind, id: state.fieldMotion.id + 1 } };
}

function moveToStep(state: ContactFlowState, step: ContactStepIndex): ContactFlowState {
  return withMotion(state, 'enter', { step, error: null });
}

export function contactFlowReducer(
  state: ContactFlowState,
  action: ContactFlowAction,
): ContactFlowState {
  switch (action.type) {
    case 'advance':
      if (state.status !== 'asking' || state.step >= LAST_STEP) return state;
      return moveToStep(state, (state.step + 1) as ContactStepIndex);
    case 'back':
      if (state.status !== 'asking' || state.step <= 0) return state;
      return moveToStep(state, (state.step - 1) as ContactStepIndex);
    case 'jump':
      if (state.status !== 'asking' || action.step >= state.step) return state;
      return moveToStep(state, action.step);
    case 'reject':
      if (state.status !== 'asking') return state;
      return withMotion(state, 'shake', { error: action.error });
    case 'edit':
      if (state.error === null) return state;
      return { ...state, error: null };
    case 'send':
      if (state.status !== 'asking' || state.step !== LAST_STEP) return state;
      return { ...state, status: 'sending', error: null };
    case 'delivered':
      if (state.status !== 'sending') return state;
      return { ...state, status: 'done' };
    case 'failed':
      if (state.status !== 'sending') return state;
      return withMotion(state, 'shake', { status: 'asking', error: action.error });
    case 'reset':
      if (state.status !== 'done') return state;
      return withMotion(createInitialFlowState(), 'enter', {});
  }
}
