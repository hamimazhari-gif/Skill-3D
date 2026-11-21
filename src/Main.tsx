import { AbsoluteFill, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { z } from "zod";
import { Scene3D } from "./scenes/Scene3D";
import { Title } from "./components/Title";
import { Captions } from "./components/Captions";
import { captions } from "./data/captions";

export const mainSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  color: z.string(),
  music: z.boolean(),
});

export const Main: React.FC<z.infer<typeof mainSchema>> = ({ title, subtitle, color, music }) => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0d17" }}>
      {/* 1. 3D layer (Three.js via @react-three/fiber) */}
      <Scene3D color={color} />

      {/* 2. Title overlay for the first 3 seconds */}
      <Sequence durationInFrames={fps * 3} premountFor={fps}>
        <Title title={title} subtitle={subtitle} />
      </Sequence>

      {/* 3. Captions / subtitles */}
      <Captions captions={captions} />

      {/* 4. Audio: background music with fade in / fade out */}
      {music ? (
        <Audio
          src={staticFile("audio/music.mp3")}
          volume={(f) =>
            interpolate(f, [0, fps, durationInFrames - fps, durationInFrames], [0, 0.6, 0.6, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
