import { describe, expect, it } from 'vitest';
import { HOLD_REAL_SECONDS, STAGES, TOTAL_DESIGN_SECONDS, TOTAL_REAL_SECONDS } from './timeline';

describe('timeline', () => {
  it('chains the stages without gaps', () => {
    let realCursor = 0;
    let designCursor = 0;
    for (const stage of STAGES) {
      expect(stage.realStartSeconds).toBeCloseTo(realCursor, 10);
      expect(stage.designStartSeconds).toBeCloseTo(designCursor, 10);
      realCursor += stage.realSeconds;
      designCursor += stage.designSeconds;
    }
    expect(realCursor).toBeCloseTo(TOTAL_REAL_SECONDS, 10);
    expect(designCursor).toBeCloseTo(TOTAL_DESIGN_SECONDS, 10);
  });

  it('keeps every stage with a positive duration in both timelines', () => {
    for (const stage of STAGES) {
      expect(stage.realSeconds).toBeGreaterThan(0);
      expect(stage.designSeconds).toBeGreaterThan(0);
    }
  });

  it('holds exactly where the final stage begins', () => {
    const finalStage = STAGES[STAGES.length - 1];
    expect(HOLD_REAL_SECONDS).toBe(finalStage?.realStartSeconds);
  });
});
