import { useEffect, useEffectEvent, useRef } from 'react';
import { Button } from '@/components/Button';
import { VisuallyHidden } from '@/components/VisuallyHidden';
import { loaderContent } from '@/content/loader';
import { useStageLayout } from '../hooks/use-stage-layout';
import type { LoaderFrame } from '../lib/loader-frame';
import { LoadingScreen } from './LoadingScreen';

const PROGRESS_MIN = 0;
const PROGRESS_MAX = 100;

type LoaderOverlayProps = {
  frame: LoaderFrame;
  percent: number;
  isSceneReady: boolean;
  onSkip: () => void;
};

export function LoaderOverlay({ frame, percent, isSceneReady, onSkip }: LoaderOverlayProps) {
  const layout = useStageLayout();
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') onSkip();
    if (event.key === 'Tab') {
      event.preventDefault();
      skipButtonRef.current?.focus();
    }
  });

  useEffect(() => {
    skipButtonRef.current?.focus();
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={loaderContent.progressLabel}
      className="fixed inset-0 z-(--z-loader) [:root[data-loader-seen]_&]:hidden"
    >
      <div aria-hidden="true">
        <LoadingScreen
          frame={frame}
          percent={percent}
          isSceneReady={isSceneReady}
          layout={layout}
        />
      </div>
      <VisuallyHidden
        as="div"
        role="progressbar"
        aria-label={loaderContent.progressLabel}
        aria-valuemin={PROGRESS_MIN}
        aria-valuemax={PROGRESS_MAX}
        aria-valuenow={percent}
      />
      <Button
        ref={skipButtonRef}
        variant="secondary"
        onClick={onSkip}
        className="absolute top-[5%] right-[5%] font-mono text-loader-label tracking-loader-label"
        style={{ opacity: frame.hud.opacity }}
      >
        {loaderContent.skipLabel}
      </Button>
    </div>
  );
}
