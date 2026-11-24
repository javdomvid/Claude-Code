import React from "react";
import { Composition, Still } from "remotion";
import { FPS, H, W } from "./brand";
import { TGWFStories, TOTAL } from "./Video";
import { STILLS } from "./stills/Stills";
import { BETA_TOTAL, TGWFBeta } from "./scenes/Beta";
import { IG_STILLS } from "./stills/Instagram";
import { REEL2_FRAMES, REEL3_FRAMES, ReelIdeas, ReelTachar } from "./scenes/Reels";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="TGWFStories" component={TGWFStories} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
      <Composition id="TGWFBeta" component={TGWFBeta} durationInFrames={BETA_TOTAL} fps={FPS} width={W} height={H} />
      <Composition id="ReelTachar" component={ReelTachar} durationInFrames={REEL2_FRAMES} fps={FPS} width={W} height={H} />
      <Composition id="ReelIdeas" component={ReelIdeas} durationInFrames={REEL3_FRAMES} fps={FPS} width={W} height={H} />
      {[...STILLS, ...IG_STILLS].map((s) => (
        <Still key={s.id} id={s.id} component={s.component} width={s.width} height={s.height} />
      ))}
    </>
  );
};
