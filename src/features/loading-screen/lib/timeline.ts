type StageDefinition = {
  name: 'start' | 'hyperspace' | 'nebula' | 'ignition' | 'orbits' | 'finale';
  designSeconds: number;
  realSeconds: number;
};

export type Stage = StageDefinition & {
  designStartSeconds: number;
  realStartSeconds: number;
};

const STAGE_DEFINITIONS: readonly StageDefinition[] = [
  { name: 'start', designSeconds: 2.2, realSeconds: 1.0 },
  { name: 'hyperspace', designSeconds: 2.6, realSeconds: 1.4 },
  { name: 'nebula', designSeconds: 3.0, realSeconds: 1.2 },
  { name: 'ignition', designSeconds: 1.8, realSeconds: 1.1 },
  { name: 'orbits', designSeconds: 2.8, realSeconds: 1.5 },
  { name: 'finale', designSeconds: 1.6, realSeconds: 0.8 },
];

function buildStages(definitions: readonly StageDefinition[]): readonly Stage[] {
  let designCursor = 0;
  let realCursor = 0;
  return definitions.map((definition) => {
    const stage = {
      ...definition,
      designStartSeconds: designCursor,
      realStartSeconds: realCursor,
    };
    designCursor += definition.designSeconds;
    realCursor += definition.realSeconds;
    return stage;
  });
}

export const STAGES = buildStages(STAGE_DEFINITIONS);

function findStage(name: Stage['name']): Stage | undefined {
  return STAGES.find((stage) => stage.name === name);
}

export const TOTAL_DESIGN_SECONDS = STAGE_DEFINITIONS.reduce(
  (total, stage) => total + stage.designSeconds,
  0,
);
export const TOTAL_REAL_SECONDS = STAGE_DEFINITIONS.reduce(
  (total, stage) => total + stage.realSeconds,
  0,
);
export const HOLD_REAL_SECONDS = findStage('finale')?.realStartSeconds ?? TOTAL_REAL_SECONDS;

function designStartOf(name: Stage['name']): number {
  return findStage(name)?.designStartSeconds ?? 0;
}

export const DESIGN_CUES = {
  start: designStartOf('start'),
  hyperspace: designStartOf('hyperspace'),
  nebula: designStartOf('nebula'),
  ignition: designStartOf('ignition'),
  orbits: designStartOf('orbits'),
  finale: designStartOf('finale'),
} as const;
