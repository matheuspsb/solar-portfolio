import { arcadeContent } from '@/content/arcade';

const FIRST_LINE_SECONDS = 0.75;
const LINE_INTERVAL_SECONDS = 0.23;
const TITLE_DELAY_SECONDS = 0.15;
const HOME_DELAY_SECONDS = 1.5;

export type BootProgress = {
  visibleLines: number;
  isTitleVisible: boolean;
  isDone: boolean;
};

export function getBootProgress(elapsedSeconds: number): BootProgress {
  const seconds = Number.isNaN(elapsedSeconds) ? 0 : elapsedSeconds;
  const lineCount = arcadeContent.boot.lines.length;
  const linesEndSeconds = FIRST_LINE_SECONDS + lineCount * LINE_INTERVAL_SECONDS;
  const typedLines = Math.floor((seconds - FIRST_LINE_SECONDS) / LINE_INTERVAL_SECONDS) + 1;

  return {
    visibleLines: Math.max(0, Math.min(lineCount, typedLines)),
    isTitleVisible: seconds >= linesEndSeconds + TITLE_DELAY_SECONDS,
    isDone: seconds >= linesEndSeconds + HOME_DELAY_SECONDS,
  };
}
