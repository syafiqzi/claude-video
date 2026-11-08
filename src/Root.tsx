import React from "react";
import { Composition } from "remotion";
import { DashcamPromo } from "./DashcamPromo";
import { DURATION_FRAMES, FPS, H, W } from "./timeline";
import { ThinkBig } from "./thinkbig/ThinkBig";
import * as TB from "./thinkbig/theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="DashcamPromo"
      component={DashcamPromo}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ showSafeZone: false }}
    />
    <Composition
      id="DashcamPromo-SafeZone"
      component={DashcamPromo}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ showSafeZone: true }}
    />
    <Composition id="ThinkBig" component={ThinkBig} durationInFrames={TB.DURATION_FRAMES} fps={TB.FPS} width={TB.W} height={TB.H} defaultProps={{ showSafeZone: false }} />
    <Composition id="ThinkBig-SafeZone" component={ThinkBig} durationInFrames={TB.DURATION_FRAMES} fps={TB.FPS} width={TB.W} height={TB.H} defaultProps={{ showSafeZone: true }} />
  </>
);
