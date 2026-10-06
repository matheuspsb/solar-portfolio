import type { CSSProperties } from 'react';
import { WARP_ORIGIN, getWarpLines } from './delivery-geometry';
import type { WarpLine } from './delivery-geometry';

const WARP_LINE_COUNT = 22;
const WARP_LINES = getWarpLines(WARP_LINE_COUNT);

type AnimationDelayStyle = CSSProperties & { '--animation-delay': string };

function getLineStyle(line: WarpLine): AnimationDelayStyle {
  return { width: line.length, '--animation-delay': `${line.delaySeconds}s` };
}

export function WarpLines() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {WARP_LINES.map((line) => (
        <div
          key={line.angleDegrees}
          className="absolute size-0"
          style={{
            left: WARP_ORIGIN.x,
            top: WARP_ORIGIN.y,
            transform: `rotate(${line.angleDegrees}deg)`,
          }}
        >
          <span
            className="absolute -top-px left-0 h-[1.5px] origin-left rounded-xs bg-linear-to-r from-transparent via-white to-ember-400/53 motion-safe:animate-warp"
            style={getLineStyle(line)}
          />
        </div>
      ))}
    </div>
  );
}
