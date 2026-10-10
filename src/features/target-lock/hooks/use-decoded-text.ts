import { useEffect, useState } from 'react';
import { maskText, scrambleText } from '../lib/scramble-text';

const DECODE_TICK_MS = 30;
const TICKS_PER_LETTER = 2;

type DecodedTextOptions = {
  isEnabled: boolean;
  random?: () => number;
};

type Decoded = { text: string; value: string };

export function useDecodedText(
  text: string,
  { isEnabled, random = Math.random }: DecodedTextOptions,
): string {
  const [decoded, setDecoded] = useState<Decoded>({ text, value: maskText(text) });

  useEffect(() => {
    if (!isEnabled) return;
    let ticks = 0;
    const timer = setInterval(() => {
      ticks += 1;
      const revealedCount = Math.floor(ticks / TICKS_PER_LETTER);
      setDecoded({ text, value: scrambleText({ text, revealedCount, random }) });
      if (revealedCount >= text.length) clearInterval(timer);
    }, DECODE_TICK_MS);
    return () => clearInterval(timer);
  }, [text, isEnabled, random]);

  if (!isEnabled) return text;
  return decoded.text === text ? decoded.value : maskText(text);
}
