type LoseContextExtension = { loseContext: () => void };

type ProbeContext = {
  getExtension?: (name: string) => LoseContextExtension | object | null;
};

type ContextProvider = {
  getContext: (contextId: string) => ProbeContext | null;
};

type CanvasFactory = () => ContextProvider;

const defaultCanvasFactory: CanvasFactory = () => {
  const canvas = document.createElement('canvas');
  return { getContext: (contextId) => canvas.getContext(contextId) as ProbeContext | null };
};

/** Browsers cap live WebGL contexts, so the throwaway probe context is handed back right away. */
function releaseContext(context: ProbeContext): void {
  try {
    const extension = context.getExtension?.('WEBGL_lose_context') as LoseContextExtension | null;
    extension?.loseContext();
  } catch {
    // The context is already gone; nothing left to release.
  }
}

/** True when the browser can create a WebGL context. Never throws. */
export function detectWebGL(createCanvas: CanvasFactory = defaultCanvasFactory): boolean {
  try {
    const canvas = createCanvas();
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (context === null) return false;
    releaseContext(context);
    return true;
  } catch {
    return false;
  }
}
