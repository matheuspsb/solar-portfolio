const SINGLE_ITEM_DEGREES = 138;
const FIRST_ITEM_DEGREES = 100;
const LAST_ITEM_DEGREES = 170;
const FIRST_DELAY_SECONDS = 0.1;
const DELAY_STEP_SECONDS = 0.08;
const DEGREES_PER_HALF_TURN = 180;
const MIN_CODE_DIGITS = 3;
const MAX_RADIUS_PIXELS = 200;
const MIN_RADIUS_PIXELS = 120;
/** Room kept for the anchor's distance from the edge, the label card and a safety margin. */
const HORIZONTAL_RESERVE_PIXELS = 180;

type OrbitPositionsInput = {
  count: number;
  radius: number;
};

type OrbitPosition = { x: number; y: number };

/** Rounds and avoids negative zero, which `toEqual`/`Object.is` would tell apart from zero. */
const toPixels = (value: number): number => Math.round(value) + 0;

function getItemDegrees(index: number, count: number): number {
  if (count === 1) return SINGLE_ITEM_DEGREES;
  const progress = index / (count - 1);
  return FIRST_ITEM_DEGREES + (LAST_ITEM_DEGREES - FIRST_ITEM_DEGREES) * progress;
}

/**
 * Offsets (in px, y pointing down) from the menu anchor to each destination, on the lower-left
 * arc of a circle so the items stay on screen when the anchor sits in the top-right corner.
 */
export function getOrbitPositions({ count, radius }: OrbitPositionsInput): OrbitPosition[] {
  if (!(count > 0)) return [];
  const itemCount = Math.floor(count);
  const safeRadius = Number.isFinite(radius) && radius > 0 ? radius : 0;

  return Array.from({ length: itemCount }, (__, index) => {
    const radians = (getItemDegrees(index, itemCount) * Math.PI) / DEGREES_PER_HALF_TURN;
    return {
      x: toPixels(safeRadius * Math.cos(radians)),
      y: toPixels(safeRadius * Math.sin(radians)),
    };
  });
}

/** Staggers the entrance of each destination so they seem to fall into orbit one by one. */
export function getOrbitDelaySeconds(index: number): number {
  const safeIndex = Number.isFinite(index) && index > 0 ? index : 0;
  return FIRST_DELAY_SECONDS + safeIndex * DELAY_STEP_SECONDS;
}

/** "OBJ-001": the telemetry-style catalog number shown next to each destination. */
export function formatObjectCode(index: number): string {
  const safeIndex = Number.isFinite(index) && index > 0 ? Math.floor(index) : 0;
  return `OBJ-${String(safeIndex + 1).padStart(MIN_CODE_DIGITS, '0')}`;
}

/** The arc radius for a viewport: full size when there is room, smaller on narrow phones. */
export function getOrbitRadius(viewportWidth: number): number {
  if (Number.isNaN(viewportWidth)) return MIN_RADIUS_PIXELS;
  const available = viewportWidth - HORIZONTAL_RESERVE_PIXELS;
  return Math.min(MAX_RADIUS_PIXELS, Math.max(MIN_RADIUS_PIXELS, available));
}
