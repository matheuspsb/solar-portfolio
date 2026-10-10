import { describe, expect, it, vi } from 'vitest';
import { createFrameChannel } from './screen-frame';

const frame = { x: 100, y: 80, radius: 40 };

describe('createFrameChannel', () => {
  it('does not wake the subscribers for a frame equal to the current one', () => {
    const channel = createFrameChannel();
    channel.publish(frame);
    const listener = vi.fn();
    channel.subscribe(listener);
    channel.publish({ ...frame });
    channel.publish(frame);
    expect(listener).not.toHaveBeenCalled();
  });

  it('does not wake the subscribers when null is published again', () => {
    const channel = createFrameChannel();
    const listener = vi.fn();
    channel.subscribe(listener);
    channel.publish(null);
    expect(listener).not.toHaveBeenCalled();
  });

  it('serves every subscriber and stops serving the ones that left', () => {
    const channel = createFrameChannel();
    const staying = vi.fn();
    const leaving = vi.fn();
    channel.subscribe(staying);
    const unsubscribe = channel.subscribe(leaving);
    unsubscribe();
    channel.publish(frame);
    expect(staying).toHaveBeenCalledOnce();
    expect(leaving).not.toHaveBeenCalled();
  });
});
