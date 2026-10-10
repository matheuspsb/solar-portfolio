import type { TelemetryLayout } from '../lib/telemetry-layout';

const ORIGIN_DOT_RADIUS = 3;

type TelemetryLineProps = {
  layout: TelemetryLayout;
};

export function TelemetryLine({ layout }: TelemetryLineProps) {
  const { origin, elbow, end } = layout;
  const path = `M ${origin.x} ${origin.y} L ${elbow.x} ${elbow.y} L ${end.x} ${end.y}`;

  return (
    <svg className="absolute inset-0 size-full overflow-visible motion-reduce:animate-target-fade">
      <path
        d={path}
        strokeWidth={1}
        pathLength={100}
        strokeDasharray="100 100"
        className="fill-none stroke-(--lock-accent) motion-safe:animate-draw-line"
      />
      <circle cx={origin.x} cy={origin.y} r={ORIGIN_DOT_RADIUS} className="fill-(--lock-accent)" />
    </svg>
  );
}
