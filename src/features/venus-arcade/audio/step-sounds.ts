import { getCountdownLabel } from '../session/countdown';
import type { StepEvents } from '../session/advance-session';
import type { GameSession } from '../session/session';
import type { SoundName } from './sound-specs';

const SHOOT_EVERY_NTH_SHOT = 2;

type StepSoundsInput = {
  before: GameSession;
  after: GameSession;
  events: StepEvents;
  shotCount: number;
};

type StepSounds = { sounds: SoundName[]; shotCount: number };

function getCountdownSound(before: GameSession, after: GameSession): SoundName | null {
  if (before.phase === 'title' && after.phase === 'countdown') return 'blip';
  if (before.phase !== 'countdown') return null;
  const beforeLabel = getCountdownLabel(before.countdownSeconds);
  const afterLabel = after.phase === 'countdown' ? getCountdownLabel(after.countdownSeconds) : 'GO';
  if (beforeLabel === afterLabel) return null;
  return afterLabel === 'GO' ? 'pick' : 'blip';
}

function getEndSound(before: GameSession, after: GameSession): SoundName | null {
  const justEnded = before.phase !== 'ending' && after.phase === 'ending';
  if (!justEnded) return null;
  return after.end === 'crash' ? 'hit' : 'end';
}

export function getStepSounds({ before, after, events, shotCount }: StepSoundsInput): StepSounds {
  const sounds: SoundName[] = [];
  let nextShotCount = shotCount;
  if (events.hasFired) {
    if (shotCount % SHOOT_EVERY_NTH_SHOT === 0) sounds.push('shoot');
    nextShotCount += 1;
  }
  if (events.awards.length > 0) sounds.push('kill');
  if (events.hasHurt) sounds.push('hit');
  if (events.collectedPatches.length > 0) sounds.push('pick');
  const countdownSound = getCountdownSound(before, after);
  if (countdownSound !== null) sounds.push(countdownSound);
  const endSound = getEndSound(before, after);
  if (endSound !== null) sounds.push(endSound);
  return { sounds, shotCount: nextShotCount };
}
