import { arcadeContent } from '@/content/arcade';
import { arcadeTokens } from '@/styles/arcade-tokens';
import {
  DATA_HIT_POINTS,
  GRID_DOT_PIXELS,
  GRID_SCROLL_PIXELS_PER_SECOND,
  GRID_SPACING_PIXELS,
  INVULNERABLE_BLINK_RATE,
  LANE_COUNT,
  SHAKE_PIXELS_PER_SECOND,
  SHOT_GLOW_BLUR_PIXELS,
  SHOT_HEIGHT_PIXELS,
  SHOT_WIDTH_PIXELS,
  TEAR_BAND_ALPHA,
  TEAR_BAND_COUNT,
  TEAR_GHOST_ALPHA,
  TEAR_WARNING_FLASH_RATE,
} from '../engine/constants';
import type { Bug, CorruptedData, Entity, Patch, Shard, Tear } from '../engine/entities';
import { isTearActive } from '../engine/entities';
import { randomBetween } from '../engine/random';
import type { Random } from '../engine/random';
import type { Effects } from '../effects/effects';
import type { GameSession } from '../session/session';
import type { SpriteName } from '../sprites/bitmaps';
import { drawSprite, getSpriteSize } from '../sprites/draw-sprite';

export type GameContext = Pick<
  CanvasRenderingContext2D,
  | 'fillRect'
  | 'strokeRect'
  | 'beginPath'
  | 'moveTo'
  | 'lineTo'
  | 'stroke'
  | 'fillText'
  | 'setLineDash'
  | 'save'
  | 'restore'
  | 'translate'
  | 'fillStyle'
  | 'strokeStyle'
  | 'lineWidth'
  | 'globalAlpha'
  | 'font'
  | 'textAlign'
  | 'textBaseline'
  | 'shadowColor'
  | 'shadowBlur'
>;

export type GameFrame = {
  session: GameSession;
  effects: Effects;
  scrollSeconds: number;
  random: Random;
};

export type GameView = {
  width: number;
  height: number;
  pixelScale: number;
  fontFamily: string;
};

type DrawArea = { context: GameContext; view: GameView; frame: GameFrame };

const BUG_FRAMES_PER_SECOND = 6;
const PATCH_PULSE_RATE = 10;
const SHARD_JITTER_PIXELS = 2;
const SHARD_GHOST_OFFSET_PIXELS = 3;
const SHARD_GHOST_ALPHA = 0.6;
const PATCH_BASE_ALPHA = 0.6;
const PATCH_PULSE_ALPHA = 0.4;
const DATA_BORDER_PIXELS = 2;
const DATA_GLYPH_RATIO = 0.62;
const DATA_GLYPH_OFFSET_PIXELS = 1;
const TEAR_FILL_ALPHA = 0.08;
const TEAR_DASH_ON_ALPHA = 0.7;
const TEAR_DASH_OFF_ALPHA = 0.3;
const TEAR_DASH: readonly number[] = [8, 6];
const TEAR_LABEL_MARGIN_PIXELS = 10;
const TEAR_LABEL_RISE_PIXELS = 6;
const TEAR_EDGE_BLEED_PIXELS = 2;
const TEAR_BAND_OFFSET_PIXELS = 30;
const TEAR_GHOST_SHIFT_PIXELS = 6;
const TEAR_BAND_MIN_HEIGHT_PIXELS = 2;
const TEAR_BAND_HEIGHT_DIVISOR = 3;
const TEXT_SIZE_BASE_PIXELS = 8;
const PARTICLE_FADE_RATE = 2;
const EXHAUST_WIDTH_UNITS = 1;
const EXHAUST_LEFT_OFFSET_UNITS = 1.5;
const EXHAUST_RIGHT_OFFSET_UNITS = 0.5;
const EXHAUST_LONG_UNITS = 2;
const EXHAUST_SHORT_UNITS = 1;
const SHOT_HALF_WIDTH_PIXELS = SHOT_WIDTH_PIXELS / 2;
const SHOT_HALF_HEIGHT_PIXELS = SHOT_HEIGHT_PIXELS / 2;
const CENTER_DIVISOR = 2;

function getTextFont(view: GameView): string {
  return `${TEXT_SIZE_BASE_PIXELS + view.pixelScale}px ${view.fontFamily}`;
}

function drawSpriteCentered(
  context: GameContext,
  name: SpriteName,
  style: { color: string; frame: number; scale: number },
  center: { x: number; y: number },
): { width: number; height: number } {
  const size = getSpriteSize(name, style.scale);
  const left = Math.round(center.x - size.width / CENTER_DIVISOR);
  const top = Math.round(center.y - size.height / CENTER_DIVISOR);
  const shiftedContext = {
    get fillStyle() {
      return context.fillStyle;
    },
    set fillStyle(color) {
      context.fillStyle = color;
    },
    fillRect: (positionX: number, positionY: number, width: number, height: number) =>
      context.fillRect(positionX + left, positionY + top, width, height),
  };
  drawSprite(shiftedContext, name, {
    ...style,
    detailColor: arcadeTokens.spriteDetailColor,
  });
  return size;
}

function drawBackground({ context, view, frame }: DrawArea): void {
  context.fillStyle = arcadeTokens.screenColor;
  context.fillRect(0, 0, view.width, view.height);
  const offset = (frame.scrollSeconds * GRID_SCROLL_PIXELS_PER_SECOND) % GRID_SPACING_PIXELS;
  context.fillStyle = arcadeTokens.gridColor;
  for (let rowY = -GRID_SPACING_PIXELS + offset; rowY < view.height; rowY += GRID_SPACING_PIXELS) {
    for (
      let columnX = GRID_SPACING_PIXELS / CENTER_DIVISOR;
      columnX < view.width;
      columnX += GRID_SPACING_PIXELS
    ) {
      context.fillRect(columnX, rowY, GRID_DOT_PIXELS, GRID_DOT_PIXELS);
    }
  }
  context.strokeStyle = arcadeTokens.laneColor;
  context.lineWidth = 1;
  context.beginPath();
  for (let lane = 1; lane < LANE_COUNT; lane += 1) {
    const lineX = Math.round((view.width * lane) / LANE_COUNT) + 0.5;
    context.moveTo(lineX, 0);
    context.lineTo(lineX, view.height);
  }
  context.stroke();
}

function drawTearWarning({ context, view }: DrawArea, tear: Tear): void {
  const top = tear.y - tear.height / CENTER_DIVISOR;
  const isBright = Math.sin(tear.age * TEAR_WARNING_FLASH_RATE) > 0;
  context.globalAlpha = TEAR_FILL_ALPHA;
  context.fillStyle = arcadeTokens.glitchColor;
  context.fillRect(0, top, view.width, tear.height);
  context.globalAlpha = isBright ? TEAR_DASH_ON_ALPHA : TEAR_DASH_OFF_ALPHA;
  context.strokeStyle = arcadeTokens.glitchColor;
  context.setLineDash([...TEAR_DASH]);
  context.strokeRect(
    -TEAR_EDGE_BLEED_PIXELS,
    top,
    view.width + TEAR_EDGE_BLEED_PIXELS * 2,
    tear.height,
  );
  context.setLineDash([]);
  context.globalAlpha = 1;
  context.fillStyle = arcadeTokens.glitchColor;
  context.font = getTextFont(view);
  context.fillText(
    arcadeContent.game.tearWarning,
    TEAR_LABEL_MARGIN_PIXELS,
    top - TEAR_LABEL_RISE_PIXELS,
  );
}

function drawTearBands({ context, view, frame }: DrawArea, tear: Tear): void {
  const remaining = 1 - (tear.age - tear.warningSeconds) / tear.activeSeconds;
  const top = tear.y - tear.height / CENTER_DIVISOR;
  for (let band = 0; band < TEAR_BAND_COUNT; band += 1) {
    const bandTop = top + frame.random() * tear.height;
    const bandHeight = randomBetween(
      frame.random,
      TEAR_BAND_MIN_HEIGHT_PIXELS,
      tear.height / TEAR_BAND_HEIGHT_DIVISOR,
    );
    const shift = randomBetween(frame.random, -TEAR_BAND_OFFSET_PIXELS, TEAR_BAND_OFFSET_PIXELS);
    context.globalAlpha = TEAR_GHOST_ALPHA * remaining;
    context.fillStyle = arcadeTokens.glitchGhostColor;
    context.fillRect(shift - TEAR_GHOST_SHIFT_PIXELS, bandTop, view.width, bandHeight);
    context.globalAlpha = TEAR_BAND_ALPHA * remaining;
    context.fillStyle = arcadeTokens.glitchColor;
    context.fillRect(shift, bandTop, view.width, bandHeight);
  }
  context.globalAlpha = 1;
}

function drawTear(area: DrawArea, tear: Tear): void {
  if (isTearActive(tear)) drawTearBands(area, tear);
  else drawTearWarning(area, tear);
}

function drawBug({ context, view }: DrawArea, bug: Bug): void {
  const color = bug.flashSeconds > 0 ? arcadeTokens.flashColor : getBugColor(bug);
  const frame = Math.floor(bug.age * BUG_FRAMES_PER_SECOND);
  drawSpriteCentered(context, bug.kind, { color, frame, scale: view.pixelScale }, bug);
}

function getBugColor(bug: Bug): string {
  return bug.kind === 'beetle' ? arcadeTokens.beetleColor : arcadeTokens.crawlerColor;
}

function drawData({ context, view }: DrawArea, data: CorruptedData): void {
  const { x: centerX, y: centerY, radius } = data;
  context.fillStyle = data.flashSeconds > 0 ? arcadeTokens.flashColor : arcadeTokens.dataPanelColor;
  context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
  context.strokeStyle = arcadeTokens.dataColor;
  context.lineWidth = DATA_BORDER_PIXELS;
  context.strokeRect(
    centerX - radius + 1,
    centerY - radius + 1,
    radius * 2 - DATA_BORDER_PIXELS,
    radius * 2 - DATA_BORDER_PIXELS,
  );
  if (data.hitPoints < DATA_HIT_POINTS) {
    context.beginPath();
    context.moveTo(centerX - radius, centerY - radius * 0.2);
    context.lineTo(centerX - radius * 0.2, centerY + radius * 0.1);
    context.lineTo(centerX + radius * 0.3, centerY - radius * 0.5);
    context.stroke();
  }
  context.fillStyle = arcadeTokens.dataColor;
  context.font = `${Math.round(radius * DATA_GLYPH_RATIO)}px ${view.fontFamily}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(data.glyph, centerX, centerY + DATA_GLYPH_OFFSET_PIXELS);
  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';
}

function drawShard({ context, view, frame }: DrawArea, shard: Shard): void {
  const jitter = randomBetween(frame.random, -SHARD_JITTER_PIXELS, SHARD_JITTER_PIXELS);
  context.globalAlpha = SHARD_GHOST_ALPHA;
  drawSpriteCentered(
    context,
    'glitch',
    { color: arcadeTokens.glitchGhostColor, frame: 0, scale: view.pixelScale },
    { x: shard.x + SHARD_GHOST_OFFSET_PIXELS + jitter, y: shard.y },
  );
  context.globalAlpha = 1;
  drawSpriteCentered(
    context,
    'glitch',
    { color: arcadeTokens.glitchColor, frame: 0, scale: view.pixelScale },
    { x: shard.x + jitter, y: shard.y },
  );
}

function drawPatch({ context, view }: DrawArea, patch: Patch): void {
  context.globalAlpha =
    PATCH_BASE_ALPHA + PATCH_PULSE_ALPHA * Math.sin(patch.age * PATCH_PULSE_RATE);
  drawSpriteCentered(
    context,
    'patch',
    { color: arcadeTokens.droneColor, frame: 0, scale: view.pixelScale },
    patch,
  );
  context.globalAlpha = 1;
}

function drawEntity(area: DrawArea, entity: Entity): void {
  if (entity.kind === 'crawler' || entity.kind === 'beetle') drawBug(area, entity);
  else if (entity.kind === 'data') drawData(area, entity);
  else if (entity.kind === 'shard') drawShard(area, entity);
  else if (entity.kind === 'patch') drawPatch(area, entity);
}

function drawEntities(area: DrawArea): void {
  const { entities } = area.frame.session;
  for (const entity of entities) {
    if (entity.kind === 'tear') drawTear(area, entity);
  }
  for (const entity of entities) drawEntity(area, entity);
}

function drawShots({ context, frame }: DrawArea): void {
  const { shots, mode } = frame.session;
  context.shadowColor = arcadeTokens.shotGlowColor;
  context.shadowBlur = SHOT_GLOW_BLUR_PIXELS;
  context.fillStyle = mode === 'hotfix' ? arcadeTokens.hotfixDroneColor : arcadeTokens.shotColor;
  for (const shot of shots) {
    context.fillRect(
      shot.x - SHOT_HALF_WIDTH_PIXELS,
      shot.y - SHOT_HALF_HEIGHT_PIXELS,
      SHOT_WIDTH_PIXELS,
      SHOT_HEIGHT_PIXELS,
    );
  }
  context.shadowBlur = 0;
}

function isDroneBlinkedOut(invulnerableSeconds: number): boolean {
  return (
    invulnerableSeconds > 0 && Math.floor(invulnerableSeconds * INVULNERABLE_BLINK_RATE) % 2 === 1
  );
}

function drawExhaust({ context, view, frame }: DrawArea, droneBottom: number): void {
  const { x: droneX } = frame.session.drone;
  const isLongLeft = frame.random() > 0.5;
  const scale = view.pixelScale;
  context.fillStyle = isLongLeft ? arcadeTokens.shotGlowColor : arcadeTokens.beetleColor;
  context.fillRect(
    Math.round(droneX - scale * EXHAUST_LEFT_OFFSET_UNITS),
    droneBottom,
    scale * EXHAUST_WIDTH_UNITS,
    scale * (isLongLeft ? EXHAUST_LONG_UNITS : EXHAUST_SHORT_UNITS),
  );
  context.fillRect(
    Math.round(droneX + scale * EXHAUST_RIGHT_OFFSET_UNITS),
    droneBottom,
    scale * EXHAUST_WIDTH_UNITS,
    scale * (isLongLeft ? EXHAUST_SHORT_UNITS : EXHAUST_LONG_UNITS),
  );
}

function drawDrone(area: DrawArea): void {
  const { session } = area.frame;
  const { stats, drone, mode } = session;
  if (stats.integrity <= 0 || isDroneBlinkedOut(stats.invulnerableSeconds)) return;
  const color = mode === 'hotfix' ? arcadeTokens.hotfixDroneColor : arcadeTokens.droneColor;
  const size = drawSpriteCentered(
    area.context,
    'drone',
    { color, frame: 0, scale: area.view.pixelScale },
    drone,
  );
  drawExhaust(area, Math.round(drone.y + size.height / CENTER_DIVISOR));
}

function drawEffects({ context, view, frame }: DrawArea): void {
  const { particles, texts } = frame.effects;
  for (const particle of particles) {
    context.globalAlpha = Math.min(1, particle.lifeSeconds * PARTICLE_FADE_RATE);
    context.fillStyle = particle.color;
    context.fillRect(particle.x, particle.y, particle.size, particle.size);
  }
  context.font = getTextFont(view);
  context.textAlign = 'center';
  for (const floatingText of texts) {
    context.globalAlpha = Math.min(1, floatingText.lifeSeconds * PARTICLE_FADE_RATE);
    context.fillStyle = floatingText.color;
    context.fillText(floatingText.text, floatingText.x, floatingText.y);
  }
  context.globalAlpha = 1;
  context.textAlign = 'left';
}

export function drawGame(context: GameContext, frame: GameFrame, view: GameView): void {
  const area: DrawArea = { context, view, frame };
  const { shakeSeconds } = frame.effects;
  const isShaking = shakeSeconds > 0;
  context.save();
  if (isShaking) {
    const amplitude = shakeSeconds * SHAKE_PIXELS_PER_SECOND;
    context.translate(
      randomBetween(frame.random, -amplitude, amplitude),
      randomBetween(frame.random, -amplitude, amplitude),
    );
  }
  drawBackground(area);
  drawEntities(area);
  drawShots(area);
  drawDrone(area);
  drawEffects(area);
  context.restore();
}
