import { loaderTokens } from '@/styles/loader-tokens';
import { STAGE_CENTER_X, STAGE_CENTER_Y } from '../lib/loader-frame';
import type { LoaderFrame } from '../lib/loader-frame';
import { withAlpha } from '../lib/with-alpha';

const WARM_WIDTH = 1400;
const WARM_HEIGHT = 760;
const COOL_WIDTH = 1000;
const COOL_HEIGHT = 600;
const COOL_OFFSET_X = 900;
const COOL_OFFSET_Y = 300;
const COOL_OPACITY_SHARE = 0.8;
const NEBULA_CORE_ALPHA = 0.2;
const NEBULA_EDGE_ALPHA = 0.05;
const NEBULA_EDGE_STOP = '55%';

type LoaderNebulaProps = { nebula: LoaderFrame['nebula'] };

export function LoaderNebula({ nebula }: LoaderNebulaProps) {
  const warmGradient = `radial-gradient(closest-side, ${withAlpha(loaderTokens.nebulaWarmColor, NEBULA_CORE_ALPHA)}, ${withAlpha(loaderTokens.nebulaWarmColor, NEBULA_EDGE_ALPHA)} ${NEBULA_EDGE_STOP}, transparent)`;
  const coolGradient = `radial-gradient(closest-side, ${withAlpha(loaderTokens.nebulaCoolColor, NEBULA_CORE_ALPHA)}, transparent)`;

  return (
    <>
      <div
        className="absolute rounded-(--radius-ellipse)"
        style={{
          left: STAGE_CENTER_X - WARM_WIDTH / 2,
          top: STAGE_CENTER_Y - WARM_HEIGHT / 2,
          width: WARM_WIDTH,
          height: WARM_HEIGHT,
          background: warmGradient,
          opacity: nebula.opacity,
          transform: `rotate(${nebula.warmRotationDegrees}deg) scale(${nebula.warmScale})`,
        }}
      />
      <div
        className="absolute rounded-(--radius-ellipse)"
        style={{
          left: STAGE_CENTER_X - COOL_OFFSET_X,
          top: STAGE_CENTER_Y - COOL_OFFSET_Y,
          width: COOL_WIDTH,
          height: COOL_HEIGHT,
          background: coolGradient,
          opacity: nebula.opacity * COOL_OPACITY_SHARE,
          transform: `rotate(${nebula.coolRotationDegrees}deg)`,
        }}
      />
    </>
  );
}
