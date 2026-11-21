// Shared bits for "Listrik 30 Hari" (Indonesian, 120 s). Scene wrapper copied from NvidiaV4 (+ "dark" overlay support).
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Look } from "../../style/puppet";
import { seg, lerp, clamp, V3 } from "../../style/kit";

export const FPS = 30, LEAD = 6, TAIL = 8, WALK = 3.4;
export type Ctx = { t: number; f: number };
export type Trans = "ghost" | "zoom" | "flash" | "whip" | "dip";

export const Scene: React.FC<{ start: number; end: number; first?: boolean; trans?: Trans; bg: string; dark?: (t: number) => number; children: (c: Ctx) => React.ReactNode }> = ({ start, end, first, trans = "ghost", bg, dark, children }) => {
  const from = Math.round(start * FPS) - (first ? 0 : LEAD), dur = Math.round(end * FPS) - from + TAIL;
  return <Sequence from={from} durationInFrames={dur} layout="none"><Inner from={from} first={first} trans={trans} bg={bg} dark={dark} children={children} /></Sequence>;
};
const Inner: React.FC<{ from: number; first?: boolean; trans: Trans; bg: string; dark?: (t: number) => number; children: (c: Ctx) => React.ReactNode }> = ({ from, first, trans, bg, dark, children }) => {
  const f = useCurrentFrame(), t = (f + from) / FPS;
  const k = first ? 1 : clamp(f / (LEAD + 2)), ke = Easing.out(Easing.cubic)(k);
  const sc = !first && trans === "zoom" ? lerp(1.35, 1, ke) : 1;
  const tx = !first && trans === "whip" ? (1 - ke) * 720 : 0, blur = !first && trans === "whip" ? (1 - ke) * 14 : 0;
  const dk = dark ? clamp(dark(t)) : 0;
  return (
    <AbsoluteFill style={{ opacity: first || trans === "flash" || trans === "whip" ? 1 : k, transform: `translateX(${tx}px) scale(${sc})`, background: bg, filter: `saturate(1.32) contrast(1.07) brightness(1.02)${blur > 0.2 ? ` blur(${blur.toFixed(1)}px)` : ""}` }}>
      <ThreeCanvas width={720} height={1280} camera={{ fov: 60, position: [0, 2, 8], near: 0.1, far: 200 }} gl={{ antialias: true }}>
        <color attach="background" args={[bg]} />{children({ t, f })}
      </ThreeCanvas>
      {dk > 0 ? <AbsoluteFill style={{ background: "#05061a", opacity: dk }} /> : null}
      {!first && trans === "flash" ? <AbsoluteFill style={{ background: "#fff", opacity: 1 - clamp(f / 7) }} /> : null}
      {!first && trans === "dip" ? <AbsoluteFill style={{ background: "#000", opacity: 1 - clamp(f / 8) }} /> : null}
    </AbsoluteFill>
  );
};

// cast (same people in every scene)
export const budi: Look = { skin: "#f4cfa8", body: "#ff7a1a", outfit: "shirt", hair: "short", hairColor: "#1b1b2a", shoe: "#1b1b2a" };
export const sari: Look = { skin: "#e8b98f", body: "#1fb59a", outfit: "shirt", hair: "bob", hairColor: "#2a1810", shoe: "#5a2a14" };
export const dimas: Look = { skin: "#f4cfa8", body: "#ffd23a", outfit: "hoodie", hair: "short", hairColor: "#2a1a12", shoe: "#2f6bff" };
export const pakRT: Look = { skin: "#d9a57a", body: "#7c4dff", outfit: "shirt", hair: "grey", glasses: true, shoe: "#2a1a12" };
export const buTin: Look = { skin: "#f1c9a2", body: "#ff4fa0", outfit: "shirt", hair: "bob", hairColor: "#5a3420", shoe: "#2a1a12" };
export const mas: Look = { skin: "#c98e62", body: "#2f8cff", outfit: "hoodie", hair: "swept", hairColor: "#111", shoe: "#111" };
export const extra: Look[] = [
  { skin: "#fbe3c8", body: "#e53e3e", outfit: "hoodie", hair: "short", hairColor: "#222" }, { skin: "#c98e62", body: "#22a867", outfit: "shirt", hair: "bob", hairColor: "#1a1010" },
  { skin: "#8d5a3a", body: "#f0b429", outfit: "shirt", hair: "swept", hairColor: "#111", glasses: true }, { skin: "#e0b48c", body: "#2d3142", outfit: "blazer", shirt: "#fff", hair: "short", hairColor: "#3b2a1a" },
];
export const ADULT = 3.4, KID = 2.4;

export const yawTo = (cam: V3, p: V3) => Math.atan2(cam[0] - p[0], cam[2] - p[2]);
export const toWorld = (p: V3, loc: V3, cam: V3): V3 => { const y = yawTo(cam, p); return [p[0] + loc[0] * Math.cos(y) + loc[2] * Math.sin(y), p[1] + loc[1], p[2] - loc[0] * Math.sin(y) + loc[2] * Math.cos(y)]; };

// shock jump-back: anticipation squash (0.12 s) -> parabolic hop -> landing squash. Returns offset along dir, height, squash
export const jumpBack = (t: number, t0: number, dist = 0.8, hgt = 0.6, dur = 0.42) => {
  const a0 = t0 - 0.12, jt = clamp((t - t0) / dur);
  const y = t > t0 && t < t0 + dur ? Math.sin(jt * Math.PI) * hgt : 0;
  const land = t >= t0 + dur ? Math.max(0, 1 - (t - t0 - dur) / 0.2) : 0;
  const sq = t < a0 ? 0 : t < t0 ? -0.16 * seg(t, a0, t0, Easing.linear) : t < t0 + dur ? 0.14 : -0.22 * land;
  return { d: dist * Easing.out(Easing.quad)(jt), y, sq, air: y > 0.001 };
};
// celebratory jump in place (repeatable): returns y and squash
export const hopCycle = (t: number, t0: number, t1: number, period = 0.5, hgt = 0.5) => {
  if (t < t0 - 0.1 || t > t1) return { y: 0, sq: 0, air: false };
  if (t < t0) return { y: 0, sq: -0.14 * seg(t, t0 - 0.1, t0, Easing.linear), air: false };
  const u = ((t - t0) % period) / period, air = u < 0.72, ju = u / 0.72;
  return { y: air ? Math.sin(ju * Math.PI) * hgt : 0, sq: air ? 0.12 * Math.cos(ju * Math.PI * 2) * 0.5 + 0.06 : -0.18 * Math.sin(((u - 0.72) / 0.28) * Math.PI), air };
};
// eased walk between x0..x1 over [t0,t1]; phase from distance (no foot sliding)
export const walkSeg = (t: number, t0: number, t1: number, a: number, b: number) => {
  const k = seg(t, t0, t1, Easing.inOut(Easing.sin)), x = lerp(a, b, k), moving = t > t0 && t < t1;
  return { x, moving, phase: Math.abs(x - a) * WALK, speed: moving ? 0.85 * Math.min(1, Math.sin(clamp((t - t0) / (t1 - t0)) * Math.PI) * 2) : 0, left: b < a };
};
export { seg, lerp, clamp };
