import { useState } from 'react';

type CameraTarget = { id: string | null; nonce: number };

type TargetState = CameraTarget & { previousActiveId: string | null };

export function useCameraTarget(activeId: string | null): CameraTarget {
  const [state, setState] = useState<TargetState>({ id: null, nonce: 0, previousActiveId: null });

  if (activeId !== state.previousActiveId) {
    setState(
      activeId === null
        ? { ...state, previousActiveId: null }
        : { id: activeId, nonce: state.nonce + 1, previousActiveId: activeId },
    );
  }

  return { id: state.id, nonce: state.nonce };
}
