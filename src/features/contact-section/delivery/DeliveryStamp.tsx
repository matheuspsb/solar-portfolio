import type { ContactContent } from '@/domain/contact-content';
import { STAMP_POSITION } from './delivery-geometry';

const STAMP_ROTATION_DEGREES = -12;

type DeliveryStampProps = {
  stamp: ContactContent['delivered']['stamp'];
  dateLabel: string;
};

export function DeliveryStamp({ stamp, dateLabel }: DeliveryStampProps) {
  return (
    <div
      className="absolute flex size-27 items-center justify-center rounded-ellipse border-2 border-ember-400 motion-safe:animate-stamp"
      style={{
        left: STAMP_POSITION.x,
        top: STAMP_POSITION.y,
        transform: `rotate(${STAMP_ROTATION_DEGREES}deg)`,
      }}
    >
      <div className="flex size-22.5 flex-col items-center justify-center gap-0.5 rounded-ellipse border border-dashed border-ember-400/60 text-ember-400">
        <span className="font-mono text-stamp-small tracking-[0.18em]">{stamp.top}</span>
        <span className="text-stamp-name font-bold tracking-[0.04em]">{stamp.name}</span>
        <span className="my-0.5 h-px w-13.5 bg-ember-400/53" />
        <span className="font-mono text-stamp-date tracking-code">{dateLabel}</span>
        <span className="font-mono text-stamp-small tracking-[0.18em]">{stamp.status}</span>
      </div>
    </div>
  );
}
