import type { ReactNode } from 'react';
import { vi } from 'vitest';
import type { Highlight } from '@/domain/interaction-state';
import { BodyInteractionProvider } from '../hooks/use-body-interaction';

type FakeSceneOptions = {
  highlights?: Record<string, Highlight>;
  prefersReducedMotion?: boolean;
};

export function createFakeScene({
  highlights = {},
  prefersReducedMotion = false,
}: FakeSceneOptions = {}) {
  return {
    highlightOf: (id: string): Highlight => highlights[id] ?? 'none',
    onHoverChange: vi.fn<(id: string, isHovered: boolean) => void>(),
    onSelect: vi.fn<(id: string) => void>(),
    prefersReducedMotion,
  };
}

export type FakeScene = ReturnType<typeof createFakeScene>;

export function inScene(element: ReactNode, scene: FakeScene = createFakeScene()) {
  return <BodyInteractionProvider {...scene}>{element}</BodyInteractionProvider>;
}
