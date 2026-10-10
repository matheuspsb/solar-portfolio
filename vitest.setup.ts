import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { LOADER_SEEN_KEY } from './src/lib/loader-seen';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

HTMLCanvasElement.prototype.getContext = () => null;

beforeEach(() => {
  sessionStorage.setItem(LOADER_SEEN_KEY, '1');
});

afterEach(() => {
  cleanup();
});
