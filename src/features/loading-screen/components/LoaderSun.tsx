import { loaderTokens } from '@/styles/loader-tokens';
import { STAGE_CENTER_X, STAGE_CENTER_Y, STAGE_HEIGHT, STAGE_WIDTH } from '../lib/loader-frame';
import type { RayMark, SunMark } from '../lib/sun-marks';
import { withAlpha } from '../lib/with-alpha';

const HALO_SPAN_RATIO = 3;
const HALO_FADE_ALPHA = 0.08;
const HALO_FADE_STOP = '60%';
const BODY_HIGHLIGHT_STOP = '22%';
const BODY_BODY_STOP = '55%';
const BODY_SHADOW_STOP = '88%';
const GLOW_BLUR_RATIO = 0.6;
const GLOW_SPREAD_RATIO = 0.12;
const GLOW_ALPHA = 0.53;
const INNER_SHADOW_OFFSET_X_RATIO = 0.12;
const INNER_SHADOW_OFFSET_Y_RATIO = 0.14;
const INNER_SHADOW_BLUR_RATIO = 0.3;
const INNER_SHADOW_ALPHA = 0.6;

type LoaderSunProps = {
  sun: SunMark;
  rays: readonly RayMark[];
};

export function LoaderSun({ sun, rays }: LoaderSunProps) {
  const { radius } = sun;
  const haloBackground = `radial-gradient(closest-side, ${withAlpha(loaderTokens.sunHaloColor, sun.haloStrength)}, ${withAlpha(loaderTokens.sunHaloColor, HALO_FADE_ALPHA)} ${HALO_FADE_STOP}, transparent)`;
  const bodyBackground = `radial-gradient(circle at ${sun.lightX}% ${sun.lightY}%, ${loaderTokens.sunHighlightColor}, ${loaderTokens.sunLightColor} ${BODY_HIGHLIGHT_STOP}, ${loaderTokens.sunBodyColor} ${BODY_BODY_STOP}, ${loaderTokens.sunShadowColor} ${BODY_SHADOW_STOP})`;
  const bodyShadow = `0 0 ${radius * GLOW_BLUR_RATIO}px ${radius * GLOW_SPREAD_RATIO}px ${withAlpha(loaderTokens.sunBodyColor, GLOW_ALPHA)}, inset -${radius * INNER_SHADOW_OFFSET_X_RATIO}px -${radius * INNER_SHADOW_OFFSET_Y_RATIO}px ${radius * INNER_SHADOW_BLUR_RATIO}px ${withAlpha(loaderTokens.sunInnerShadowColor, INNER_SHADOW_ALPHA)}`;

  return (
    <>
      <div
        className="absolute rounded-(--radius-ellipse)"
        style={{
          left: STAGE_CENTER_X - radius * HALO_SPAN_RATIO,
          top: STAGE_CENTER_Y - radius * HALO_SPAN_RATIO,
          width: radius * HALO_SPAN_RATIO * 2,
          height: radius * HALO_SPAN_RATIO * 2,
          background: haloBackground,
          opacity: sun.haloOpacity,
        }}
      />
      <svg width={STAGE_WIDTH} height={STAGE_HEIGHT} className="absolute top-0 left-0">
        {rays.map((ray, index) => (
          <line
            key={index}
            x1={ray.fromX}
            y1={ray.fromY}
            x2={ray.toX}
            y2={ray.toY}
            stroke={loaderTokens.rayColor}
            strokeWidth={ray.width}
            strokeLinecap="round"
            opacity={ray.opacity}
          />
        ))}
      </svg>
      <div
        className="absolute rounded-(--radius-ellipse)"
        style={{
          left: STAGE_CENTER_X - radius,
          top: STAGE_CENTER_Y - radius,
          width: radius * 2,
          height: radius * 2,
          background: bodyBackground,
          boxShadow: bodyShadow,
        }}
      />
    </>
  );
}
