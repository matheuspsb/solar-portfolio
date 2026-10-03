/** Viewport width from which the panel is a side drawer (Tailwind `sm`); below it, it fills the screen. */
const SIDE_PANEL_MIN_VIEWPORT_PIXELS = 640;

type PanelOffsetInput = {
  viewportWidth: number;
  panelWidthPixels: number;
  isPanelOpen: boolean;
};

/** Horizontal pixels to shift the view by so a centered body ends up centered beside the panel. */
export function getPanelViewOffsetPixels({
  viewportWidth,
  panelWidthPixels,
  isPanelOpen,
}: PanelOffsetInput): number {
  if (!isPanelOpen) return 0;
  const isViewportUsable = Number.isFinite(viewportWidth) && viewportWidth > 0;
  const isPanelUsable = Number.isFinite(panelWidthPixels) && panelWidthPixels > 0;
  if (!isViewportUsable || !isPanelUsable) return 0;
  if (viewportWidth < SIDE_PANEL_MIN_VIEWPORT_PIXELS) return 0;
  if (panelWidthPixels >= viewportWidth) return 0;
  return panelWidthPixels / 2;
}
