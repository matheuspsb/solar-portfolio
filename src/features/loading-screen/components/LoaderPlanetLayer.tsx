import { loaderTokens } from '@/styles/loader-tokens';
import { DISC_TILT_DEGREES } from '../lib/dust-marks';
import { STAGE_CENTER_X, STAGE_CENTER_Y, STAGE_HEIGHT, STAGE_WIDTH } from '../lib/loader-frame';
import type { PlanetMark, RingMark } from '../lib/planet-marks';
import type { WaveMark } from '../lib/sun-marks';

const RING_OPACITY = 0.22;
const RING_STROKE_WIDTH = 1.2;
const PATH_LENGTH = 100;
const TRAIL_WIDTH_RATIO = 0.55;
const TRAIL_OPACITY = 0.22;
const GLOW_RADIUS_RATIO = 2.4;
const GLOW_OPACITY = 0.1;
const SHINE_OFFSET_RATIO = 0.3;
const SHINE_RADIUS_RATIO = 0.45;
const SHINE_OPACITY = 0.35;
const TRAIL_DECIMALS = 1;

type LoaderPlanetLayerProps = {
  rings?: readonly RingMark[];
  planets: readonly PlanetMark[];
  waves?: readonly WaveMark[];
  opacity: number;
};

function buildTrailPath(trail: PlanetMark['trail']): string {
  return trail
    .map(
      ([pointX, pointY], index) =>
        `${index === 0 ? 'M' : 'L'} ${pointX.toFixed(TRAIL_DECIMALS)} ${pointY.toFixed(TRAIL_DECIMALS)}`,
    )
    .join(' ');
}

function getWaveColor(tone: WaveMark['tone']): string {
  return tone === 'white' ? loaderTokens.shockwaveWhiteColor : loaderTokens.shockwaveWarmColor;
}

export function LoaderPlanetLayer({
  rings = [],
  planets,
  waves = [],
  opacity,
}: LoaderPlanetLayerProps) {
  return (
    <svg
      width={STAGE_WIDTH}
      height={STAGE_HEIGHT}
      className="absolute top-0 left-0"
      style={{ opacity }}
    >
      <g transform={`translate(${STAGE_CENTER_X} ${STAGE_CENTER_Y}) rotate(${DISC_TILT_DEGREES})`}>
        {rings.map((ring) => (
          <ellipse
            key={ring.radiusX}
            cx={0}
            cy={0}
            rx={ring.radiusX}
            ry={ring.radiusY}
            fill="none"
            stroke={loaderTokens.orbitLineColor}
            strokeOpacity={RING_OPACITY}
            strokeWidth={RING_STROKE_WIDTH}
            pathLength={PATH_LENGTH}
            strokeDasharray={`${PATH_LENGTH} ${PATH_LENGTH}`}
            strokeDashoffset={(1 - ring.drawProgress) * PATH_LENGTH}
          />
        ))}
        {planets.map((planet) => (
          <g key={planet.color + planet.radius}>
            <path
              d={buildTrailPath(planet.trail)}
              fill="none"
              stroke={planet.glowColor}
              strokeWidth={planet.radius * TRAIL_WIDTH_RATIO}
              strokeLinecap="round"
              opacity={TRAIL_OPACITY * planet.scale}
            />
            <circle
              cx={planet.x}
              cy={planet.y}
              r={planet.radius * GLOW_RADIUS_RATIO * planet.scale}
              fill={planet.glowColor}
              opacity={GLOW_OPACITY}
            />
            <circle
              cx={planet.x}
              cy={planet.y}
              r={planet.radius * planet.scale}
              fill={planet.color}
            />
            <circle
              cx={planet.x - planet.radius * SHINE_OFFSET_RATIO}
              cy={planet.y - planet.radius * SHINE_OFFSET_RATIO}
              r={planet.radius * SHINE_RADIUS_RATIO * planet.scale}
              fill={loaderTokens.planetHighlightColor}
              opacity={SHINE_OPACITY}
            />
          </g>
        ))}
      </g>
      {waves.map((wave) => (
        <circle
          key={wave.tone}
          cx={STAGE_CENTER_X}
          cy={STAGE_CENTER_Y}
          r={wave.radius}
          fill="none"
          stroke={getWaveColor(wave.tone)}
          strokeWidth={wave.strokeWidth}
          opacity={wave.opacity}
        />
      ))}
    </svg>
  );
}
