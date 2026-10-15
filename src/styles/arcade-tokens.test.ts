import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { arcadeTokens } from './arcade-tokens';

const css = readFileSync(join(__dirname, 'tokens.css'), 'utf8');

const MINIMUM_TEXT_CONTRAST = 4.5;

function readCssColor(name: string): string {
  const match = css.match(new RegExp(`--color-${name}: *(#[0-9a-fA-F]{6}) *;`));
  if (!match) throw new Error(`token --color-${name} not found as a hex color in tokens.css`);
  return match[1]!.toLowerCase();
}

function getLuminance(hex: string): number {
  const [red, green, blue] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function getContrast(foreground: string, background: string): number {
  const [lighter, darker] = [getLuminance(foreground), getLuminance(background)].sort(
    (first, second) => second - first,
  ) as [number, number];
  return (lighter + 0.05) / (darker + 0.05);
}

describe('arcade tokens', () => {
  it.each([
    ['screenColor', 'arcade-screen'],
    ['gridColor', 'arcade-grid'],
    ['laneColor', 'arcade-lane'],
    ['dataPanelColor', 'arcade-data-panel'],
    ['flashColor', 'arcade-flash'],
    ['crawlerColor', 'venus-amber'],
    ['beetleColor', 'venus-burnt'],
    ['dataColor', 'ember-400'],
    ['glitchColor', 'venus-alert'],
    ['glitchGhostColor', 'nebula-300'],
    ['droneColor', 'arcade-ink-100'],
    ['hotfixDroneColor', 'venus-root'],
    ['phosphorColor', 'venus-phosphor'],
    ['shotColor', 'venus-bolt'],
    ['shotGlowColor', 'ember-400'],
    ['spriteDetailColor', 'cartridge-ink'],
    ['cartridgeSpriteColor', 'cartridge-sprite'],
  ] as const)('%s mirrors the CSS token --color-%s', (tokenKey, cssName) => {
    expect(arcadeTokens[tokenKey].toLowerCase()).toBe(readCssColor(cssName));
  });

  it.each([
    'arcade-ink-100',
    'arcade-ink-200',
    'arcade-ink-300',
    'venus-phosphor',
    'venus-root',
    'venus-copper',
    'venus-alert',
    'venus-burnt',
    'ember-400',
  ])('keeps the text color %s readable on the screen background', (name) => {
    expect(getContrast(readCssColor(name), readCssColor('arcade-screen'))).toBeGreaterThanOrEqual(
      MINIMUM_TEXT_CONTRAST,
    );
  });

  it('keeps the dark text of the primary button readable on its gold background', () => {
    expect(getContrast(readCssColor('on-ember'), readCssColor('ember-400'))).toBeGreaterThanOrEqual(
      MINIMUM_TEXT_CONTRAST,
    );
  });
});
