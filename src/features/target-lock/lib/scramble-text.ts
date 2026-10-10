export const SCRAMBLE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*+';

const MASK_CHARACTER = '#';

type ScrambleInput = {
  text: string;
  revealedCount: number;
  random: () => number;
};

function pickCharacter(random: () => number): string {
  const index = Math.min(
    SCRAMBLE_CHARACTERS.length - 1,
    Math.floor(random() * SCRAMBLE_CHARACTERS.length),
  );
  return SCRAMBLE_CHARACTERS.charAt(index);
}

export function scrambleText({ text, revealedCount, random }: ScrambleInput): string {
  const revealed = revealedCount > 0 ? revealedCount : 0;
  return Array.from(text, (character, index) =>
    index < revealed || character === ' ' ? character : pickCharacter(random),
  ).join('');
}

export function maskText(text: string): string {
  return Array.from(text, (character) => (character === ' ' ? character : MASK_CHARACTER)).join('');
}
