import {
  COUNTDOWN_ONE_THRESHOLD_SECONDS,
  COUNTDOWN_THREE_THRESHOLD_SECONDS,
  COUNTDOWN_TWO_THRESHOLD_SECONDS,
} from '../engine/constants';

export type CountdownLabel = '3' | '2' | '1' | 'GO';

export function getCountdownLabel(secondsLeft: number): CountdownLabel {
  if (secondsLeft > COUNTDOWN_THREE_THRESHOLD_SECONDS) return '3';
  if (secondsLeft > COUNTDOWN_TWO_THRESHOLD_SECONDS) return '2';
  if (secondsLeft > COUNTDOWN_ONE_THRESHOLD_SECONDS) return '1';
  return 'GO';
}
