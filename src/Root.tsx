import { Composition } from "remotion";
import { Main, mainSchema } from "./Main";

export const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Main}
        durationInFrames={FPS * 10}
        fps={FPS}
        width={1920}
        height={1080}
        schema={mainSchema}
        defaultProps={{
          title: "Skill 3D",
          subtitle: "Three.js + Remotion",
          color: "#4f8cff",
          music: true,
        }}
      />
      {/* Vertical version for Reels / TikTok / Shorts */}
      <Composition
        id="Vertical"
        component={Main}
        durationInFrames={FPS * 10}
        fps={FPS}
        width={1080}
        height={1920}
        schema={mainSchema}
        defaultProps={{
          title: "Skill 3D",
          subtitle: "Three.js + Remotion",
          color: "#ff6b9d",
          music: true,
        }}
      />
    </>
  );
};
