import { vi } from 'vitest';

export function stubReducedMotion(isReduced: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: isReduced && query.includes('reduce'),
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
}
