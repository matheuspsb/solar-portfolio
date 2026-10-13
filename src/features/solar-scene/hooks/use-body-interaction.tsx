'use client';

import { useCursor } from '@react-three/drei';
import { createContext, use, useState } from 'react';
import type { ReactNode } from 'react';
import type { Highlight } from '@/domain/interaction-state';
import { getHighlightEasingRate } from '../lib/motion';

type BodyInteractionScene = {
  highlightOf: (id: string) => Highlight;
  onHoverChange: (id: string, isHovered: boolean) => void;
  onSelect: (id: string) => void;
  prefersReducedMotion: boolean;
};

export type BodyInteraction = {
  highlight: Highlight;
  highlightEasingRate: number;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onSelect: () => void;
};

const BodyInteractionContext = createContext<BodyInteractionScene | null>(null);

type BodyInteractionProviderProps = BodyInteractionScene & { children: ReactNode };

export function BodyInteractionProvider({ children, ...scene }: BodyInteractionProviderProps) {
  return <BodyInteractionContext value={scene}>{children}</BodyInteractionContext>;
}

function useBodyInteractionScene(): BodyInteractionScene {
  const scene = use(BodyInteractionContext);
  if (scene === null) {
    throw new Error('Celestial bodies must be rendered inside a BodyInteractionProvider');
  }
  return scene;
}

export function useScenePrefersReducedMotion(): boolean {
  return useBodyInteractionScene().prefersReducedMotion;
}

export function useBodyHighlight(id: string): Highlight {
  return useBodyInteractionScene().highlightOf(id);
}

export function useBodyInteraction(id: string): BodyInteraction {
  const scene = useBodyInteractionScene();
  const [isPointerOver, setIsPointerOver] = useState(false);
  useCursor(isPointerOver);

  const changeHover = (isHovered: boolean) => {
    setIsPointerOver(isHovered);
    scene.onHoverChange(id, isHovered);
  };

  return {
    highlight: scene.highlightOf(id),
    highlightEasingRate: getHighlightEasingRate(scene.prefersReducedMotion),
    onPointerOver: () => changeHover(true),
    onPointerOut: () => changeHover(false),
    onSelect: () => scene.onSelect(id),
  };
}
