import { describe, expect, it } from 'vitest';
import { arcadeContent } from '@/content/arcade';
import { getBootProgress } from './boot-timeline';

const lineCount = arcadeContent.boot.lines.length;

describe('getBootProgress', () => {
  it('starts with a blank screen', () => {
    expect(getBootProgress(0)).toEqual({ visibleLines: 0, isTitleVisible: false, isDone: false });
  });

  it('types one BIOS line at a time, after the screen has switched on', () => {
    expect(getBootProgress(0.7).visibleLines).toBe(0);
    expect(getBootProgress(0.76).visibleLines).toBe(1);
    expect(getBootProgress(0.99).visibleLines).toBe(2);
  });

  it('shows every line and then the title', () => {
    expect(getBootProgress(2.0).visibleLines).toBe(lineCount);
    expect(getBootProgress(2.0).isTitleVisible).toBe(false);
    expect(getBootProgress(2.4).isTitleVisible).toBe(true);
  });

  it('hands over to the arcade home on its own, after about three and a half seconds', () => {
    expect(getBootProgress(3.5).isDone).toBe(false);
    expect(getBootProgress(3.7).isDone).toBe(true);
  });

  it('never shows more lines than there are', () => {
    expect(getBootProgress(100).visibleLines).toBe(lineCount);
  });

  it.each([-5, Number.NaN, Number.NEGATIVE_INFINITY])(
    'treats the time %s as the very start',
    (seconds) => {
      expect(getBootProgress(seconds)).toEqual({
        visibleLines: 0,
        isTitleVisible: false,
        isDone: false,
      });
    },
  );

  it('is done for an infinite time', () => {
    expect(getBootProgress(Number.POSITIVE_INFINITY).isDone).toBe(true);
  });
});
