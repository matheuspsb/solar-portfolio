export function isValidStep(deltaSeconds: number): boolean {
  return Number.isFinite(deltaSeconds) && deltaSeconds > 0;
}
