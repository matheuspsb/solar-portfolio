import { clamp } from '@/lib/math';
import { DATA_GLYPH_MAX_SECONDS, DATA_GLYPH_MIN_SECONDS, EXIT_MARGIN_PIXELS } from './constants';
import { DATA_GLYPHS, isBug } from './entities';
import type { Bug, CorruptedData, Entity, Patch, Shard, Tear } from './entities';
import type { PlayField } from './play-field';
import { pickOne, randomBetween } from './random';
import type { Random } from './random';
import { isValidStep } from './time-step';

type AdvanceInput = {
  entities: readonly Entity[];
  deltaSeconds: number;
  field: PlayField;
  random: Random;
};

type AdvanceResult = { entities: Entity[]; leakedBugs: number };

function coolFlash(flashSeconds: number, deltaSeconds: number): number {
  return Math.max(0, flashSeconds - deltaSeconds);
}

function advanceBug(bug: Bug, deltaSeconds: number, field: PlayField): Bug {
  const age = bug.age + deltaSeconds;
  const sway = Math.sin(bug.phase + age * bug.frequency) * bug.amplitude;
  return {
    ...bug,
    age,
    y: bug.y + bug.speed * deltaSeconds,
    x: clamp(bug.laneX + sway, bug.radius, field.width - bug.radius),
    flashSeconds: coolFlash(bug.flashSeconds, deltaSeconds),
  };
}

function advanceData(data: CorruptedData, deltaSeconds: number, random: Random): CorruptedData {
  const glyphSeconds = data.glyphSeconds - deltaSeconds;
  const shouldSwapGlyph = glyphSeconds <= 0;
  return {
    ...data,
    age: data.age + deltaSeconds,
    y: data.y + data.speed * deltaSeconds,
    flashSeconds: coolFlash(data.flashSeconds, deltaSeconds),
    glyphSeconds: shouldSwapGlyph
      ? randomBetween(random, DATA_GLYPH_MIN_SECONDS, DATA_GLYPH_MAX_SECONDS)
      : glyphSeconds,
    glyph: shouldSwapGlyph ? pickOne(random, DATA_GLYPHS) : data.glyph,
  };
}

function advanceFaller<Faller extends Shard | Patch>(faller: Faller, deltaSeconds: number): Faller {
  return { ...faller, age: faller.age + deltaSeconds, y: faller.y + faller.speed * deltaSeconds };
}

function advanceTear(tear: Tear, deltaSeconds: number): Tear {
  return { ...tear, age: tear.age + deltaSeconds };
}

function hasExited(entity: Entity, field: PlayField): boolean {
  if (entity.kind === 'tear') return entity.age > entity.warningSeconds + entity.activeSeconds;
  if (isBug(entity)) return entity.y > field.height + entity.radius;
  return entity.y > field.height + entity.radius + EXIT_MARGIN_PIXELS;
}

function moveEntity(entity: Entity, input: AdvanceInput): Entity {
  const { deltaSeconds, field, random } = input;
  if (isBug(entity)) return advanceBug(entity, deltaSeconds, field);
  if (entity.kind === 'data') return advanceData(entity, deltaSeconds, random);
  if (entity.kind === 'tear') return advanceTear(entity, deltaSeconds);
  return advanceFaller(entity, deltaSeconds);
}

export function advanceEntities(input: AdvanceInput): AdvanceResult {
  if (!isValidStep(input.deltaSeconds)) return { entities: [...input.entities], leakedBugs: 0 };

  const moved = input.entities.map((entity) => moveEntity(entity, input));
  const survivors = moved.filter((entity) => !hasExited(entity, input.field));
  const leakedBugs = moved.filter(
    (entity) => isBug(entity) && hasExited(entity, input.field),
  ).length;
  return { entities: survivors, leakedBugs };
}
