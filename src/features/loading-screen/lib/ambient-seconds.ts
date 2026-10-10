import type { LoaderClock } from './loader-clock';
import { toDesignSeconds } from './time-warp';
import { STAGES } from './timeline';

const orbitsStage = STAGES.find((stage) => stage.name === 'orbits');
const ORBIT_DESIGN_SECONDS_PER_REAL_SECOND = orbitsStage
  ? orbitsStage.designSeconds / orbitsStage.realSeconds
  : 1;

export function getAmbientSeconds(clock: LoaderClock): number {
  const heldRealSeconds = Math.max(0, clock.freeSeconds - clock.elapsedSeconds);
  return (
    toDesignSeconds(clock.elapsedSeconds) + heldRealSeconds * ORBIT_DESIGN_SECONDS_PER_REAL_SECOND
  );
}
