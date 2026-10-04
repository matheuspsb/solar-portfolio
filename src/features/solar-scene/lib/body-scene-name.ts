/** Name of the 3D object that represents a body, so other parts of the scene (the camera) can find it. */
export function getBodySceneName(bodyId: string): string {
  return `body-${bodyId}`;
}
