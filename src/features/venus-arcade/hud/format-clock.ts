const SECONDS_PER_MINUTE = 60;
const CLOCK_DIGITS = 2;

function padClockPart(value: number): string {
  return String(value).padStart(CLOCK_DIGITS, '0');
}

export function formatClock(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const minutes = Math.floor(safeSeconds / SECONDS_PER_MINUTE);
  return `${padClockPart(minutes)}:${padClockPart(safeSeconds % SECONDS_PER_MINUTE)}`;
}
