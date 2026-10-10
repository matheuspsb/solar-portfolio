import { enter, seg } from './easing';
import { DESIGN_CUES } from './timeline';

export type HudMarks = {
  opacity: number;
  stageIndex: number;
  stageCount: number;
  stageOpacity: number;
  dotOpacity: number;
};

const HUD_STAGE_STARTS: readonly number[] = [
  DESIGN_CUES.start,
  DESIGN_CUES.hyperspace,
  DESIGN_CUES.nebula,
  DESIGN_CUES.ignition,
  DESIGN_CUES.orbits,
];

const HUD_FADE_OUT_SECONDS = 0.4;
const STAGE_FADE_START_SECONDS = 0.05;
const STAGE_FADE_END_SECONDS = 0.45;
const DOT_PULSE_RATE = 6;
const DOT_BASE_OPACITY = 0.5;
const DOT_PULSE_DEPTH = 0.5;

export function getHudMarks(designSeconds: number, ambientSeconds: number): HudMarks {
  const { start, finale } = DESIGN_CUES;
  const currentIndex = HUD_STAGE_STARTS.findLastIndex(
    (startSeconds) => designSeconds >= startSeconds,
  );
  const stageIndex = Math.max(0, currentIndex);
  const stageStartSeconds = HUD_STAGE_STARTS[stageIndex] ?? start;
  const isFirstStage = stageIndex === 0;

  return {
    opacity: 1 - seg(designSeconds, finale, finale + HUD_FADE_OUT_SECONDS),
    stageIndex: stageIndex + 1,
    stageCount: HUD_STAGE_STARTS.length,
    stageOpacity: isFirstStage
      ? 1
      : enter(
          seg(
            designSeconds,
            stageStartSeconds + STAGE_FADE_START_SECONDS,
            stageStartSeconds + STAGE_FADE_END_SECONDS,
          ),
        ),
    dotOpacity: DOT_BASE_OPACITY + DOT_PULSE_DEPTH * Math.sin(ambientSeconds * DOT_PULSE_RATE),
  };
}
