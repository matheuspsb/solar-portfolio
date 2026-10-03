// Use case: the 3D scene and the HTML interface must share the same palette. The scene reads JS
// constants while the interface reads CSS variables; if they drift, the Sun's glow, the focus ring
// and the page background would stop matching between canvas and DOM.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { sceneTokens } from './scene-tokens';

const css = readFileSync(join(__dirname, 'tokens.css'), 'utf8');

function readCssColor(name: string): string {
  const match = css.match(new RegExp(`--color-${name}: *(#[0-9a-fA-F]{6}) *;`));
  if (!match) throw new Error(`token --color-${name} not found as a hex color in tokens.css`);
  return match[1]!.toLowerCase();
}

describe('scene tokens', () => {
  it.each([
    ['backgroundColor', 'space-950'],
    ['sunCoreColor', 'sun-400'],
    ['sunGlowColor', 'sun-500'],
    ['focusRingColor', 'focus-ring'],
  ] as const)('%s matches the CSS token --color-%s', (sceneKey, cssName) => {
    expect(sceneTokens[sceneKey].toLowerCase()).toBe(readCssColor(cssName));
  });

  it('only contains valid hex colors', () => {
    for (const color of Object.values(sceneTokens)) expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
