import { describe, expect, it } from 'vitest';
import { celestialBodies } from '@/content/celestial-bodies';
import { getInteractiveBodies } from '@/domain/celestial-body';
import { getImmersiveTarget, getOpenExperience, getOpenPanel } from './open-section';

const bodies = getInteractiveBodies(celestialBodies);
const panelBody = bodies.find((body) => body.section.presentation === 'panel');
const immersiveBody = bodies.find((body) => body.section.presentation === 'immersive');

describe('open-section', () => {
  it('opens a panel only for panel sections', () => {
    expect(getOpenPanel(panelBody)).not.toBeNull();
    expect(getOpenPanel(immersiveBody)).toBeNull();
    expect(getOpenPanel(undefined)).toBeNull();
  });

  it('opens an experience only for immersive sections', () => {
    expect(getOpenExperience(immersiveBody)).not.toBeNull();
    expect(getOpenExperience(panelBody)).toBeNull();
    expect(getOpenExperience(undefined)).toBeNull();
  });

  it('describes the immersive target with the body that opens it', () => {
    expect(getImmersiveTarget(immersiveBody)).toEqual({
      experience: getOpenExperience(immersiveBody),
      bodyId: immersiveBody?.id,
    });
  });

  it('has no immersive target for a panel body or for nothing', () => {
    expect(getImmersiveTarget(panelBody)).toBeNull();
    expect(getImmersiveTarget(undefined)).toBeNull();
  });
});
