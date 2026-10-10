import type { DustMark } from './dust-marks';
import { DISC_TILT_DEGREES } from './dust-marks';
import { STAGE_CENTER_X, STAGE_CENTER_Y } from './star-marks';
import type { StarMark } from './star-marks';

export type SkyContext = Pick<
  CanvasRenderingContext2D,
  | 'clearRect'
  | 'setTransform'
  | 'save'
  | 'restore'
  | 'translate'
  | 'rotate'
  | 'beginPath'
  | 'moveTo'
  | 'lineTo'
  | 'arc'
  | 'fill'
  | 'stroke'
> & {
  globalAlpha: number;
  lineWidth: number;
  lineCap: CanvasLineCap;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  fillStyle: string | CanvasGradient | CanvasPattern;
};

export type SkyView = {
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
  stageScale: number;
};

const DEGREES_TO_RADIANS = Math.PI / 180;

function drawStar(context: SkyContext, star: StarMark): void {
  context.globalAlpha = star.opacity;
  context.beginPath();
  if (star.isStreak) {
    context.strokeStyle = star.color;
    context.lineWidth = star.size;
    context.lineCap = 'round';
    context.moveTo(star.fromX, star.fromY);
    context.lineTo(star.toX, star.toY);
    context.stroke();
    return;
  }
  context.fillStyle = star.color;
  context.arc(star.toX, star.toY, star.size, 0, Math.PI * 2);
  context.fill();
}

function drawDust(context: SkyContext, dust: DustMark): void {
  context.globalAlpha = dust.opacity;
  context.strokeStyle = dust.color;
  context.lineWidth = dust.width;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(dust.fromX, dust.fromY);
  context.lineTo(dust.toX, dust.toY);
  context.stroke();
}

export function drawSky(
  context: SkyContext,
  stars: readonly StarMark[],
  dust: readonly DustMark[],
  view: SkyView,
): void {
  const scale = view.pixelRatio * view.stageScale;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(
    0,
    0,
    view.viewportWidth * view.pixelRatio,
    view.viewportHeight * view.pixelRatio,
  );
  context.setTransform(
    scale,
    0,
    0,
    scale,
    (view.viewportWidth * view.pixelRatio) / 2 - STAGE_CENTER_X * scale,
    (view.viewportHeight * view.pixelRatio) / 2 - STAGE_CENTER_Y * scale,
  );

  for (const star of stars) drawStar(context, star);

  if (dust.length > 0) {
    context.save();
    context.translate(STAGE_CENTER_X, STAGE_CENTER_Y);
    context.rotate(DISC_TILT_DEGREES * DEGREES_TO_RADIANS);
    for (const speck of dust) drawDust(context, speck);
    context.restore();
  }
  context.globalAlpha = 1;
}
