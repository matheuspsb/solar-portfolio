import { useSyncExternalStore } from 'react';
import type { FrameChannel, ScreenFrame } from '@/lib/screen-frame';

export function useScreenFrame(channel: FrameChannel): ScreenFrame | null {
  return useSyncExternalStore(channel.subscribe, channel.getSnapshot, () => null);
}
