import { useState } from 'react';

type CameraTarget = { id: string | null; nonce: number };

type TargetState = CameraTarget & { previousActiveId: string | null };

/**
 * Turns "which body has the visitor's attention" into a camera target. The target is sticky (it
 * stays when attention leaves) and `nonce` grows on every new request, even for the same body.
 */
export function useCameraTarget(activeId: string | null): CameraTarget {
  const [state, setState] = useState<TargetState>({ id: null, nonce: 0, previousActiveId: null });

  // Derived during render (the pattern React documents for state that follows a prop).
  if (activeId !== state.previousActiveId) {
    setState(
      activeId === null
        ? { ...state, previousActiveId: null }
        : { id: activeId, nonce: state.nonce + 1, previousActiveId: activeId },
    );
  }

  return { id: state.id, nonce: state.nonce };
}
