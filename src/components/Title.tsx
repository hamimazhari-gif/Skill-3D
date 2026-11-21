import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../fonts";

export const Title: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const exit = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 100, fontFamily }}>
      <div style={{ opacity: enter * exit, transform: `translateY(${(1 - enter) * 40}px)`, textAlign: "center" }}>
        <div style={{ fontSize: 110, fontWeight: 800, color: "white", letterSpacing: -2 }}>{title}</div>
        <div style={{ fontSize: 44, color: "rgba(255,255,255,0.75)", marginTop: 10 }}>{subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};
