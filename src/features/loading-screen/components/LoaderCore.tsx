import { loaderTokens } from '@/styles/loader-tokens';
import { STAGE_CENTER_X, STAGE_CENTER_Y } from '../lib/loader-frame';
import type { CoreMark } from '../lib/sun-marks';
import { withAlpha } from '../lib/with-alpha';

const GLOW_HALF_SPAN = 5;
const FLARE_HALF_LENGTH = 70;
const FLARE_THICKNESS = 2;
const FLARE_HORIZONTAL_OPACITY = 0.6;
const FLARE_VERTICAL_HALF_LENGTH = 24;
const FLARE_VERTICAL_OPACITY = 0.45;
const FLARE_HORIZONTAL_EDGE_ALPHA = 0.6;
const FLARE_VERTICAL_EDGE_ALPHA = 0.53;
const GLOW_RING_ALPHA = 0.33;
const GLOW_EDGE_STOP = '18%';
const GLOW_FADE_STOP = '45%';

type LoaderCoreProps = { core: CoreMark };

export function LoaderCore({ core }: LoaderCoreProps) {
  const { radius, flicker } = core;
  const scaled = radius * flicker;
  const horizontalEdge = withAlpha(loaderTokens.coreEdgeColor, FLARE_HORIZONTAL_EDGE_ALPHA);
  const verticalEdge = withAlpha(loaderTokens.coreEdgeColor, FLARE_VERTICAL_EDGE_ALPHA);

  return (
    <>
      <div
        className="absolute rounded-ellipse"
        style={{
          left: STAGE_CENTER_X - scaled * GLOW_HALF_SPAN,
          top: STAGE_CENTER_Y - scaled * GLOW_HALF_SPAN,
          width: scaled * GLOW_HALF_SPAN * 2,
          height: scaled * GLOW_HALF_SPAN * 2,
          background: `radial-gradient(closest-side, ${loaderTokens.coreColor}, ${loaderTokens.coreEdgeColor} ${GLOW_EDGE_STOP}, ${withAlpha(loaderTokens.coreGlowColor, GLOW_RING_ALPHA)} ${GLOW_FADE_STOP}, transparent)`,
        }}
      />
      <div
        className="absolute"
        style={{
          left: STAGE_CENTER_X - scaled * FLARE_HALF_LENGTH,
          top: STAGE_CENTER_Y - FLARE_THICKNESS / 2,
          width: scaled * FLARE_HALF_LENGTH * 2,
          height: FLARE_THICKNESS,
          background: `linear-gradient(90deg, transparent, ${horizontalEdge}, ${loaderTokens.coreColor}, ${horizontalEdge}, transparent)`,
          opacity: FLARE_HORIZONTAL_OPACITY,
        }}
      />
      <div
        className="absolute"
        style={{
          left: STAGE_CENTER_X - FLARE_THICKNESS / 2,
          top: STAGE_CENTER_Y - scaled * FLARE_VERTICAL_HALF_LENGTH,
          width: FLARE_THICKNESS,
          height: scaled * FLARE_VERTICAL_HALF_LENGTH * 2,
          background: `linear-gradient(180deg, transparent, ${verticalEdge}, ${loaderTokens.coreColor}, ${verticalEdge}, transparent)`,
          opacity: FLARE_VERTICAL_OPACITY,
        }}
      />
    </>
  );
}
