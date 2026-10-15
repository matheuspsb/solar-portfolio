import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { contactContent } from '@/content/contact';
import { stubReducedMotion } from '@/test/stub-reduced-motion';
import { DeliveryScene } from './DeliveryScene';

afterEach(() => vi.unstubAllGlobals());

function renderScene() {
  return render(<DeliveryScene delivered={contactContent.delivered} dateLabel="05 OUT 2026" />);
}

describe('DeliveryScene', () => {
  it('sends the envelope flying unless the visitor prefers reduced motion', () => {
    const normal = renderScene();
    const normalCount = normal.container.querySelectorAll('span').length;
    normal.unmount();

    stubReducedMotion(true);
    const reduced = renderScene();
    expect(reduced.container.querySelectorAll('span').length).toBeLessThan(normalCount);
  });
});
