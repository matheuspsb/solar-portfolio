import { mix } from './easing';
import { STAGES, TOTAL_DESIGN_SECONDS, TOTAL_REAL_SECONDS } from './timeline';

export function toDesignSeconds(realSeconds: number): number {
  if (!(realSeconds > 0)) return 0;
  if (realSeconds >= TOTAL_REAL_SECONDS) return TOTAL_DESIGN_SECONDS;

  const stage = STAGES.findLast((candidate) => candidate.realStartSeconds <= realSeconds);
  if (!stage) return 0;

  const stageProgress = (realSeconds - stage.realStartSeconds) / stage.realSeconds;
  return mix(
    stage.designStartSeconds,
    stage.designStartSeconds + stage.designSeconds,
    stageProgress,
  );
}
