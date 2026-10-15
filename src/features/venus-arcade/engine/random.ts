export type Random = () => number;

export function randomBetween(random: Random, minimum: number, maximum: number): number {
  return minimum + random() * (maximum - minimum);
}

export function pickOne<Item>(random: Random, items: readonly Item[]): Item {
  const index = Math.min(items.length - 1, Math.floor(random() * items.length));
  return items[index] as Item;
}
