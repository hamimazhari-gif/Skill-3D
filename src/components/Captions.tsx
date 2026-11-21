import { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { createTikTokStyleCaptions, type Caption, type TikTokPage } from "@remotion/captions";
import { fontFamily } from "../fonts";

// How long words are grouped together into one caption "page"
const COMBINE_TOKENS_WITHIN_MS = 1200;

export const Captions: React.FC<{ captions: Caption[] }> = ({ captions }) => {
  const { fps } = useVideoConfig();

  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: COMBINE_TOKENS_WITHIN_MS }),
    [captions],
  );

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1] ?? null;
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endMs = Math.min(next ? next.startMs : Infinity, page.startMs + COMBINE_TOKENS_WITHIN_MS * 2);
        const duration = Math.max(1, Math.round(((endMs - page.startMs) / 1000) * fps));
        return (
          <Sequence key={i} from={startFrame} durationInFrames={duration} layout="none">
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absoluteMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 120, fontFamily }}>
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          whiteSpace: "pre",
          textAlign: "center",
          padding: "12px 28px",
          borderRadius: 16,
          background: "rgba(0,0,0,0.45)",
          textShadow: "0 4px 12px rgba(0,0,0,0.6)",
        }}
      >
        {page.tokens.map((t) => {
          const active = t.fromMs <= absoluteMs && t.toMs > absoluteMs;
          return (
            <span key={t.fromMs} style={{ color: active ? "#ffd43b" : "white" }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
