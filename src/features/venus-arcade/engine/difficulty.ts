import { clamp } from '@/lib/math';
import { MATCH_DURATION_SECONDS } from './constants';

export function getDifficulty(elapsedSeconds: number): number {
  return clamp(elapsedSeconds / MATCH_DURATION_SECONDS, 0, 1);
}
