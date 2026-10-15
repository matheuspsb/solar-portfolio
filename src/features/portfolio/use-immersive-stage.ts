import { useEffect, useState } from 'react';
import type { ImmersiveSection } from '@/domain/celestial-body';
import type { DiveRequest } from '@/features/solar-scene';

const MILLISECONDS_PER_SECOND = 1000;

export type ImmersiveStage = 'idle' | 'diving' | 'open' | 'surfacing';

export type ImmersiveTarget = {
  experience: ImmersiveSection['experience'];
  bodyId: string;
};

type StageState = {
  stage: ImmersiveStage;
  shown: ImmersiveTarget | null;
  nonce: number;
  key: string | null;
};

type UseImmersiveStageInput = {
  target: ImmersiveTarget | null;
  reducedMotion: boolean;
  diveSeconds: number;
  surfaceSeconds: number;
};

type ImmersiveStageApi = {
  stage: ImmersiveStage;
  experience: ImmersiveSection['experience'] | null;
  dive: DiveRequest | null;
};

const IDLE_STATE: StageState = { stage: 'idle', shown: null, nonce: 0, key: null };

function getTargetKey(target: ImmersiveTarget | null): string | null {
  return target === null ? null : `${target.experience}:${target.bodyId}`;
}

function moveToTarget(
  state: StageState,
  target: ImmersiveTarget | null,
  reducedMotion: boolean,
): StageState {
  const key = getTargetKey(target);
  if (target !== null) {
    const stage = reducedMotion ? 'open' : 'diving';
    return { stage, shown: target, nonce: state.nonce + 1, key };
  }
  if (state.shown === null) return { ...state, key };
  if (reducedMotion) return { ...IDLE_STATE, nonce: state.nonce, key };
  return { ...state, stage: 'surfacing', nonce: state.nonce + 1, key };
}

function getDive(
  state: StageState,
  diveSeconds: number,
  surfaceSeconds: number,
): DiveRequest | null {
  if (state.shown === null) return null;
  const { bodyId } = state.shown;
  if (state.stage === 'diving') {
    return { bodyId, direction: 'in', nonce: state.nonce, durationSeconds: diveSeconds };
  }
  if (state.stage === 'surfacing') {
    return { bodyId, direction: 'out', nonce: state.nonce, durationSeconds: surfaceSeconds };
  }
  return null;
}

export function useImmersiveStage({
  target,
  reducedMotion,
  diveSeconds,
  surfaceSeconds,
}: UseImmersiveStageInput): ImmersiveStageApi {
  const [state, setState] = useState(() => moveToTarget(IDLE_STATE, target, reducedMotion));

  if (getTargetKey(target) !== state.key) setState(moveToTarget(state, target, reducedMotion));

  const { stage, nonce } = state;
  useEffect(() => {
    if (stage === 'diving') {
      const timer = setTimeout(
        () => setState((current) => ({ ...current, stage: 'open' })),
        diveSeconds * MILLISECONDS_PER_SECOND,
      );
      return () => clearTimeout(timer);
    }
    if (stage === 'surfacing') {
      const timer = setTimeout(
        () => setState((current) => ({ ...IDLE_STATE, nonce: current.nonce, key: current.key })),
        surfaceSeconds * MILLISECONDS_PER_SECOND,
      );
      return () => clearTimeout(timer);
    }
  }, [stage, nonce, diveSeconds, surfaceSeconds]);

  return {
    stage,
    experience: state.shown?.experience ?? null,
    dive: getDive(state, diveSeconds, surfaceSeconds),
  };
}
