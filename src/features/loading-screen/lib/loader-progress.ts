import { draw, enter, seg } from './easing';
import { DESIGN_CUES } from './timeline';

const PERCENT_SCALE = 100;
const NOT_READY_CEILING_PERCENT = 99;
const START_SHARE = 12;
const HYPERSPACE_SHARE = 36;
const NEBULA_SHARE = 34;
const IGNITION_SHARE = 18;
const START_BAR_DELAY_SECONDS = 0.3;
const IGNITION_BAR_SECONDS = 1.3;

type LoaderProgressInput = {
  designSeconds: number;
  isSceneReady: boolean;
  previousPercent: number;
};

export function getAnimatedPercent(designSeconds: number): number {
  const { start, hyperspace, nebula, ignition } = DESIGN_CUES;
  return Math.round(
    START_SHARE * seg(designSeconds, start + START_BAR_DELAY_SECONDS, hyperspace) +
      HYPERSPACE_SHARE * draw(seg(designSeconds, hyperspace, nebula)) +
      NEBULA_SHARE * seg(designSeconds, nebula, ignition) +
      IGNITION_SHARE * enter(seg(designSeconds, ignition, ignition + IGNITION_BAR_SECONDS)),
  );
}

export function getLoaderProgress({
  designSeconds,
  isSceneReady,
  previousPercent,
}: LoaderProgressInput): number {
  const animatedPercent = getAnimatedPercent(designSeconds);
  const ceilingPercent = isSceneReady ? PERCENT_SCALE : NOT_READY_CEILING_PERCENT;
  const safePrevious = Number.isFinite(previousPercent) ? previousPercent : 0;
  return Math.max(safePrevious, Math.min(ceilingPercent, animatedPercent));
}
