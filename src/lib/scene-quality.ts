type QualityTier = 'low' | 'medium' | 'high';

export type SceneQuality = {
  tier: QualityTier;
  starCount: number;
  maxPixelRatio: number;
};

const MEDIUM_MIN_WIDTH = 768;
const HIGH_MIN_WIDTH = 1200;

const qualityByTier: Record<QualityTier, SceneQuality> = {
  low: { tier: 'low', starCount: 900, maxPixelRatio: 1.5 },
  medium: { tier: 'medium', starCount: 1600, maxPixelRatio: 1.75 },
  high: { tier: 'high', starCount: 2600, maxPixelRatio: 2 },
};

export function getSceneQuality(viewportWidth: number): SceneQuality {
  if (Number.isNaN(viewportWidth) || viewportWidth <= 0) return qualityByTier.low;
  if (viewportWidth >= HIGH_MIN_WIDTH) return qualityByTier.high;
  if (viewportWidth >= MEDIUM_MIN_WIDTH) return qualityByTier.medium;
  return qualityByTier.low;
}
