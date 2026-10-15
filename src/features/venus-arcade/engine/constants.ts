export const MATCH_DURATION_SECONDS = 45;
export const STARTING_INTEGRITY = 3;

export const STANDARD_FIRE_INTERVAL_SECONDS = 0.15;
export const HOTFIX_FIRE_INTERVAL_SECONDS = 0.1;
export const FIRST_SHOT_DELAY_SECONDS = 0.3;
export const SHOT_SPEED = 780;
export const STANDARD_SHOT_ANGLES_RADIANS: readonly number[] = [0];
export const HOTFIX_SHOT_ANGLES_RADIANS: readonly number[] = [-0.22, 0, 0.22];
export const SHOT_CULL_MARGIN_PIXELS = 20;
export const SHOT_MUZZLE_OFFSET_PIXEL_UNITS = 4;

export const DRONE_KEYBOARD_SPEED = 480;
export const DRONE_FOLLOW_RATE = 14;
export const DRONE_HALF_WIDTH_PIXEL_UNITS = 4.5;
export const DRONE_START_HEIGHT_RATIO = 0.78;
export const PLAY_AREA_TOP_RATIO = 0.14;

export const NARROW_SCREEN_MAX_WIDTH_PIXELS = 560;
export const WIDE_PIXEL_SCALE = 4;
export const NARROW_PIXEL_SCALE = 3;

export const CRAWLER_RADIUS_PIXEL_UNITS = 4;
export const BEETLE_RADIUS_PIXEL_UNITS = 5.5;
export const DATA_RADIUS_PIXEL_UNITS = 4.5;
export const SHARD_RADIUS_PIXEL_UNITS = 3.5;
export const PATCH_RADIUS_PIXEL_UNITS = 3;
export const TEAR_HEIGHT_PIXEL_UNITS = 7;

export const CRAWLER_HIT_POINTS = 1;
export const BEETLE_HIT_POINTS = 3;
export const DATA_HIT_POINTS = 2;
export const CRAWLER_POINTS = 10;
export const BEETLE_POINTS = 40;
export const DATA_POINTS = 25;

export const PATCH_FALL_SPEED = 90;
export const TEAR_WARNING_SECONDS = 0.9;
export const TEAR_ACTIVE_SECONDS = 1;
export const DATA_GLYPH_MIN_SECONDS = 0.1;
export const DATA_GLYPH_MAX_SECONDS = 0.4;
export const EXIT_MARGIN_PIXELS = 10;

export const FIRST_BUG_SECONDS = 0.5;
export const FIRST_DATA_SECONDS = 2.2;
export const FIRST_SHARD_SECONDS = 1;
export const FIRST_TEAR_SECONDS = 2;
export const BEETLES_START_SECONDS = 10;
export const SHARDS_START_SECONDS = 6;
export const TEARS_START_SECONDS = 14;
export const LANE_MARGIN_PIXELS = 10;
export const BEETLE_BASE_CHANCE = 0.22;
export const BEETLE_CHANCE_GAIN = 0.1;
export const BUG_INTERVAL_SECONDS = { start: 0.8, end: 0.28, jitter: [0.7, 1.3] } as const;
export const DATA_INTERVAL_SECONDS = { start: 3, end: 1.7, jitter: [0.8, 1.2] } as const;
export const SHARD_INTERVAL_SECONDS = { start: 2.4, end: 0.8, jitter: [0.8, 1.2] } as const;
export const TEAR_INTERVAL_SECONDS = { start: 6, end: 3.2 } as const;
export const CRAWLER_SPEED = { start: 75, end: 160, jitter: [0.85, 1.15] } as const;
export const BEETLE_SPEED = { start: 45, end: 85, jitter: [0.9, 1.1] } as const;
export const CRAWLER_AMPLITUDE_RANGE = [18, 60] as const;
export const BEETLE_AMPLITUDE_RANGE = [6, 16] as const;
export const CRAWLER_FREQUENCY_RANGE = [2, 4] as const;
export const BEETLE_FREQUENCY_RANGE = [1, 2] as const;
export const PHASE_RANGE_RADIANS = [0, 6] as const;
export const DATA_SPEED_RANGE = [40, 70] as const;
export const SHARD_SPEED = { start: 170, end: 320 } as const;
export const TEAR_TOP_RATIO = 0.3;
export const TEAR_BOTTOM_RATIO = 0.88;

export const SHOT_HIT_RADIUS_PIXELS = 3;
export const HIT_FLASH_SECONDS = 0.08;
export const DRONE_RADIUS_PIXEL_UNITS = 3.2;
export const BODY_CONTACT_FACTOR = 0.8;
export const TEAR_CONTACT_FACTOR = 0.6;
export const PATCH_PICKUP_EXTRA_PIXELS = 8;
export const PATCH_BONUS_POINTS = 50;
export const PATCH_DROP_CHANCE = 0.14;
export const INVULNERABLE_SECONDS = 1.4;
export const COMBO_WINDOW_SECONDS = 2.4;
export const KILLS_PER_MULTIPLIER_STEP = 6;
export const MAX_MULTIPLIER_BONUS = 4;
