import { arcadeContent } from '@/content/arcade';
import { arcadeTokens } from '@/styles/arcade-tokens';
import {
  BEETLE_BURST_COUNT,
  DEFAULT_BURST_COUNT,
  HURT_BURST_COUNT,
  LEAK_TEXT_BASE_OFFSET,
} from '../engine/constants';
import type { Random } from '../engine/random';
import type { Award } from '../engine/scoring';
import type { StepEvents } from '../session/advance-session';
import type { GameSession } from '../session/session';
import { addBurst, addFloatingText, addShake } from './effects';
import type { Effects } from './effects';

const { floating } = arcadeContent.game;

type StepEffectsInput = {
  effects: Effects;
  before: GameSession;
  after: GameSession;
  events: StepEvents;
  random: Random;
  reducedMotion: boolean;
};

const AWARD_COLORS: Record<Award['kind'], string> = {
  crawler: arcadeTokens.crawlerColor,
  beetle: arcadeTokens.beetleColor,
  data: arcadeTokens.dataColor,
};

function addAward(effects: Effects, award: Award, random: Random): Effects {
  const textColor = award.multiplier > 1 ? arcadeTokens.droneColor : arcadeTokens.phosphorColor;
  const count = award.kind === 'beetle' ? BEETLE_BURST_COUNT : DEFAULT_BURST_COUNT;
  const burst = addBurst(
    effects,
    { x: award.x, y: award.y, color: AWARD_COLORS[award.kind], count },
    random,
  );
  return addFloatingText(burst, {
    text: `+${award.points}`,
    x: award.x,
    y: award.y - award.radius,
    color: textColor,
  });
}

export function applyStepEffects({
  effects,
  before,
  after,
  events,
  random,
  reducedMotion,
}: StepEffectsInput): Effects {
  let current = effects;

  for (const award of events.awards) current = addAward(current, award, random);

  if (events.hasHurt) {
    current = addBurst(
      current,
      {
        x: after.drone.x,
        y: after.drone.y,
        color: arcadeTokens.glitchColor,
        count: HURT_BURST_COUNT,
      },
      random,
    );
    if (!reducedMotion) current = addShake(current);
  }

  const [firstLeakX] = events.leakedXs;
  if (firstLeakX !== undefined && before.stats.combo > 0) {
    current = addFloatingText(current, {
      text: floating.leak,
      x: firstLeakX,
      y: after.field.height - LEAK_TEXT_BASE_OFFSET,
      color: arcadeTokens.glitchColor,
    });
  }

  const restoredIntegrity = after.stats.integrity > before.stats.integrity;
  for (const patch of events.collectedPatches) {
    current = addFloatingText(current, {
      text: restoredIntegrity ? floating.integrity : floating.bonus,
      x: patch.x,
      y: patch.y,
      color: arcadeTokens.droneColor,
    });
  }

  return current;
}
