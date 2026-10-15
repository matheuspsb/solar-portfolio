import { useMediaQuery } from './use-media-query';
import type { MediaQueryListLike, MediaQueryProvider } from './use-media-query';

export type { MediaQueryListLike };

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(getMediaQuery?: MediaQueryProvider): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY, getMediaQuery);
}
