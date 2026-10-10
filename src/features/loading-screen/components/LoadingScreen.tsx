import { loaderTokens } from '@/styles/loader-tokens';
import type { StageLayout } from '../hooks/use-stage-layout';
import type { LoaderFrame } from '../lib/loader-frame';
import { LoaderCore } from './LoaderCore';
import { LoaderHud } from './LoaderHud';
import { LoaderNebula } from './LoaderNebula';
import { LoaderPlanetLayer } from './LoaderPlanetLayer';
import { LoaderSky } from './LoaderSky';
import { LoaderSun } from './LoaderSun';
import { LoaderTitle } from './LoaderTitle';
import { StageLayer } from './StageLayer';

type LoadingScreenProps = {
  frame: LoaderFrame;
  percent: number;
  isSceneReady: boolean;
  layout: StageLayout;
};

export function LoadingScreen({ frame, percent, isSceneReady, layout }: LoadingScreenProps) {
  const skyView = {
    viewportWidth: layout.viewportWidth,
    viewportHeight: layout.viewportHeight,
    pixelRatio: layout.pixelRatio,
    stageScale: layout.stageScale,
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-space-950 font-sans text-ink-100">
      <StageLayer stageScale={layout.stageScale}>
        <LoaderNebula nebula={frame.nebula} />
      </StageLayer>
      <LoaderSky stars={frame.stars} dust={frame.dust} view={skyView} />
      <StageLayer stageScale={layout.stageScale}>
        {frame.core && <LoaderCore core={frame.core} />}
        <LoaderPlanetLayer
          rings={frame.planets.rings}
          planets={frame.planets.back}
          opacity={frame.contentOpacity}
        />
        {frame.sun && <LoaderSun sun={frame.sun} rays={frame.rays} />}
        <LoaderPlanetLayer
          planets={frame.planets.front}
          waves={frame.waves}
          opacity={frame.contentOpacity}
        />
      </StageLayer>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: loaderTokens.flashColor, opacity: frame.flashOpacity }}
      />
      <LoaderTitle title={frame.title} opacity={frame.contentOpacity} />
      <LoaderHud hud={frame.hud} percent={percent} isSceneReady={isSceneReady} />
      <div className="absolute inset-0 bg-space-950" style={{ opacity: frame.blackoutOpacity }} />
    </div>
  );
}
