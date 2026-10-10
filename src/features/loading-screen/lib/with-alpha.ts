import { clamp01 } from './easing';

const CHANNEL_MAX = 255;
const HEX_RADIX = 16;
const HEX_DIGITS_PER_CHANNEL = 2;

export function withAlpha(hexColor: string, alpha: number): string {
  const channel = Math.round(clamp01(alpha) * CHANNEL_MAX)
    .toString(HEX_RADIX)
    .padStart(HEX_DIGITS_PER_CHANNEL, '0');
  return `${hexColor}${channel}`;
}
