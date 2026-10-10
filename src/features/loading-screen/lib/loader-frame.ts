import { seg } from './easing';
import { getDustMarks, getNebula } from './dust-marks';
import type { DustMark } from './dust-marks';
import { getHudMarks } from './hud-marks';
import type { HudMarks } from './hud-marks';
import { getPlanetMarks } from './planet-marks';
import type { PlanetMarks } from './planet-marks';
import { getStarMarks } from './star-marks';
import type { StarMark } from './star-marks';
import { getCoreMark, getFlashOpacity, getRayMarks, getSunMark, getWaveMarks } from './sun-marks';
import type { CoreMark, RayMark, SunMark, WaveMark } from './sun-marks';
import { getTitleMarks } from './title-marks';
import type { TitleMarks } from './title-marks';
import { DESIGN_CUES } from './timeline';

export { STAGE_CENTER_X, STAGE_CENTER_Y, STAGE_HEIGHT, STAGE_WIDTH } from './star-marks';

export type LoaderFrame = {
  stars: StarMark[];
  dust: DustMark[];
  nebula: ReturnType<typeof getNebula>;
  core: CoreMark | null;
  sun: SunMark | null;
  rays: RayMark[];
  waves: WaveMark[];
  planets: PlanetMarks;
  title: TitleMarks;
  hud: HudMarks;
  flashOpacity: number;
  contentOpacity: number;
  blackoutOpacity: number;
};

const CONTENT_FADE_SECONDS = 0.5;
const BLACKOUT_START_SECONDS = 0.75;
const BLACKOUT_END_SECONDS = 1.5;

function toSafeSeconds(seconds: number): number {
  return Number.isNaN(seconds) || seconds < 0 ? 0 : seconds;
}

export function getLoaderFrame(designSeconds: number, ambientSeconds: number): LoaderFrame {
  const design = Math.min(toSafeSeconds(designSeconds), Number.MAX_SAFE_INTEGER);
  const ambient = Math.min(toSafeSeconds(ambientSeconds), Number.MAX_SAFE_INTEGER);
  const { finale } = DESIGN_CUES;

  return {
    stars: getStarMarks(design, ambient),
    dust: getDustMarks(design),
    nebula: getNebula(design),
    core: getCoreMark(design),
    sun: getSunMark(design, ambient),
    rays: getRayMarks(design, ambient),
    waves: getWaveMarks(design),
    planets: getPlanetMarks(design, ambient),
    title: getTitleMarks(design),
    hud: getHudMarks(design, ambient),
    flashOpacity: getFlashOpacity(design),
    contentOpacity: 1 - seg(design, finale, finale + CONTENT_FADE_SECONDS),
    blackoutOpacity: seg(design, finale + BLACKOUT_START_SECONDS, finale + BLACKOUT_END_SECONDS),
  };
}
