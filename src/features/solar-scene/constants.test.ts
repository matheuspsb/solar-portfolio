import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { PANEL_WIDTH_PIXELS } from './constants';

const ROOT_FONT_SIZE_PIXELS = 16;

it('matches the --size-panel-width CSS token', () => {
  const css = readFileSync(join(__dirname, '../../design-system/tokens/tokens.css'), 'utf8');
  const match = css.match(/--size-panel-width: *([0-9.]+)rem *;/);
  expect(match).not.toBeNull();
  expect(Number(match![1]) * ROOT_FONT_SIZE_PIXELS).toBe(PANEL_WIDTH_PIXELS);
});
