import { arcadeContent } from '@/content/arcade';

export type Rank = (typeof arcadeContent.ranks)[number];

export function getRank(score: number): Rank {
  const safeScore = Number.isNaN(score) ? 0 : score;
  const reached = arcadeContent.ranks.filter((rank) => safeScore >= rank.minimumScore);
  return reached[reached.length - 1] ?? arcadeContent.ranks[0];
}
