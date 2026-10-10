import type { TargetingAnchor } from '@/lib/celestial-body';
import type { ScreenFrame } from '@/lib/screen-frame';

export const TARGET_CARD_SIZE = { width: 176, height: 92 } as const;
export const EDGE_MARGIN = 12;

const DIAGONAL_COMPONENT = Math.SQRT1_2;
const ORIGIN_DISTANCE_FACTOR = 1.17;
const ELBOW_RUN_PIXELS = 30;
const ELBOW_RISE_PIXELS = 44;
const LEG_LENGTH_PIXELS = 150;
const CARD_GAP_PIXELS = 10;

type Point = { x: number; y: number };
type Direction = { horizontal: -1 | 1; vertical: -1 | 1 };
type Viewport = { width: number; height: number };

export type TelemetryLayout = {
  origin: Point;
  elbow: Point;
  end: Point;
  card: { left: number; top: number; align: 'left' | 'right' };
};

type LayoutInput = { frame: ScreenFrame; anchor: TargetingAnchor; viewport: Viewport };

const preferredDirectionByAnchor: Record<TargetingAnchor, Direction> = {
  'top-left': { horizontal: -1, vertical: -1 },
  'bottom-left': { horizontal: -1, vertical: 1 },
};

function isUsable(value: number): boolean {
  return Number.isFinite(value);
}

type CardPlacement = 'below' | 'above';

function buildLayout(
  frame: ScreenFrame,
  direction: Direction,
  placement: CardPlacement,
): TelemetryLayout {
  const { horizontal, vertical } = direction;
  const distance = frame.radius * ORIGIN_DISTANCE_FACTOR * DIAGONAL_COMPONENT;
  const origin = { x: frame.x + horizontal * distance, y: frame.y + vertical * distance };
  const elbow = {
    x: origin.x + horizontal * ELBOW_RUN_PIXELS,
    y: origin.y + vertical * ELBOW_RISE_PIXELS,
  };
  const end = { x: elbow.x + horizontal * LEG_LENGTH_PIXELS, y: elbow.y };
  const isMirrored = horizontal > 0;
  return {
    origin,
    elbow,
    end,
    card: {
      left: isMirrored ? end.x - TARGET_CARD_SIZE.width : end.x,
      top:
        placement === 'below'
          ? end.y + CARD_GAP_PIXELS
          : end.y - CARD_GAP_PIXELS - TARGET_CARD_SIZE.height,
      align: isMirrored ? 'right' : 'left',
    },
  };
}

function fitsInside(layout: TelemetryLayout, viewport: Viewport): boolean {
  const horizontalXs = [
    layout.origin.x,
    layout.elbow.x,
    layout.end.x,
    layout.card.left,
    layout.card.left + TARGET_CARD_SIZE.width,
  ];
  const verticalYs = [
    layout.origin.y,
    layout.elbow.y,
    layout.card.top,
    layout.card.top + TARGET_CARD_SIZE.height,
  ];
  return (
    horizontalXs.every((value) => value >= EDGE_MARGIN && value <= viewport.width - EDGE_MARGIN) &&
    verticalYs.every((value) => value >= EDGE_MARGIN && value <= viewport.height - EDGE_MARGIN)
  );
}

export function getTelemetryLayout({
  frame,
  anchor,
  viewport,
}: LayoutInput): TelemetryLayout | null {
  const isFrameUsable = [frame.x, frame.y, frame.radius].every(isUsable) && frame.radius > 0;
  const isViewportUsable = viewport.width > 0 && viewport.height > 0;
  if (!isFrameUsable || !isViewportUsable || !isUsable(viewport.width + viewport.height)) {
    return null;
  }

  const preferred = preferredDirectionByAnchor[anchor];
  const candidates: Direction[] = [
    preferred,
    { horizontal: (preferred.horizontal * -1) as -1 | 1, vertical: preferred.vertical },
    { horizontal: preferred.horizontal, vertical: (preferred.vertical * -1) as -1 | 1 },
    {
      horizontal: (preferred.horizontal * -1) as -1 | 1,
      vertical: (preferred.vertical * -1) as -1 | 1,
    },
  ];
  const placements: CardPlacement[] = ['below', 'above'];
  const layouts = placements.flatMap((placement) =>
    candidates.map((direction) => buildLayout(frame, direction, placement)),
  );
  return layouts.find((layout) => fitsInside(layout, viewport)) ?? layouts[0] ?? null;
}
