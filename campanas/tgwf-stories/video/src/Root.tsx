import React from "react";
import { Composition, Still } from "remotion";
import { FPS, H, W } from "./brand";
import { TGWFStories, TOTAL } from "./Video";
import { STILLS } from "./stills/Stills";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="TGWFStories" component={TGWFStories} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
      {STILLS.map((s) => (
        <Still key={s.id} id={s.id} component={s.component} width={s.width} height={s.height} />
      ))}
    </>
  );
};
