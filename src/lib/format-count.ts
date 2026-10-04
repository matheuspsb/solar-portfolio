/** "1 corpo" / "6 corpos": the stack items are playfully called celestial bodies. */
export function formatBodyCount(count: number): string {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  return `${safeCount} ${safeCount === 1 ? 'corpo' : 'corpos'}`;
}
