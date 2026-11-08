import React from "react";
import { Composition } from "remotion";
import { DashcamPromo } from "./DashcamPromo";
import { DURATION_FRAMES, FPS, H, W } from "./timeline";

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
  </>
);
