export const CAMERA_FIELD_OF_VIEW = 50;

/** Fraction of the limiting screen dimension that the whole system (outermost orbit) should occupy at rest. */
export const SYSTEM_SCREEN_FILL = 0.8;

/** Mirrors the `--size-panel-width` token (28.25rem at the default 16px root font size). */
export const PANEL_WIDTH_PIXELS = 452;

export const PANEL_SHIFT_TRANSITION_SECONDS = 0.7;

export const CAMERA_FOCUS_TRANSITION_SECONDS = 1;

/**
 * Extra swing (about 52 degrees) so a focused planet appears beside the star instead of hiding in
 * front of it, with the side facing the Sun lit towards the star.
 */
export const CAMERA_FOCUS_SIDE_OFFSET_RADIANS = 0.9;
