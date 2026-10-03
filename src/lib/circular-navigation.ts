export type NavigationDirection = 'next' | 'previous';

export function getAdjacentId(
  ids: readonly string[],
  currentId: string | null,
  direction: NavigationDirection,
): string | null {
  if (ids.length === 0) return null;

  const currentIndex = currentId === null ? -1 : ids.indexOf(currentId);
  const lastIndex = ids.length - 1;

  if (currentIndex === -1) return ids[direction === 'next' ? 0 : lastIndex] ?? null;

  const step = direction === 'next' ? 1 : -1;
  const nextIndex = (currentIndex + step + ids.length) % ids.length;
  return ids[nextIndex] ?? null;
}
