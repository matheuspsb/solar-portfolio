type ContextProvider = {
  getContext: (contextId: string) => object | null;
};

export type CanvasFactory = () => ContextProvider;

const defaultCanvasFactory: CanvasFactory = () => document.createElement('canvas');

/** True when the browser can create a WebGL context. Never throws. */
export function detectWebGL(createCanvas: CanvasFactory = defaultCanvasFactory): boolean {
  try {
    const canvas = createCanvas();
    return canvas.getContext('webgl2') !== null || canvas.getContext('webgl') !== null;
  } catch {
    return false;
  }
}
