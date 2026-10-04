import { useEffect, useState } from 'react';
import { MirroredRepeatWrapping, RepeatWrapping, SRGBColorSpace, TextureLoader } from 'three';
import type { Texture } from 'three';

export type TextureLoadFunction = (url: string) => Promise<Texture>;

type TextureState = {
  texture: Texture | null;
  status: 'idle' | 'loading' | 'loaded' | 'error';
};

type SettledTextureState = TextureState & { url: string };

const MAX_ANISOTROPY = 8;

const loadTextureWithThree: TextureLoadFunction = async (url) => {
  const texture = await new TextureLoader().loadAsync(url);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = MAX_ANISOTROPY;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = MirroredRepeatWrapping;
  return texture;
};

const IDLE_STATE: TextureState = { texture: null, status: 'idle' };
const LOADING_STATE: TextureState = { texture: null, status: 'loading' };

export function useTexture(
  url: string | null,
  load: TextureLoadFunction = loadTextureWithThree,
): TextureState {
  const [settled, setSettled] = useState<SettledTextureState | null>(null);

  useEffect(() => {
    if (url === null) return;
    let isCancelled = false;
    let loadedTexture: Texture | null = null;

    load(url).then(
      (texture) => {
        if (isCancelled) {
          texture.dispose();
          return;
        }
        loadedTexture = texture;
        setSettled({ url, texture, status: 'loaded' });
      },
      () => {
        if (!isCancelled) setSettled({ url, texture: null, status: 'error' });
      },
    );

    return () => {
      isCancelled = true;
      loadedTexture?.dispose();
    };
  }, [url, load]);

  if (url === null) return IDLE_STATE;
  if (settled?.url !== url) return LOADING_STATE;
  return { texture: settled.texture, status: settled.status };
}
