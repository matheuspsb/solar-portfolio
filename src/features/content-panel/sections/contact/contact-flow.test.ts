import { describe, expect, it } from 'vitest';
import { contactFlowReducer, createInitialFlowState } from './contact-flow';
import type { ContactFlowState } from './contact-flow';

const initial = createInitialFlowState();
const atStep = (step: 0 | 1 | 2): ContactFlowState => ({ ...initial, step });

describe('contactFlowReducer', () => {
  it('starts asking the first question, with no error', () => {
    expect(initial).toMatchObject({ step: 0, status: 'asking', error: null });
  });

  it('advances one step and animates the field in', () => {
    const next = contactFlowReducer(initial, { type: 'advance' });
    expect(next.step).toBe(1);
    expect(next.fieldMotion.kind).toBe('enter');
    expect(next.fieldMotion.id).toBeGreaterThan(initial.fieldMotion.id);
  });

  it('never advances past the last question', () => {
    expect(contactFlowReducer(atStep(2), { type: 'advance' }).step).toBe(2);
  });

  it('goes back one step, and not before the first', () => {
    expect(contactFlowReducer(atStep(2), { type: 'back' }).step).toBe(1);
    expect(contactFlowReducer(atStep(0), { type: 'back' }).step).toBe(0);
  });

  it('jumps back to an earlier step, but not forward or to the current one', () => {
    expect(contactFlowReducer(atStep(2), { type: 'jump', step: 0 }).step).toBe(0);
    expect(contactFlowReducer(atStep(1), { type: 'jump', step: 2 }).step).toBe(1);
    const current = atStep(1);
    expect(contactFlowReducer(current, { type: 'jump', step: 1 })).toBe(current);
  });

  it('shows the error and shakes the field when the answer is rejected', () => {
    const rejected = contactFlowReducer(initial, { type: 'reject', error: 'Digite seu nome.' });
    expect(rejected.error).toBe('Digite seu nome.');
    expect(rejected.fieldMotion.kind).toBe('shake');
  });

  it('shakes again on every rejection, so the animation restarts', () => {
    const once = contactFlowReducer(initial, { type: 'reject', error: 'x' });
    const twice = contactFlowReducer(once, { type: 'reject', error: 'x' });
    expect(twice.fieldMotion.id).not.toBe(once.fieldMotion.id);
  });

  it('clears the error when the visitor edits the answer', () => {
    const rejected = contactFlowReducer(initial, { type: 'reject', error: 'x' });
    expect(contactFlowReducer(rejected, { type: 'edit' }).error).toBeNull();
  });

  it('clears the error when changing step', () => {
    const rejected = contactFlowReducer(initial, { type: 'reject', error: 'x' });
    expect(contactFlowReducer(rejected, { type: 'advance' }).error).toBeNull();
    expect(contactFlowReducer({ ...atStep(1), error: 'x' }, { type: 'back' }).error).toBeNull();
  });

  describe('sending', () => {
    const sending = contactFlowReducer(atStep(2), { type: 'send' });

    it('starts sending only from the last question', () => {
      expect(sending.status).toBe('sending');
      expect(contactFlowReducer(atStep(1), { type: 'send' })).toEqual(atStep(1));
    });

    it('ignores every navigation and a second send while sending', () => {
      expect(contactFlowReducer(sending, { type: 'back' })).toBe(sending);
      expect(contactFlowReducer(sending, { type: 'advance' })).toBe(sending);
      expect(contactFlowReducer(sending, { type: 'jump', step: 0 })).toBe(sending);
      expect(contactFlowReducer(sending, { type: 'send' })).toBe(sending);
    });

    it('is done once delivered', () => {
      expect(contactFlowReducer(sending, { type: 'delivered' }).status).toBe('done');
    });

    it('returns to the last question with the error when delivery fails', () => {
      const failed = contactFlowReducer(sending, { type: 'failed', error: 'Falhou.' });
      expect(failed).toMatchObject({ status: 'asking', step: 2, error: 'Falhou.' });
    });

    it('ignores a delivery result when nothing is being sent', () => {
      expect(contactFlowReducer(initial, { type: 'delivered' })).toBe(initial);
      expect(contactFlowReducer(initial, { type: 'failed', error: 'x' })).toBe(initial);
    });
  });

  describe('after delivery', () => {
    const done = contactFlowReducer(contactFlowReducer(atStep(2), { type: 'send' }), {
      type: 'delivered',
    });

    it('ignores navigation and answers', () => {
      expect(contactFlowReducer(done, { type: 'back' })).toBe(done);
      expect(contactFlowReducer(done, { type: 'reject', error: 'x' })).toBe(done);
    });

    it('starts over from the first question on reset', () => {
      const restarted = contactFlowReducer(done, { type: 'reset' });
      expect(restarted).toMatchObject({ step: 0, status: 'asking', error: null });
      expect(restarted.fieldMotion.id).toBeGreaterThan(done.fieldMotion.id);
    });
  });

  it('does not reset in the middle of a conversation', () => {
    expect(contactFlowReducer(atStep(1), { type: 'reset' })).toEqual(atStep(1));
  });
});
