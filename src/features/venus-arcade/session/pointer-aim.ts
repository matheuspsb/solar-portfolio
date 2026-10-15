type Point = { x: number; y: number };

type AimInput = { pointerType: string; point: Point; drag: Point | null };

export function startDrag(dronePosition: Point, point: Point): Point {
  return { x: dronePosition.x - point.x, y: dronePosition.y - point.y };
}

export function aimFromPointer({ pointerType, point, drag }: AimInput): Point | null {
  if (pointerType === 'mouse') return point;
  if (drag === null) return null;
  return { x: point.x + drag.x, y: point.y + drag.y };
}
