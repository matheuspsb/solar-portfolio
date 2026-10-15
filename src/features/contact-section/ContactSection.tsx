import type { ContactContent } from '@/domain/contact-content';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { getLocalStorage } from '@/lib/safe-storage';
import type { KeyValueStorage } from '@/lib/safe-storage';
import { DeliveryReceipt } from './delivery/DeliveryReceipt';
import { DeliveryScene } from './delivery/DeliveryScene';
import { buildProtocol, formatStampDate } from './delivery/receipt';
import { ArcJourney } from './journey/ArcJourney';
import { JourneyStage } from './journey/JourneyStage';
import { LinkedInCard } from './LinkedInCard';
import { ContactForm } from './question/ContactForm';
import { useContactJourney } from './use-contact-journey';

type ContactSectionProps = {
  content: ContactContent;
  frameScheduler?: FrameScheduler;
  getNow?: () => Date;
  draftStorage?: KeyValueStorage | null;
};

export function ContactSection({
  content,
  frameScheduler,
  getNow = () => new Date(),
  draftStorage = getLocalStorage(),
}: ContactSectionProps) {
  const journey = useContactJourney({ content, frameScheduler, getNow, draftStorage });
  const { delivered, stage, form } = journey;

  return (
    <div className="flex flex-1 flex-col">
      <JourneyStage isDelivered={stage.isDone}>
        {delivered ? (
          <DeliveryScene
            delivered={content.delivered}
            dateLabel={formatStampDate(delivered.deliveredAt)}
          />
        ) : (
          <ArcJourney
            planets={stage.planets}
            currentStep={stage.currentStep}
            isDelivered={stage.isDone}
            isSending={stage.isSending}
            comet={stage.comet}
            canJump={stage.canJump}
            onJump={stage.onJump}
          />
        )}
      </JourneyStage>

      <div className="flex flex-1 flex-col gap-5 px-7 pt-8 pb-7">
        {delivered ? (
          <DeliveryReceipt
            content={content}
            message={delivered.message}
            protocol={buildProtocol(delivered.message.name, delivered.message.message)}
            onSendAnother={journey.onSendAnother}
          />
        ) : (
          <>
            <ContactForm
              form={form}
              formRef={journey.formRef}
              honeypotLabel={content.honeypotLabel}
              backLabel={content.actions.backLabel}
            />
            <LinkedInCard linkedin={content.linkedin} />
          </>
        )}
      </div>
    </div>
  );
}
