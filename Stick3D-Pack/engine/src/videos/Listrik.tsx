// "Listrik 30 Hari" — 17 scenes, 9:16 720x1280 30 fps, Indonesian VO (120.3 s after trim).
import React from "react";
import { AbsoluteFill, useCurrentFrame, Audio, staticFile } from "remotion";
import { Grade } from "../style/kit";
import { Captions } from "../Main";
import { Scene, FPS } from "./listrik/common";
import { S1, S2, S3, S4, S5, S6, S7, S8 } from "./listrik/A";
import { S9, S10, S11, S12, S13, S14, S15, S16, S17, OFF16 } from "./listrik/B";

export const CUTS = [0, 7.40, 14.66, 24.50, 31.40, 40.80, 46.15, 52.00, 65.15, 72.80, 78.55, 86.22, 91.36, 101.08, 106.15, 112.58, 117.12, 120.40];
const TINT = ["rgba(120,60,200,.07)", "rgba(255,200,90,.05)", "rgba(255,90,30,.08)", "rgba(0,160,200,.07)", "rgba(120,220,255,.05)", "rgba(110,60,220,.08)", "rgba(255,240,120,.04)", "rgba(255,200,110,.05)",
  "rgba(20,30,120,.12)", "rgba(0,120,140,.08)", "rgba(80,180,255,.04)", "rgba(255,150,40,.07)", "rgba(255,110,90,.07)", "rgba(80,60,200,.06)", "rgba(255,230,140,.05)", "rgba(80,200,255,.04)", "rgba(20,20,90,.12)"];
export const Listrik: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const si = Math.max(0, CUTS.findIndex((c, i) => t >= c && t < (CUTS[i + 1] ?? 999)));
  const C = CUTS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("mix.wav")} />
      <Scene first start={C[0]} end={C[1]} bg="#2a1a5a" dark={(tt) => (tt > 3.05 ? 0.22 : 0)}>{(c) => <S1 {...c} />}</Scene>
      <Scene start={C[1]} end={C[2]} bg="#f2d49a" trans="dip">{(c) => <S2 {...c} />}</Scene>
      <Scene start={C[2]} end={C[3]} bg="#2a1414" trans="whip">{(c) => <S3 {...c} />}</Scene>
      <Scene start={C[3]} end={C[4]} bg="#0a1a3a" trans="zoom">{(c) => <S4 {...c} />}</Scene>
      <Scene start={C[4]} end={C[5]} bg="#bfe9ff" trans="ghost">{(c) => <S5 {...c} />}</Scene>
      <Scene start={C[5]} end={C[6]} bg="#1a1440" trans="whip">{(c) => <S6 {...c} />}</Scene>
      <Scene start={C[6]} end={C[7]} bg="#8acaff" trans="zoom">{(c) => <S7 {...c} />}</Scene>
      <Scene start={C[7]} end={C[8]} bg="#8acaff" trans="ghost">{(c) => <S8 {...c} />}</Scene>
      <Scene start={C[8]} end={C[9]} bg="#04061a" trans="dip">{(c) => <S9 {...c} />}</Scene>
      <Scene start={C[9]} end={C[10]} bg="#050a24" trans="ghost">{(c) => <S10 {...c} />}</Scene>
      <Scene start={C[10]} end={C[11]} bg="#8acaff" trans="flash">{(c) => <S11 {...c} />}</Scene>
      <Scene start={C[11]} end={C[12]} bg="#ff9a5a" trans="whip">{(c) => <S12 {...c} />}</Scene>
      <Scene start={C[12]} end={C[13]} bg="#ff9a7a" trans="zoom">{(c) => <S13 {...c} />}</Scene>
      <Scene start={C[13]} end={C[14]} bg="#141430" trans="dip" dark={(tt) => (tt < 105.69 ? 0.18 : 0)}>{(c) => <S14 {...c} />}</Scene>
      <Scene start={C[14]} end={C[15]} bg="#ffe0a0" trans="flash">{(c) => <S15 {...c} />}</Scene>
      <Scene start={C[15]} end={C[16]} bg="#9fd8ff" trans="ghost" dark={(tt) => (tt >= OFF16 ? 0.55 : 0)}>{(c) => <S16 {...c} />}</Scene>
      <Scene start={C[16]} end={C[17]} bg="#03041a" trans="ghost" dark={() => 0.12}>{(c) => <S17 {...c} />}</Scene>
      <Grade t={t} shaft={false} tint={TINT[si]} />
      <Captions />
    </AbsoluteFill>
  );
};
