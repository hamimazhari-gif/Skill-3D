import type { Caption } from "@remotion/captions";

/**
 * Example captions. Each word has a start/end time in milliseconds.
 * Note the leading space in `text` for every word except the very first one.
 *
 * You can also load captions from an .srt file with `parseSrt()` from @remotion/captions,
 * or generate them automatically from a voice-over with @remotion/install-whisper-cpp.
 */
const words: [string, number, number][] = [
  ["Selamat", 3200, 3600],
  [" datang", 3600, 4100],
  [" di", 4100, 4300],
  [" dunia", 4300, 4800],
  [" animasi", 4800, 5500],
  [" 3D.", 5500, 6200],
  [" Dibuat", 6600, 7000],
  [" dengan", 7000, 7400],
  [" Three.js", 7400, 8100],
  [" dan", 8100, 8300],
  [" Remotion.", 8300, 9300],
];

export const captions: Caption[] = words.map(([text, startMs, endMs]) => ({
  text,
  startMs,
  endMs,
  timestampMs: (startMs + endMs) / 2,
  confidence: 1,
}));
