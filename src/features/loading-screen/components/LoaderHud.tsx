import { loaderContent } from '@/content/loader';
import type { HudMarks } from '../lib/hud-marks';

const PERCENT_DIGITS = 3;
const TRACK_HEAD_GLOW_PIXELS = 160;
const STAGE_RISE_PIXELS = 10;
const STAGE_BLUR_PIXELS = 4;

type LoaderHudProps = {
  hud: HudMarks;
  percent: number;
  isSceneReady: boolean;
};

function getStageName(stageIndex: number, stageCount: number, isSceneReady: boolean): string {
  const isLastStage = stageIndex === stageCount;
  if (isLastStage && !isSceneReady) return loaderContent.waitingStageName;
  return loaderContent.stageNames[stageIndex - 1] ?? loaderContent.waitingStageName;
}

export function LoaderHud({ hud, percent, isSceneReady }: LoaderHudProps) {
  const stageName = getStageName(hud.stageIndex, hud.stageCount, isSceneReady);
  const stageLabel = `${String(hud.stageIndex).padStart(2, '0')}/${String(hud.stageCount).padStart(2, '0')}`;

  return (
    <div style={{ opacity: hud.opacity }}>
      <div className="absolute top-[6%] left-[5%] flex items-center gap-3 font-mono text-loader-label tracking-loader-brand text-ink-300">
        <span
          className="size-2.5 rounded-(--radius-ellipse) bg-ember-400 shadow-dot"
          style={{ opacity: hud.dotOpacity }}
        />
        <span>{loaderContent.brand}</span>
      </div>
      <div className="absolute inset-x-[5%] top-[84%] flex justify-end font-mono">
        <span className="flex items-baseline gap-1.5 text-ink-100">
          <span className="text-loader-percent font-medium tabular-nums">
            {String(percent).padStart(PERCENT_DIGITS, '0')}
          </span>
          <span className="text-loader-label text-ink-300">%</span>
        </span>
      </div>
      <div className="absolute inset-x-[5%] top-[92%] h-px bg-ink-100/12">
        <div
          className="relative h-[3px] -translate-y-px rounded-xs bg-linear-to-r from-nebula-300/35 to-ember-400"
          style={{ width: `${percent}%` }}
        >
          <div
            className="absolute top-[-2px] right-0 h-[7px] rounded-sm bg-linear-to-r from-transparent to-ember-300/40"
            style={{ width: TRACK_HEAD_GLOW_PIXELS }}
          />
          <div className="absolute top-1/2 right-0 size-3.5 translate-x-1/2 -translate-y-1/2 rounded-(--radius-ellipse) bg-white shadow-ember-planet" />
        </div>
      </div>
      <div className="absolute top-[94.5%] left-[5%] flex items-center gap-4 font-mono text-loader-label tracking-loader-label text-ink-200">
        <span className="text-ember-400">{stageLabel}</span>
        <span
          className="uppercase"
          style={{
            opacity: hud.stageOpacity,
            transform: `translateY(${(1 - hud.stageOpacity) * STAGE_RISE_PIXELS}px)`,
            filter: `blur(${(1 - hud.stageOpacity) * STAGE_BLUR_PIXELS}px)`,
          }}
        >
          {stageName}
        </span>
      </div>
    </div>
  );
}
