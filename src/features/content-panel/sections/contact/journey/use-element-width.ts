import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export function useElementWidth<ElementType extends HTMLElement>(): [
  RefObject<ElementType | null>,
  number,
] {
  const elementRef = useRef<ElementType>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [elementRef, width];
}
