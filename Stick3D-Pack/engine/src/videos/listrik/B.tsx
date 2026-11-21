// Listrik 30 Hari — scenes 9-17 (65.15 – 120.33 s)
import React from "react";
import { Easing } from "remotion";
import { Box, Cyl, Ball, CanvasPlane, Surface, INK } from "../../style/toon";
import { Person, Lights, Clock, V3 } from "../../style/kit";
import { Floor, WallDoor, SideWall, Glow, Shaft, Plant, Shelf, Frame, Chair, Rug, Dust, Cabinet } from "../../style/props";
import { Cam, Key, FaceGroup, hand, StreetLamp, StreetSign, Barrier, SpotCone, Bench } from "../../style/extra";
import { mixC, Sky, Moon, Sofa, Table, StandFan, TV, TVCabinet, Bulb, Candle, Phone, Socket, Cable, Tree, Palm, Fence, House, Bowl, Mat, Frog, Cricket, Mosquito, Note, Confetti, TearCal, SignalBars, TokenMeter, Cat } from "../../style/home";
import { WallHole } from "./A";
import { Ctx, budi, sari, dimas, pakRT, buTin, mas, extra, ADULT, KID, jumpBack, hopCycle, walkSeg, seg, lerp, clamp, WALK } from "./common";

const kidA = { ...extra[0], body: "#ff4fa0" }, kidB = { ...extra[1], body: "#2f8cff" }, kidC = { ...extra[2], body: "#2fd46a" };

/* =================== S9 65.15 – 72.80  hari kelima belas: malam mencekam =================== */
const zb = (t: number) => lerp(-14, -3, clamp((t - 65.3) / 7.3));
const K9: Key[] = [
  { t: 65.0, pos: [1.4, 3.6, -4.6], look: [0, 2.2, -14], fov: 54 },
  { t: 67.6, pos: [0.8, 3.2, -1.6], look: [0, 2.2, -10.5], fov: 52 },
  { t: 68.9, pos: [-1.2, 2.8, 0.4], look: [1.6, 3.8, -8.8], fov: 56 },
  { t: 70.1, pos: [1.4, 3.0, 2.0], look: [-3.0, 2.4, -6.6], fov: 54 },
  { t: 71.8, pos: [0.6, 3.0, 3.6], look: [0, 2.3, -4.6], fov: 50 },
  { t: 73.0, pos: [0.4, 3.0, 4.8], look: [0, 2.4, -3.0], fov: 48 },
];
export const S9 = ({ t, f }: Ctx) => {
  const z = zb(t), moving = t > 65.3 && t < 72.6, P: V3 = [0.2, 0, z], phoneUp = seg(t, 71.3, 71.6), eyes = t > 67.4 && t < 68.4 && Math.sin(t * 9) > -0.6;
  const tense = t > 67.3 && t < 68.4;
  return (<>
    <Cam t={t} keys={K9} />
    <Lights warm="#8a9aff" />
    <Sky p={[0, 18, -60]} s={[140, 60]} top="#04061a" bottom="#1a1a4a" stars={1} t={t} />
    <Moon p={[-14, 20, -55]} r={2.4} o={0.7} />
    {[[-10, 21, -52], [-17, 19.5, -52]].map((q, i) => <Ball key={i} p={q as V3} r={2.6} s={[2.2, 0.7, 1]} color="#2a2a5a" ink={0} />)}
    <Surface p={[0, 0, -16]} s={[7, 50]} rot={[-Math.PI / 2, 0, 0]} kind="plain" a="#1c1c34" b="#1c1c34" />
    {Array.from({ length: 10 }, (_, i) => <Box key={i} p={[0, 0.02, 4 - i * 4.6]} s={[0.16, 0.02, 1.8]} color="#6a6a7a" line={1} />)}
    {[-1, 1].map((s) => <Surface key={s} p={[s * 5.5, 0.12, -16]} s={[4, 50]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a="#2a2a44" b="#26263e" unit={1.4} />)}
    {[[-7.5, -4], [-7.5, -11], [-7.5, -18]].map(([x, zz], i) => <House key={i} p={[x, 0, zz]} rotY={Math.PI / 2} w={6} d={5} wall={["#3a3a6a", "#41356a", "#2f3a62"][i]} roof="#4a2a4a" lit={0} />)}
    {[[7.5, -7.5], [7.5, -14.5]].map(([x, zz], i) => <House key={"r" + i} p={[x, 0, zz]} rotY={-Math.PI / 2} w={6} d={5} wall={["#373a66", "#3d3466"][i]} roof="#4a2a4a" lit={0} />)}
    <StreetLamp p={[2.6, 0.12, -8.6]} on={0} flip /><StreetLamp p={[-2.6, 0.12, -14]} on={0} /><StreetLamp p={[2.6, 0.12, -20]} on={0} flip /><StreetLamp p={[-2.6, 0.12, -2.4]} on={0} />
    {/* dead power poles + lines */}
    {[-5, -17].map((zz) => <Cyl key={zz} p={[-3.6, 3.5, zz]} rt={0.12} h={7} color="#3a3040" line={2} />)}
    <Cable a={[-3.6, 6.8, -5]} b={[-3.6, 6.8, -17]} sag={0.8} color="#0a0a14" /><Cable a={[-3.6, 6.4, -5]} b={[-3.6, 6.4, -17]} sag={0.9} color="#0a0a14" />
    <Ball p={[-3.4, 0.6, -9.5]} r={0.9} s={[1.4, 0.8, 1]} color="#14301e" ink={0.04} /><Ball p={[3.6, 0.6, -12]} r={0.9} s={[1.4, 0.8, 1]} color="#14301e" ink={0.04} />
    {eyes ? [-0.14, 0.14].map((dx) => <Glow key={dx} p={[-3.3 + dx, 0.75, -8.75]} r={0.2} color="rgba(255,240,80,1)" o={1} />) : null}
    <Tree p={[4.4, 0, -3]} s={1.1} leaf="#1a3a2a" /><Tree p={[-4.6, 0, -21]} s={1.3} leaf="#1a3a2a" /><Fence p={[3.6, 0, -1]} n={6} gap={0.6} color="#4a4a6a" rotY={Math.PI / 2} />
    <Person p={P} h={ADULT} look={budi} f={f} pose={{ mood: tense ? "gulp" : t > 71.7 ? "deadpan" : "worry", nerv: tense ? 0.75 : 0.35, sweat: 1, hunch: 0.7, walk: moving ? (z + 14) * WALK : undefined, speed: moving ? 0.55 : 0,
      armR: [0.2, 0.48], armRK: 1, armL: [-0.08, lerp(0.4, 0.62, phoneUp)], armLK: phoneUp, lookX: tense ? Math.sin(t * 5) : t > 68.6 && t < 69.5 ? 1 : t > 69.7 && t < 70.9 ? -1 : 0 }} />
    <FaceGroup p={P}><Candle p={hand(ADULT, [0.2, 0.48], 0, false, 0.14)} t={t} s={0.9} />{phoneUp > 0 ? <Phone p={hand(ADULT, [-0.08, 0.62], 0, false, 0.14)} s={0.8} draw={(c, W, H) => { c.fillStyle = "#101426"; c.fillRect(0, 0, W, H); c.fillStyle = "#5a6a9a"; c.font = "900 16px Inter"; c.textAlign = "center"; c.fillText("0", W / 2, H / 2 - 4); c.fillText("notifikasi", W / 2, H / 2 + 18); }} /> : null}</FaceGroup>
    <Glow p={[P[0] + 0.8, 2.0, z + 0.6]} r={3.2} color="rgba(255,170,80,1)" o={0.35} />
    <Dust t={t} area={[5, 5, 4]} color="rgba(180,190,255,.6)" />
  </>);
};

/* =================== S10 72.80 – 78.55  konser jangkrik, kodok, nyamuk =================== */
const K10: Key[] = [
  { t: 72.6, pos: [-4.2, 0.9, 3.2], look: [-2.2, 1.1, -2.0], fov: 52 },
  { t: 73.9, pos: [-3.6, 1.0, 1.6], look: [-2.9, 1.1, -1.9], fov: 46 },
  { t: 74.7, pos: [-0.6, 1.2, 2.2], look: [0, 1.7, -2.6], fov: 48 },
  { t: 75.6, pos: [1.6, 1.5, 2.2], look: [0.8, 1.9, -0.4], fov: 52 },
  { t: 77.1, pos: [0.6, 2.6, 6.6], look: [0, 2.0, -4.2], fov: 58 },
  { t: 78.8, pos: [0.4, 3.1, 8.2], look: [0, 2.3, -5.0], fov: 58 },
];
export const S10 = ({ t, f }: Ctx) => {
  const cK = seg(t, 74.0, 74.3), fK = seg(t, 74.58, 74.9), mK = seg(t, 75.39, 75.7), all = seg(t, 76.99, 77.4);
  const puff = fK > 0 ? 0.5 + 0.5 * Math.sin(t * 9) : 0;
  const mq = seg(t, 75.2, 75.9, Easing.out(Easing.cubic)), mp: V3 = t < 75.9 ? [lerp(4.5, 1.0, mq), lerp(2.8, 1.9, mq), lerp(0.8, 0.2, mq)] : [1.0 + Math.sin((t - 75.9) * 2.2) * 0.9, 1.9 + Math.sin((t - 75.9) * 4.4) * 0.25, 0.2 - Math.cos((t - 75.9) * 2.2) * 0.6];
  const notes = (o: V3, t0: number, col: string, n = 4) => t > t0 ? Array.from({ length: n }, (_, i) => { const u = ((t - t0) * 0.55 + i / n) % 1; return <Note key={col + i} p={[o[0] + Math.sin(u * 7 + i) * 0.5, o[1] + u * 2.4, o[2]]} s={0.55} color={col} o={Math.sin(u * Math.PI)} two={i % 2 === 0} />; }) : null;
  return (<>
    <Cam t={t} keys={K10} />
    <Lights warm="#9adcff" />
    <Sky p={[0, 12, -40]} s={[100, 40]} top="#050a24" bottom="#1a3a5a" stars={1} t={t} />
    <Moon p={[8, 11, -36]} r={2.6} />
    <Surface p={[0, 0, -4]} s={[40, 30]} rot={[-Math.PI / 2, 0, 0]} kind="carpet" a="#143a3a" b="#123434" unit={2.0} />
    <CanvasPlane p={[0.2, 0.03, -2.2]} rot={[-Math.PI / 2, 0, 0]} s={[7, 4.6]} px={[350, 230]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); const g = c.createRadialGradient(W * 0.6, H * 0.4, 10, W / 2, H / 2, W / 2); g.addColorStop(0, "#3a7aa8"); g.addColorStop(1, "#14406a"); c.fillStyle = g; c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.ellipse(W / 2, H / 2, W * 0.47, H * 0.44, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = "rgba(255,250,200,.5)"; c.beginPath(); c.ellipse(W * 0.66, H * 0.36, 26, 9, 0, 0, 7); c.fill(); for (let i = 0; i < 3; i++) { const r = ((t * 30 + i * 30) % 90); c.strokeStyle = `rgba(200,240,255,${1 - r / 90})`; c.lineWidth = 3; c.beginPath(); c.ellipse(W / 2, H * 0.45, r, r * 0.4, 0, 0, 7); c.stroke(); } }} />
    {[[-1.8, -0.8], [2.4, -1.4], [-0.6, -3.6]].map(([x, z], i) => <CanvasPlane key={i} p={[x, 0.05, z]} rot={[-Math.PI / 2, 0, i]} s={[1.0, 1.0]} px={[64, 64]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "#3fae5a"; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(W / 2, H / 2); c.arc(W / 2, H / 2, 28, 0.4, Math.PI * 2 - 0.1); c.closePath(); c.fill(); c.stroke(); }} />)}
    {/* rock stage */}
    <Ball p={[0, 0.25, -2.6]} r={1.0} s={[1.3, 0.6, 1]} color="#5a6070" ink={0.05} />
    <Frog p={[0, 1.4, -2.55]} s={1.7} t={t} puff={puff} />
    {[[-2.6, 0.0, -1.6], [-3.5, 0.0, -2.8], [-2.0, 0.0, -3.4]].map((q, i) => <React.Fragment key={i}>{Array.from({ length: 4 }, (_, k) => <Box key={k} p={[q[0] + (k - 1.5) * 0.12, 0.5 + k * 0.05, q[2]]} s={[0.05, 1.0 + k * 0.1, 0.05]} rot={[0, 0, (k - 1.5) * 0.12 + Math.sin(t * 2 + k) * 0.05]} color="#3fae5a" line={1} />)}<Cricket p={[q[0], 1.05 + i * 0.05, q[2] + 0.05]} s={0.9} t={t + i} play={cK} /></React.Fragment>)}
    {t > 75.15 ? <Mosquito p={mp} s={0.9} t={t} mic /> : null}
    {/* moon spotlights */}
    <SpotCone p={[-2.7, 7, -2.2]} h={7} r={1.4} color="#a0ffc8" o={0.14 * cK} />
    <SpotCone p={[0, 7.4, -2.6]} h={6.4} r={1.4} color="#ffc0f0" o={0.16 * fK} />
    <SpotCone p={[mp[0], 7, mp[2]]} h={7 - mp[1] + 0.3} r={0.8} color="#ffe9a0" o={0.12 * mK} />
    <Glow p={[0, 1.6, -2.3]} r={2.0} color="rgba(255,150,240,1)" o={0.4 * fK} /><Glow p={[-2.7, 1.1, -2.0]} r={1.8} color="rgba(120,255,180,1)" o={0.35 * cK} />
    {notes([-2.7, 1.6, -2.0], 74.0, "#8affc8")}{notes([0, 2.4, -2.4], 74.6, "#ff8ad8")}{notes([mp[0], mp[1] + 0.4, mp[2]], 75.6, "#ffe07a", 3)}
    {all > 0 ? Array.from({ length: 6 }, (_, i) => <Note key={"a" + i} p={[-3 + i * 1.2, 2.8 + Math.sin(t * 2 + i) * 0.4, -3.6]} s={0.7 * all} color={["#ff8ad8", "#8affc8", "#ffe07a"][i % 3]} two={i % 2 === 1} />) : null}
    {/* fireflies */}
    {Array.from({ length: 10 }, (_, i) => <Glow key={"ff" + i} p={[Math.sin(i * 5.1 + t * 0.4) * 5, 0.8 + (i % 4) * 0.5 + Math.sin(t + i) * 0.2, -4 + Math.cos(i * 3.3) * 3]} r={0.25} color="rgba(220,255,120,1)" o={0.6 + 0.4 * Math.sin(t * 4 + i)} />)}
    {/* house in the back: Budi on the steps, covering his ears */}
    <House p={[2.6, 0, -11]} w={6} d={4} wall="#2a3a5a" roof="#3a2a4a" lit={0.25} />
    <Box p={[1.8, 0.2, -8.6]} s={[2.4, 0.4, 0.8]} color="#4a3a3a" />
    <Person p={[1.6, 0.4, -8.4]} sy={0.4} h={ADULT} look={budi} f={f} pose={{ mood: t > 76.9 ? "angry" : "worry", sit: 1, arms: "head", armK: seg(t, 75.4, 75.8), nerv: 0.3, lookX: -0.5 }} />
    <Candle p={[3.0, 0.4, -8.4]} t={t} s={0.8} />
    <Tree p={[-6, 0, -9]} s={1.3} leaf="#1a4a3a" /><Tree p={[7, 0, -7]} s={1.1} leaf="#1a4a3a" /><Fence p={[-5, 0, -6.4]} n={7} gap={0.6} color="#4a5a6a" />
  </>);
};

/* =================== S11 78.55 – 86.22  hari kedua puluh: semua orang berburu sinyal =================== */
const K11: Key[] = [
  { t: 78.35, pos: [6.0, 9.0, 10.0], look: [0, 1.6, -1], fov: 56 },
  { t: 80.3, pos: [2.6, 5.4, 6.8], look: [-1.8, 3.0, -2], fov: 50 },
  { t: 81.5, pos: [-2.0, 6.0, 8.6], look: [-6.4, 1.8, -4.4], fov: 54 },
  { t: 83.0, pos: [-5.6, 8.0, 8.4], look: [0, 2.0, -1.5], fov: 58 },
  { t: 84.3, pos: [-3.6, 1.8, 7.2], look: [0, 4.6, -6], fov: 58 },
  { t: 86.4, pos: [-3.0, 2.2, 6.2], look: [-5, 5.2, -30], fov: 50 },
];
export const S11 = ({ t, f }: Ctx) => {
  const wob = t > 80.2 && t < 81.4 ? Math.sin((t - 80.2) * 9) * 0.12 * (1 - seg(t, 80.9, 81.4)) : Math.sin(t * 1.3) * 0.02;
  const higher = seg(t, 84.0, 84.4), bw = walkSeg(t, 78.6, 80.0, -0.8, 1.4), bw2 = walkSeg(t, 82.2, 83.6, 1.4, -0.2);
  const bx = t < 82.2 ? bw.x : bw2.x, bm = bw.moving || bw2.moving;
  const ex1 = walkSeg(t, 81.45, 83.2, -6.6, -4.2), ex2 = walkSeg(t, 81.75, 83.5, -6.6, -3.0);
  const up = (k = 0): [number, number] => [0.1 + Math.sin(t * 2 + k) * 0.03, lerp(0.92, 1.02, higher)];
  const people: { p: V3; l: any; h: number; key: number; sy?: number }[] = [
    { p: [-1.8, 2.15, -2.0], l: extra[0], h: ADULT, key: 1, sy: 2.15 },
    { p: [3.4, 2.0, -3.4], l: mas, h: ADULT, key: 2, sy: 2.0 },
    { p: [6.2, 2.9, -4.2], l: extra[3], h: ADULT, key: 3, sy: 2.9 },
    { p: [-3.6, 0, 1.2], l: sari, h: ADULT, key: 4 },
  ];
  const towerOn = Math.sin(t * 5) > 0.3;
  return (<>
    <Cam t={t} keys={K11} />
    <Lights warm="#fff6d8" />
    <Sky p={[0, 18, -50]} s={[140, 60]} top="#2a8cff" bottom="#bfe6ff" />
    {[[-20, -44, 12], [8, -48, 16], [30, -40, 11]].map(([x, z, r], i) => <Ball key={i} p={[x, -r * 0.5, z]} r={r} color={["#4ab85a", "#3aa84e", "#52c062"][i]} ink={0.15} />)}
    <Surface p={[0, 0, -4]} s={[50, 40]} rot={[-Math.PI / 2, 0, 0]} kind="carpet" a="#6ad06a" b="#62c862" unit={2.6} />
    {/* cell tower on the far hill */}
    <group position={[-10, 2, -34]}>{[-1, 1].map((s) => <Box key={s} p={[s * 0.7, 6, 0]} s={[0.15, 12, 0.15]} rot={[0, 0, -s * 0.05]} color="#d8dde8" line={2} />)}{[2, 5, 8, 11].map((y) => <Box key={y} p={[0, y, 0]} s={[1.4 - y * 0.06, 0.1, 0.1]} color="#d8dde8" line={2} />)}<Box p={[0, 11.6, 0.2]} s={[0.4, 1.2, 0.2]} color="#f2f2f2" line={2} /><Ball p={[0, 12.4, 0]} r={0.22} color={towerOn ? "#ff3b3b" : "#6a2020"} ink={0.03} />{towerOn ? <Glow p={[0, 12.4, 0.4]} r={1.6} color="rgba(255,60,60,1)" o={0.8} /> : null}</group>
    {/* table + chair stack (wobbling) */}
    <group position={[-1.8, 0, -2.0]} rotation={[0, 0, wob]}><Table p={[0, 0, 0]} w={1.8} d={1.2} h={1.1} top="#c98a4a" /><Box p={[0, 1.6, 0]} s={[1.0, 0.9, 1.0]} color="#2f8cff" /><Person p={[0, 2.05, 0]} sy={2.05} h={ADULT} look={extra[0]} f={f} pose={{ mood: wob > 0.05 || wob < -0.05 ? "shock" : "worry", sweat: 1, nerv: 0.5, armR: up(1), armRK: 1, armL: [-0.2, 0.7 + wob], armLK: 1 }} /><FaceGroup p={[0, 2.05, 0]}><Phone p={hand(ADULT, up(1), 0, false, 0.12)} s={0.8} /></FaceGroup></group>
    {/* ladder */}
    <group position={[3.4, 0, -3.4]}>{[-0.5, 0.5].map((x) => <Box key={x} p={[x, 1.0, 0.3]} s={[0.1, 2.1, 0.1]} rot={[-0.25, 0, 0]} color="#ffc23a" line={2} />)}{[-0.5, 0.5].map((x) => <Box key={"b" + x} p={[x, 1.0, -0.3]} s={[0.1, 2.1, 0.1]} rot={[0.25, 0, 0]} color="#ffc23a" line={2} />)}{[0.5, 1.0, 1.5].map((y) => <Box key={y} p={[0, y, 0.33 - y * 0.12]} s={[1.0, 0.08, 0.1]} color="#ffc23a" line={2} />)}<Box p={[0, 2.0, 0]} s={[1.1, 0.12, 0.6]} color="#ffc23a" line={2} /></group>
    <Tree p={[6.6, 0, -4.6]} s={1.0} />
    <Box p={[6.2, 2.85, -4.3]} s={[1.8, 0.14, 0.5]} color="#7a4a2a" />
    {people.slice(1).map((m) => <React.Fragment key={m.key}><Person p={m.p} sy={m.sy ?? 0} h={m.h} look={m.l} f={f + m.key * 9} pose={{ mood: higher > 0.5 ? "grin" : "worry", sweat: 0.6, armR: up(m.key), armRK: 1, lookX: Math.sin(t + m.key) }} /><FaceGroup p={m.p}><Phone p={hand(m.h, up(m.key), 0, false, 0.12)} s={0.8} /></FaceGroup></React.Fragment>)}
    {/* neighbours leave the house to hunt for signal */}
    <House p={[-7.2, 0, -7]} w={5} d={4} wall="#f2b06a" roof="#c0443a" />
    <Box p={[-8.1, 1.3, -4.96]} s={[1.0, 2.6, 0.06]} color="#2a1a10" line={2} />
    {t > 81.45 ? <Person p={[ex1.x < -6.2 ? -8.1 : ex1.x, 0, lerp(-4.6, 0.4, seg(t, 81.45, 83.2))]} h={ADULT} look={buTin} f={f} pose={{ mood: "worry", walk: ex1.moving ? ex1.phase * 1.4 : undefined, speed: ex1.speed, armR: up(5), armRK: seg(t, 82, 82.3) }} /> : null}
    {t > 81.75 ? <Person p={[ex2.x < -6.2 ? -8.1 : ex2.x, 0, lerp(-4.6, -0.8, seg(t, 81.75, 83.5))]} h={ADULT} look={pakRT} f={f} pose={{ mood: "worry", walk: ex2.moving ? ex2.phase * 1.4 : undefined, speed: ex2.speed, armR: up(6), armRK: seg(t, 82.3, 82.6) }} /> : null}
    {/* Budi walks around with his phone in the air */}
    <Person p={[bx, 0, 0.6]} h={ADULT} look={budi} f={f} pose={{ mood: higher > 0.5 ? "grin" : "worry", sweat: 1, nerv: 0.3, walk: bm ? (bw.moving ? bw.phase : bw2.phase) : undefined, speed: bm ? 0.7 : 0, flip: t > 82.2, armR: up(0), armRK: 1, lookX: 0.6 }} />
    <FaceGroup p={[bx, 0, 0.6]}><Phone p={hand(ADULT, up(0), 0, t > 82.2, 0.12)} s={0.8} /></FaceGroup>
    <Bench p={[2.4, 0, 2.6]} /><Plant p={[-5.0, 0, -2.6]} s={1.0} /><Palm p={[9, 0, -8]} s={1.1} /><Fence p={[-12, 0, 3.4]} n={12} gap={0.7} />
    <Dust t={t} area={[8, 6, 5]} color="rgba(255,255,230,.8)" />
  </>);
};

/* =================== S12 86.22 – 91.36  satu garis sinyal > saldo bertambah =================== */
const K12: Key[] = [
  { t: 86.0, pos: [0.5, 2.6, 6.8], look: [0.2, 2.2, 0], fov: 48 },
  { t: 87.7, pos: [0.5, 2.7, 6.2], look: [0.25, 2.4, 0], fov: 46 },
  { t: 88.7, pos: [1.2, 2.7, 8.8], look: [0, 2.2, 0], fov: 54 },
  { t: 89.6, pos: [-1.6, 2.7, 7.8], look: [-2.0, 2.1, 0], fov: 52 },
  { t: 90.9, pos: [-0.6, 2.7, 8.4], look: [-1.0, 2.0, 0], fov: 54 },
  { t: 91.6, pos: [-0.5, 2.8, 8.6], look: [-1.0, 2.0, 0], fov: 54 },
];
export const S12 = ({ t, f }: Ctx) => {
  const bars = t < 87.29 ? 0 : 1, pop = t > 87.29 ? Math.exp(-(t - 87.29) * 5) : 0, hop = hopCycle(t, 88.55, 89.8, 0.42, 0.55);
  const ph: [number, number] = t < 88.5 ? [0.13, 0.42] : hop.air ? [0.12, 0.98] : [0.08, 0.72];
  const rtP: V3 = [-2.6, 0, 0.2], book = seg(t, 89.3, 89.6), cnt = Math.round(lerp(1, 10, seg(t, 90.0, 90.9)));
  return (<>
    <Cam t={t} keys={K12} />
    <Lights warm="#ffd090" />
    <Sky p={[0, 14, -40]} s={[110, 46]} top="#ff7a4a" bottom="#ffe08a" />
    <Ball p={[6, 4, -38]} r={3.6} color="#fff2a0" ink={0} /><Glow p={[6, 4, -36]} r={11} color="rgba(255,230,140,1)" o={0.8} />
    {[[-18, -36, 10], [16, -34, 9]].map(([x, z, r], i) => <Ball key={i} p={[x, -r * 0.6, z]} r={r} color={["#d08a4a", "#c47a40"][i]} ink={0.12} />)}
    <Surface p={[0, 0, -5]} s={[40, 30]} rot={[-Math.PI / 2, 0, 0]} kind="carpet" a="#c8a04a" b="#c09846" unit={2.6} />
    <Surface p={[0, 0.02, -3.6]} s={[40, 3.2]} rot={[-Math.PI / 2, 0, 0]} kind="plain" a="#4a3a4a" b="#4a3a4a" />
    {Array.from({ length: 8 }, (_, i) => <Box key={i} p={[-14 + i * 4, 0.04, -3.6]} s={[1.8, 0.02, 0.14]} color="#ffe9a8" line={1} />)}
    <Barrier p={[2, 0, -5.6]} w={8} /><Barrier p={[-8, 0, -5.6]} w={8} />
    <StreetSign p={[4.6, 0, -1.4]} a="BUKIT SINYAL" h={3.8} />
    {/* warung */}
    <group position={[-6.4, 0, -1.6]}><Box p={[0, 1.0, 0]} s={[3.2, 2.0, 1.6]} color="#2fb59a" /><Box p={[0, 2.9, 0.4]} s={[3.8, 0.12, 2.2]} rot={[0.15, 0, 0]} color="#ff4f6a" />{[-1.7, 1.7].map((x) => <Cyl key={x} p={[x, 1.4, 1.3]} rt={0.06} h={2.8} color="#8a5a32" line={2} />)}{[0, 1, 2, 3].map((i) => <Box key={i} p={[-1.0 + i * 0.66, 2.25, 0.9]} s={[0.3, 0.5, 0.05]} color={["#ffd23a", "#ff8a1c", "#e5233a", "#2f8cff"][i]} line={2} />)}</group>
    <Tree p={[8.4, 0, -2]} s={1.2} leaf="#3a9a4a" /><Palm p={[-10, 0, -6]} s={1.1} /><Bench p={[6.6, 0, 1.0]} rotY={-0.4} />
    {/* Pak RT proudly opens his bank book */}
    <Person p={rtP} h={ADULT} look={pakRT} f={f} pose={{ mood: book > 0.5 ? "grin" : "smile", armR: [0.22, 0.55], armRK: book, armL: [0.1, 0.55], armLK: book, lookX: 1 }} />
    {book > 0.05 ? <FaceGroup p={rtP}><CanvasPlane p={[hand(ADULT, [0.18, 0.6])[0], hand(ADULT, [0.18, 0.6])[1], 0.2]} s={[1.3 * book, 0.85]} px={[260, 170]} frame="#1d5fa0" draw={(c, W, H) => { c.fillStyle = "#fffaf0"; c.fillRect(0, 0, W, H); c.fillStyle = "#1d5fa0"; c.font = "900 26px Inter"; c.textAlign = "center"; c.fillText("SALDO", W / 2, 36); c.fillStyle = "#11804a"; c.font = "900 44px Inter"; c.fillText(`+Rp ${cnt}jt`, W / 2, 96); c.fillStyle = "#999"; c.fillRect(30, 120, W - 60, 6); c.fillRect(30, 140, W - 90, 6); }} /></FaceGroup> : null}
    {/* Budi and the single bar */}
    <Person p={[0.2, hop.y, 0.4]} sy={0} h={ADULT} look={budi} f={f} pose={{ mood: t < 87.29 ? "worry" : t < 88.4 ? "shock" : "laugh", nerv: t < 87.29 ? 0.4 : 0, sweat: t < 87.29 ? 0.6 : 0, squash: hop.sq, air: hop.air ? 1 : 0,
      armR: ph, armRK: 1, armL: [-ph[0] + 0.05, ph[1] - 0.02], armLK: 1, lookX: t > 89.4 && t < 90.6 ? -0.3 : 0 }} />
    <FaceGroup p={[0.2, hop.y, 0.4]}><Phone p={[0.02 * ADULT, hand(ADULT, ph, hop.sq)[1], 0.16]} s={0.95} draw={(c, W, H) => { c.fillStyle = "#14204a"; c.fillRect(0, 0, W, H); for (let i = 0; i < 4; i++) { c.fillStyle = i < bars ? "#2fd46a" : "rgba(255,255,255,.25)"; c.fillRect(14 + i * 20, 40 - i * 8, 14, 12 + i * 8); } c.fillStyle = "#fff"; c.font = "900 16px Inter"; c.textAlign = "center"; c.fillText(bars ? "SINYAL!" : "Mencari...", W / 2, H * 0.62); }} /></FaceGroup>
    {t > 86.6 && t < 89.4 ? <SignalBars p={[0.2, ADULT + 0.45 + hop.y, 0.4]} s={1.1} n={bars} pop={pop} /> : null}
    {t > 87.29 ? <Glow p={[0.2, ADULT + 0.45 + hop.y, 0.6]} r={1.6} color="rgba(80,255,120,1)" o={0.6 * pop + 0.15} /> : null}
    {t > 88.6 ? Array.from({ length: 8 }, (_, i) => { const u = ((t - 88.6) * 0.8 + i / 8) % 1; return <Glow key={i} p={[0.2 + Math.cos(i * 0.8) * (0.6 + u * 1.6), 2.4 + Math.sin(i * 0.8) * (0.6 + u * 1.4) + hop.y, 0.8]} r={0.25} color="rgba(255,250,170,1)" o={1 - u} />; }) : null}
    <Dust t={t} area={[6, 5, 4]} color="rgba(255,240,190,.9)" />
  </>);
};

/* =================== S13 91.36 – 101.08  hari kedua puluh lima: terbiasa, main, ngobrol, makan bersama =================== */
const K13: Key[] = [
  { t: 91.16, pos: [-4.0, 8.6, 9.0], look: [-4.4, 1.6, -1.0], fov: 54 },
  { t: 94.7, pos: [-4.6, 2.6, 6.6], look: [-4.6, 2.2, -1.0], fov: 52 },
  { t: 96.4, pos: [1.2, 2.6, 6.2], look: [1.6, 2.4, -0.6], fov: 50 },
  { t: 98.3, pos: [6.4, 3.6, 9.2], look: [7.6, 1.5, -0.4], fov: 54 },
  { t: 100.1, pos: [8.2, 3.0, 7.4], look: [8.6, 1.2, 0.2], fov: 50 },
  { t: 101.3, pos: [8.0, 3.2, 7.8], look: [8.4, 1.3, 0.0], fov: 50 },
];
export const S13 = ({ t, f }: Ctx) => {
  const RP = 0.6, ra = ((t - 91) / RP) * Math.PI * 2, hop = hopCycle(t, 91.4, 101.2, RP, 0.45);
  const ropeK = (ra % (Math.PI * 2)) / (Math.PI * 2);
  const kite: V3 = [-1.6 + Math.sin(t * 0.7) * 0.8, 7.2 + Math.sin(t * 1.1) * 0.4, -3.8];
  const kP: V3 = [-1.4, 0, 0.4], eat = (k: number) => 0.5 + 0.5 * Math.sin(t * 3 + k), push = seg(t, 100.1, 100.4);
  const chat = Math.floor(t * 1.2) % 2;
  const fam = [{ p: [6.6, 0.2, -0.6] as V3, l: budi, h: ADULT }, { p: [8.0, 0.2, -1.0] as V3, l: sari, h: ADULT }, { p: [9.2, 0.2, -0.5] as V3, l: dimas, h: KID }];
  return (<>
    <Cam t={t} keys={K13} />
    <Lights warm="#ffb070" />
    <Sky p={[0, 14, -36]} s={[120, 46]} top="#ff6a7a" bottom="#ffd08a" />
    <Ball p={[-8, 3.4, -34]} r={3} color="#fff0a0" ink={0} /><Glow p={[-8, 3.4, -32]} r={10} color="rgba(255,200,120,1)" o={0.8} />
    <Surface p={[0, 0, -2]} s={[40, 26]} rot={[-Math.PI / 2, 0, 0]} kind="carpet" a="#d8a060" b="#d09858" unit={2.4} />
    {[-9, -2.4, 4.4].map((x, i) => <House key={x} p={[x, 0, -7]} w={6} d={4} wall={["#f2b06a", "#f2d49a", "#e89a8a"][i]} roof={["#c0443a", "#2f6bff", "#2f9e6a"][i]} />)}
    {/* jump rope */}
    {[[-6.8, kidA], [-3.0, kidB]].map(([x, l], i) => <Person key={i} p={[x as number, 0, -0.4]} h={KID} look={l as any} f={f + i * 11} pose={{ mood: "laugh", armR: i === 0 ? [0.2 + Math.cos(ra) * 0.04, 0.4 + Math.sin(ra) * 0.05] : undefined, armRK: 1, armL: i === 1 ? [-0.2 - Math.cos(ra) * 0.04, 0.4 + Math.sin(ra) * 0.05] : undefined, armLK: 1 }} />)}
    <group position={[-4.9, 1.0, -0.3]} rotation={[ra, 0, 0]}>{Array.from({ length: 12 }, (_, i) => { const u = (i + 0.5) / 12, x = lerp(-1.4, 1.4, u), y = Math.sin(u * Math.PI) * 0.95; return <Cyl key={i} p={[x, y, 0]} rt={0.03} h={0.3} color="#ff3b6b" line={1} rot={[0, 0, Math.PI / 2 - Math.cos(u * Math.PI) * 0.9]} />; })}</group>
    <Person p={[-4.9, hop.y, -0.3]} sy={0} h={KID} look={kidC} f={f} pose={{ mood: "laugh", squash: hop.sq, air: hop.air ? 1 : 0, arms: "up", armK: 0.4 }} />
    {void ropeK}
    {/* kite */}
    <Cable a={[kP[0] + 0.5, 1.1, kP[2]]} b={kite} sag={0.6} color="#f2f2f2" n={8} />
    <CanvasPlane p={kite} rot={[0, 0, Math.sin(t * 1.3) * 0.2]} s={[1.4, 1.6]} px={[140, 160]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "#ffd23a"; c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(W / 2, 6); c.lineTo(W - 8, H * 0.42); c.lineTo(W / 2, H - 6); c.lineTo(8, H * 0.42); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#e5233a"; c.beginPath(); c.moveTo(W / 2, 6); c.lineTo(W - 8, H * 0.42); c.lineTo(W / 2, H * 0.42); c.closePath(); c.fill(); c.stroke(); }} />
    <Person p={kP} h={KID} look={{ ...extra[3], body: "#ff8a1c" }} f={f} pose={{ mood: "grin", armR: [0.18, 0.62], armRK: 1, lookX: -0.4 }} />
    {/* neighbours chatting over the fence */}
    <Fence p={[0.6, 0, -0.9]} n={6} gap={0.6} />
    <Person p={[1.0, 0, -0.2]} h={ADULT} look={buTin} f={f} pose={{ mood: chat ? "laugh" : "smile", arms: chat ? "shrug" : "down", armK: 0.7, lookX: 1 }} />
    <Person p={[3.2, 0, -1.4]} h={ADULT} look={extra[1]} f={f + 5} pose={{ mood: chat ? "smile" : "laugh", armR: chat ? undefined : [0.24, 0.62], armRK: 0.8, lookX: -1 }} />
    {/* family meal on the porch */}
    <Box p={[8, 0.1, -0.6]} s={[5.2, 0.2, 3.2]} color="#a0703a" />
    <Mat p={[8, 0.2, -0.4]} s={[4.4, 2.4]} />
    <Bowl p={[7.4, 0.22, 0.2]} food="#fff6e0" s={1.1} /><Bowl p={[8.4, 0.22, 0.3]} food="#ff9a3a" /><Bowl p={[7.9, 0.22, -0.2]} food="#3fae5a" s={0.9} />
    {fam.map((m, i) => <React.Fragment key={i}><Person p={m.p} sy={0.2} h={m.h} look={m.l} f={f + i * 4} pose={{ mood: eat(i) > 0.8 ? "laugh" : "smile", sit: 1, armR: [0.05, lerp(0.42, 0.78, eat(i) > 0.6 ? (eat(i) - 0.6) / 0.4 : 0)], armRK: 1, armL: i === 0 && push > 0 ? [-0.3, 0.2] : undefined, armLK: push * (1 - seg(t, 100.5, 100.8)), lookX: i === 0 ? 0.5 : -0.5 }} /></React.Fragment>)}
    {/* phones parked in a basket */}
    <group position={[lerp(9.6, 10.1, push), 0.2, 0.7]}><Cyl p={[0, 0.25, 0]} rt={0.5} rb={0.4} h={0.5} color="#c9a46a" />{[-0.18, 0, 0.18].map((x, i) => <Phone key={x} p={[x, 0.55, 0.05 * i]} rot={[-0.3, 0, x]} s={0.7} />)}</group>
    <TearCal p={[5.6, 2.6, -1.9]} day={25} s={0.7} /><Box p={[5.6, 1.5, -2.0]} s={[0.25, 3.0, 0.25]} color="#6b3f1f" line={3} />
    <Tree p={[-11, 0, -3]} s={1.3} /><Palm p={[12, 0, -5]} s={1.2} /><Plant p={[4.4, 0, 1.4]} s={1.0} /><Bench p={[-8.6, 0, 1.8]} rotY={0.6} />
    <Dust t={t} area={[10, 5, 4]} color="rgba(255,230,180,.9)" />
  </>);
};

/* =================== S14 101.08 – 106.15  hari ketiga puluh: lampu menyala! =================== */
const K14: Key[] = [
  { t: 100.88, pos: [0, 2.6, 8.6], look: [0, 1.6, 0], fov: 54 },
  { t: 102.3, pos: [-2.2, 3.4, 4.4], look: [-3.0, 3.6, -3.4], fov: 50 },
  { t: 103.7, pos: [-0.6, 2.4, 6.4], look: [-0.9, 1.6, 0], fov: 50 },
  { t: 105.3, pos: [0, 2.6, 8.2], look: [0, 2.5, -0.6], fov: 56 },
  { t: 106.4, pos: [0, 2.8, 9.2], look: [0, 2.4, -0.6], fov: 58 },
];
const ON = 105.69;
const bulbOn = (t: number) => t >= ON ? 1 : (t > 105.05 && t < 105.12) || (t > 105.3 && t < 105.36) ? 0.6 : 0;
export const S14 = ({ t, f }: Ctx) => {
  const on = t >= ON ? seg(t, ON, ON + 0.08) : 0, stand = seg(t, ON + 0.15, ON + 0.4), hop = hopCycle(t, ON + 0.4, 106.4, 0.45, 0.4);
  const wall = mixC("#262650", "#ffe0a0", on), wall2 = mixC("#22224a", "#f6d490", on), floorA = mixC("#3a2a3a", "#d89a5a", on);
  const fam = [{ p: [-1.5, 0, 0.1] as V3, l: budi, h: ADULT }, { p: [1.5, 0, -0.1] as V3, l: sari, h: ADULT }, { p: [0.1, 0, -1.0] as V3, l: dimas, h: KID }];
  return (<>
    <Cam t={t} keys={K14} fovKick={[ON]} />
    <Lights warm={on ? "#fff2d0" : "#9a9aff"} />
    <Surface p={[0, 0, 0]} s={[16, 12]} rot={[-Math.PI / 2, 0, 0]} kind="plank" a={floorA} b={mixC("#34243a", "#cc8e50", on)} unit={2} />
    <WallDoor z={-3.5} W={16} kind="brick" a={wall} b={wall2} base="#3a2a1a" />
    <SideWall x={-7} kind="plain" a={mixC("#202048", "#f6d490", on)} b="#000" />
    <TearCal p={[-3.0, 3.8, -3.42]} day={29} next={30} k={seg(t, 101.96, 102.6, Easing.in(Easing.quad))} s={1.0} />
    <Bulb p={[0, 4.9, -0.6]} cord={3} on={bulbOn(t)} />
    {on > 0 ? <Shaft p={[0, 2.4, -0.6]} s={[5, 5]} color="255,240,170" o={0.2 * on} /> : null}
    <Mat p={[0, 0, -0.3]} s={[5.4, 3.2]} a={mixC("#6a5a3a", "#e8c070", on)} />
    <Candle p={[0.1, 0, 0.4]} t={t} s={1.1} lit={1 - on} />
    {fam.map((m, i) => { const sit = 1 - stand; return <Person key={i} p={[m.p[0], t > ON + 0.4 ? hop.y : 0, m.p[2]]} sy={0} h={m.h} look={m.l} f={f + i * 6} pose={{ mood: t < ON ? (t > 105.0 ? "worry" : "deadpan") : t < ON + 0.4 ? "shock" : "laugh", sit, hunch: t < ON ? 0.8 : 0, nerv: t > 105.0 && t < ON ? 0.3 : 0,
      arms: t > ON + 0.3 ? "up" : "down", armK: seg(t, ON + 0.3, ON + 0.5), squash: t > ON + 0.4 ? hop.sq : t > ON + 0.15 && t < ON + 0.3 ? -0.12 : 0, air: hop.air ? 1 : 0, lookX: t < ON && t > 105.0 ? 0 : i === 0 ? 0.6 : -0.6 }} />; })}
    {on < 0.5 ? <Glow p={[0.1, 1.2, 0.8]} r={4.2} color="rgba(255,170,80,1)" o={0.35} /> : null}
    <Sofa p={[4.6, 0, -2.4]} color={mixC("#2a2a5a", "#2f8cff", on)} w={3.4} /><Shelf p={[-5.4, 0, -3.1]} w={2.0} rows={4} seed={4} /><Plant p={[6.2, 0, 0.8]} s={1.1} />
    <Frame p={[2.6, 4.6, -3.45]} s={[1.4, 1.0]} art={0} /><Clock p={[0.6, 6.4, -3.45]} r={0.55} t={t} speed={3} />
    <Rug p={[4.6, 0, 0.2]} s={[3, 2]} a={mixC("#3a2a4a", "#e5483f", on)} b="#ffd23a" />
    <Dust t={t} area={[5, 5, 3]} color={on ? "rgba(255,240,200,.9)" : "rgba(160,160,255,.6)"} />
  </>);
};

/* =================== S15 106.15 – 112.58  semua bersorak: kipas, TV, cas HP =================== */
const K15: Key[] = [
  { t: 105.95, pos: [0, 3.4, 10.6], look: [0, 2.0, -0.5], fov: 58 },
  { t: 108.0, pos: [3.0, 3.2, 9.0], look: [3.0, 2.0, -1.0], fov: 54 },
  { t: 109.6, pos: [-1.4, 3.2, 8.2], look: [-3.0, 2.0, -2.2], fov: 54 },
  { t: 111.0, pos: [2.4, 3.0, 8.0], look: [4.4, 1.6, -2.0], fov: 54 },
  { t: 112.1, pos: [5.0, 2.6, 4.6], look: [6.0, 1.0, -3.0], fov: 50 },
  { t: 112.8, pos: [5.1, 2.6, 4.5], look: [6.0, 1.0, -3.0], fov: 49 },
];
export const S15 = ({ t, f }: Ctx) => {
  const hop = (k: number) => hopCycle(t, 106.3 + k * 0.07, 107.9, 0.46, 0.5);
  const F0 = 108.2, fd = Math.max(0, t - F0), spin = fd < 1 ? 14 * fd * fd / 2 : 7 + 14 * (fd - 1);
  const tvOn = t > 109.95, run = walkSeg(t, 110.85, 111.45, 0.0, 5.6), crouch = seg(t, 111.45, 111.65), plugged = t > 111.75;
  const bP: V3 = [t < 110.85 ? 0 : run.x, hop(0).y, t < 110.85 ? 0.6 : lerp(0.6, -2.5, seg(t, 110.85, 111.45))];
  const sP: V3 = [2.0, hop(1).y, -0.6], dP: V3 = [-2.5, hop(2).y, -0.3];
  const press = seg(t, 107.95, 108.15) * (1 - seg(t, 108.3, 108.5)), remote = seg(t, 109.5, 109.8);
  const charge = seg(t, 111.9, 112.6);
  return (<>
    <Cam t={t} keys={K15} />
    <Lights warm="#fff6d8" />
    <Floor kind="plank" a="#d89a5a" b="#cc8e50" unit={2} w={20} d={16} />
    <WallDoor z={-3.5} W={16} kind="brick" a="#ffe0a0" b="#f6d490" base="#8a5a32" />
    <SideWall x={-7} kind="plain" a="#f6d490" b="#000" /><SideWall x={7} kind="plain" a="#f0cc88" b="#000" />
    <Bulb p={[0, 4.9, -0.6]} cord={3} on={1} />
    <TVCabinet p={[-3.6, 0, -2.9]} w={3.2} />
    <TV p={[-3.6, 2.05, -2.95]} w={2.8} draw={tvOn ? (c, W, H) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#5ab0ff"); g.addColorStop(1, "#bfe9ff"); c.fillStyle = g; c.fillRect(0, 0, W, H); c.fillStyle = "#3fbf5a"; c.fillRect(0, H * 0.7, W, H * 0.3); c.fillStyle = "#ffd23a"; c.beginPath(); c.arc(W * 0.78, H * 0.25, 22, 0, 7); c.fill(); c.fillStyle = "#ff4fa0"; c.strokeStyle = INK; c.lineWidth = 5; const bx = W * 0.3 + Math.sin(t * 4) * 30; c.beginPath(); c.arc(bx, H * 0.56 - Math.abs(Math.sin(t * 6)) * 20, 24, 0, 7); c.fill(); c.stroke(); } : undefined} />
    {tvOn ? <Glow p={[-3.6, 2.1, -2.4]} r={2.8} color="rgba(120,200,255,1)" o={0.4} /> : null}
    <StandFan p={[3.4, 0, -1.6]} spin={spin} rotY={-0.4} />
    {fd > 0.4 ? Array.from({ length: 3 }, (_, i) => { const u = clamp((fd - 0.4 - i * 0.15) / 1.6); return u > 0 ? <Box key={i} p={[lerp(2.8, -1.5 - i, u), 0.95 + Math.sin(u * Math.PI) * (1.6 + i * 0.4), lerp(0.4, 2.0, u)]} s={[0.5, 0.02, 0.7]} rot={[u * 8 + i, u * 5, u * 3]} color="#ffffff" line={1} /> : null; }) : null}
    <Table p={[2.8, 0, 0.6]} w={1.4} d={1.0} h={0.85} />
    <Socket p={[6.2, 0.9, -3.45]} />
    {/* people */}
    <Person p={sP} sy={0} h={ADULT} look={sari} f={f} pose={{ mood: t < 108 ? "laugh" : "grin", squash: hop(1).sq, air: hop(1).air ? 1 : 0, arms: t < 107.9 ? "up" : "down", armK: 1, armR: press > 0 ? [0.3, 0.68] : undefined, armRK: press, lookX: t > 108 ? 1 : 0 }} />
    <Person p={dP} sy={0} h={KID} look={dimas} f={f} pose={{ mood: "laugh", squash: hop(2).sq, air: hop(2).air ? 1 : 0, arms: t < 107.9 ? "up" : "down", armK: 1, armR: t > 106.5 && t < 106.85 ? [0.2, 0.9] : remote > 0 ? [0.2, 0.55] : undefined, armRK: 1, lookX: t > 109 ? -1 : 0 }} />
    {t > 106.5 && t < 106.85 ? <FaceGroup p={dP}><Cyl p={hand(KID, [0.2, 0.9])} rt={0.06} rb={0.14} h={0.35} color="#ffd23a" line={2} rot={[0, 0, -0.4]} /></FaceGroup> : null}
    {remote > 0 ? <FaceGroup p={dP}><Box p={hand(KID, [0.2, 0.55], 0, false, 0.1)} s={[0.12, 0.35, 0.08]} rot={[0, 0, -0.6]} color="#2b3350" line={2} /></FaceGroup> : null}
    <Confetti p={[dP[0] + 0.5, KID + 0.4, dP[2]]} dt={t - 106.7} n={40} spread={4} />
    <Person p={bP} sy={0} h={ADULT} look={budi} f={f} pose={{ mood: t < 110.8 ? "laugh" : t < 111.8 ? "shock" : "grin", squash: hop(0).sq - 0.06 * crouch, air: hop(0).air ? 1 : 0, arms: t < 107.9 ? "up" : "down", armK: 1, walk: run.moving ? run.phase : undefined, speed: run.moving ? 1 : 0, hunch: crouch, tilt: run.moving ? 0.12 : 0,
      armR: t > 110.6 ? [lerp(0.2, 0.3, crouch), lerp(0.5, 0.25, crouch)] : undefined, armRK: 1, sweat: run.moving ? 0.7 : 0 }} />
    {t > 110.6 && !plugged ? <FaceGroup p={bP}><Phone p={hand(ADULT, [lerp(0.2, 0.3, crouch), lerp(0.5, 0.25, crouch)], -0.06 * crouch, false, 0.14)} s={0.8} /></FaceGroup> : null}
    {plugged ? <><Phone p={[6.2, 0.32, -3.2]} rot={[-1.2, 0, 0]} s={0.85} draw={(c, W, H) => { c.fillStyle = "#14204a"; c.fillRect(0, 0, W, H); c.strokeStyle = "#fff"; c.lineWidth = 5; c.strokeRect(25, 60, 60, 100); c.fillStyle = "#2fd46a"; const lv = 0.05 + 0.4 * charge; c.fillRect(29, 156 - 92 * lv, 52, 92 * lv); c.fillStyle = "#ffd23a"; c.font = "900 40px Inter"; c.textAlign = "center"; c.fillText("⚡", W / 2, 130); }} /><Cable a={[6.2, 0.85, -3.4]} b={[6.2, 0.25, -3.0]} sag={0.05} n={3} /></> : null}
    {/* dressing */}
    <Sofa p={[0.4, 0, -2.6]} color="#2f8cff" w={3.6} /><Shelf p={[-6.0, 0, -3.1]} w={1.6} rows={4} seed={8} /><Plant p={[-6.2, 0, 1.0]} s={1.1} />
    <Frame p={[0.4, 4.8, -3.45]} s={[1.6, 1.1]} art={2} /><Clock p={[2.8, 5.4, -3.45]} r={0.5} t={t} /><TearCal p={[-1.6, 4.6, -3.42]} day={30} s={0.8} />
    <Rug p={[0, 0, 0.4]} s={[7, 3.4]} a="#e5483f" b="#ffd23a" />
    {Array.from({ length: 6 }, (_, i) => <Glow key={i} p={[-5 + i * 2, 6.5, -3.2]} r={0.7} color={["rgba(255,80,160,1)", "rgba(255,220,80,1)", "rgba(80,200,255,1)"][i % 3]} o={0.5} />)}
    <Cable a={[-6.8, 6.6, -3.3]} b={[6.8, 6.6, -3.3]} sag={0.6} color="#2b3350" n={10} />
    <Dust t={t} area={[6, 5, 3]} color="rgba(255,250,220,.9)" />
  </>);
};

/* =================== S16 112.58 – 117.12  kebahagiaan tidak lama... token listrik sudah habis! =================== */
const K16: Key[] = [
  { t: 112.38, pos: [3.4, 2.8, 7.6], look: [1.6, 2.7, -2.0], fov: 56 },
  { t: 114.7, pos: [2.2, 3.1, 5.0], look: [0.8, 3.3, -3.4], fov: 46 },
  { t: 115.6, pos: [2.6, 3.0, 4.6], look: [1.2, 3.0, -3.0], fov: 48 },
  { t: 116.15, pos: [0.4, 3.6, 1.2], look: [0.8, 3.6, -3.4], fov: 40 },
  { t: 116.85, pos: [2.6, 3.2, 6.0], look: [1.6, 2.4, -2.6], fov: 56 },
  { t: 117.4, pos: [2.7, 3.2, 6.2], look: [1.6, 2.4, -2.6], fov: 56 },
];
export const OFF16 = 116.76;
export const S16 = ({ t, f }: Ctx) => {
  const kwh = Math.max(0, 1.2 * (1 - (t - 112.6) / 3.3)), warn = kwh < 0.6 ? t * 2.5 : 0, off = t >= OFF16;
  const dance = hopCycle(t, 112.6, 115.1, 0.5, 0.2), w = walkSeg(t, 115.3, 115.95, 3.6, 2.7);
  const x = t < 115.3 ? 3.6 : w.x, jb = jumpBack(t, OFF16 + 0.05, 0.9, 0.55), P: V3 = [x + jb.d * 0.9, t < 115.1 ? dance.y : jb.y, -1.2 + jb.d * 0.6];
  const d = off ? 1 : 0, wall = mixC("#9fd8ff", "#141a36", d), wall2 = mixC("#94cff6", "#121730", d);
  return (<>
    <Cam t={t} keys={K16} fovKick={[116.08]} impacts={[]} />
    <Lights warm={off ? "#6a6aff" : "#fff6d8"} />
    <Floor kind="tile" a={mixC("#f2f2f2", "#1a1a30", d)} b={mixC("#d8dde8", "#16162a", d)} unit={1.4} w={20} d={16} />
    <WallDoor z={-3.5} W={14} kind="plain" a={wall} b={wall2} door={{ x: -4.2, w: 2.4, h: 4.4 }} base="#3a4a6a" />
    <Box p={[-4.2, 2.2, -4.1]} s={[2.4, 4.4, 0.1]} color={mixC("#ffe0a0", "#1a1a2a", d)} />
    {/* through the doorway: the family still dancing */}
    {[[-4.6, sari, ADULT], [-3.6, dimas, KID]].map(([xx, l, h], i) => { const hp = hopCycle(t, 112.6, 117.5, 0.5, 0.25); return <Person key={i} p={[xx as number, off ? 0 : hp.y, -4.6]} sy={0} h={h as number} look={l as any} f={f + i * 9} pose={{ mood: off ? "shock" : "laugh", arms: off ? "head" : "up", armK: 1, squash: off ? 0 : hp.sq, air: !off && hp.air ? 1 : 0 }} />; })}
    <TokenMeter p={[0.8, 3.6, -3.3]} kwh={kwh} warn={warn} s={1.1} />
    <Cable a={[0.8, 2.6, -3.42]} b={[0.8, 0.2, -3.42]} sag={0.02} n={2} />
    <Bulb p={[1.6, 5.4, -1.2]} cord={2} on={off ? 0 : 1} />
    {!off ? <Shaft p={[1.6, 2.8, -1.2]} s={[4, 5]} color="255,240,170" o={0.16} /> : null}
    <Frame p={[4.2, 4.2, -3.45]} s={[1.4, 1.0]} art={1} /><Clock p={[-1.6, 5.6, -3.45]} r={0.5} t={t} /><Plant p={[5.6, 0, -2.6]} s={1.2} />
    <Cabinet p={[3.4, 0, -3.0]} w={1.6} h={1.4} color={mixC("#2fb59a", "#1a2a3a", d)} /><Rug p={[1.2, 0, 0]} s={[4, 2.2]} a={mixC("#2f6bff", "#1a1a3a", d)} b="#ffd23a" />
    <Box p={[-1.8, 0.3, -3.0]} s={[1.6, 0.6, 0.8]} color={mixC("#c98a4a", "#2a2030", d)} />{[0, 1].map((i) => <Box key={i} p={[-2.2 + i * 0.8, 0.75, -2.9]} s={[0.5, 0.3, 0.7]} color={i ? "#e5233a" : "#2b3350"} line={2} />)}
    <Person p={P} sy={0} h={ADULT} look={budi} f={f} pose={{ mood: t < 115.2 ? "laugh" : t < 116.0 ? "smile" : t < OFF16 ? "worry" : "shock", nerv: t > 116.0 ? 0.6 : 0, sweat: t > 116.0 ? 1 : 0, squash: t < 115.1 ? dance.sq : jb.sq, air: (t < 115.1 && dance.air) || jb.air ? 1 : 0,
      arms: t < 115.1 ? "up" : t > OFF16 + 0.2 ? "head" : "down", armK: t < 115.1 ? 0.7 : 1, walk: w.moving ? w.phase : undefined, speed: w.speed, flip: t > 115.3, lookX: t > 115.2 ? -1 : 0 }} />
    {off ? <Candle p={[-1.8, 0.6, -2.95]} t={t} lit={0} /> : null}
  </>);
};

/* =================== S17 117.12 – 120.33  perjuangan sesungguhnya baru saja dimulai =================== */
const K17: Key[] = [
  { t: 116.92, pos: [2.2, 2.4, 2.3], look: [1.3, 1.8, -2.6], fov: 62 },
  { t: 118.6, pos: [1.9, 2.4, 2.2], look: [1.3, 1.8, -2.6], fov: 60 },
  { t: 119.5, pos: [1.4, 2.7, 6.2], look: [1.3, 2.6, -2.0], fov: 52 },
  { t: 120.5, pos: [1.0, 4.6, 16.0], look: [0.8, 3.0, -1.0], fov: 54 },
];
export const S17 = ({ t, f }: Ctx) => {
  const strike = seg(t, 117.3, 117.45), lit = seg(t, 117.55, 117.8), resolve = seg(t, 118.0, 118.3, Easing.out(Easing.back(2)));
  const P: V3 = [1.3, 0, -2.3], cT: [number, number] = [0.2, lerp(0.45, 0.58, lit)];
  return (<>
    <Cam t={t} keys={K17} />
    <Lights warm="#7a7aff" />
    {/* inside: dark hallway */}
    <Floor kind="tile" a="#1a1a30" b="#16162a" unit={1.4} w={10} d={8} />
    <WallDoor z={-3.5} W={10} kind="plain" a="#141a36" b="#141a36" base="#0a0e20" />
    <TokenMeter p={[0.0, 3.6, -3.3]} kwh={0} warn={t * 2.5} s={1.1} />
    <TearCal p={[-2.4, 3.6, -3.42]} day={1} s={0.8} label="HARI" />
    <Person p={P} h={ADULT} look={budi} f={f} pose={{ mood: t < 118.0 ? "worry" : "angry", nerv: t < 117.6 ? 0.3 : 0, sweat: t < 118 ? 0.5 : 0, armR: cT, armRK: 1, armL: t < 117.6 ? [0.12, 0.5 + strike * 0.04] : [-0.22, lerp(0.5, 0.82, resolve)], armLK: 1, squash: resolve > 0 && t < 118.4 ? 0.04 : 0 }} />
    <FaceGroup p={P}><Candle p={hand(ADULT, cT, 0, false, 0.14)} t={t} s={0.9} lit={lit} />{t > 117.3 && t < 117.75 ? <Glow p={hand(ADULT, [0.14, 0.52], 0, false, 0.2)} r={0.8} color="rgba(255,220,120,1)" o={1 - seg(t, 117.4, 117.75)} /> : null}</FaceGroup>
    <Glow p={[P[0] + 0.6, 2.0, P[2] + 0.6]} r={3.6} color="rgba(255,170,80,1)" o={0.45 * lit} />
    {/* front wall with the window we pull back through */}
    <WallHole z={2.5} x0={-5} x1={5} H={5.2} hole={{ x: 1.3, y: 1.5, w: 2.4, h: 2.4 }} kind="brick" a="#c8a070" b="#bc9466" />
    <Box p={[0, 5.4, 0]} s={[11, 0.4, 6.6]} color="#5a2a2a" /><Box p={[0, 6.2, -0.3]} s={[9, 1.4, 5.4]} rot={[0, 0, 0]} color="#7a2a2a" />
    <Box p={[-5, 2.6, -0.5]} s={[0.2, 5.2, 6]} color="#a88060" /><Box p={[5, 2.6, -0.5]} s={[0.2, 5.2, 6]} color="#a88060" />
    {/* outside, all dark */}
    <Sky p={[0, 16, -40]} s={[120, 50]} top="#03041a" bottom="#1a1a44" stars={1} t={t} />
    <Moon p={[-10, 14, -36]} r={2.2} />
    <Surface p={[0, -0.01, 8]} s={[40, 30]} rot={[-Math.PI / 2, 0, 0]} kind="carpet" a="#142030" b="#121c2a" unit={2.4} />
    <House p={[-9.5, 0, 0]} w={6} d={5} wall="#2a2a4a" roof="#3a2a3a" /><House p={[9.5, 0, 0]} w={6} d={5} wall="#2c2a4c" roof="#3a2a3a" />
    <StreetLamp p={[5.6, 0, 5.2]} on={0} flip /><Tree p={[-5.6, 0, 6]} s={1.1} leaf="#1a3a2a" /><Fence p={[-4.6, 0, 6.6]} n={6} gap={0.6} color="#3a3a5a" /><Fence p={[3.0, 0, 6.6]} n={6} gap={0.6} color="#3a3a5a" />
    {lit > 0 ? <Glow p={[1.3, 2.7, 2.8]} r={2.0} color="rgba(255,170,80,1)" o={0.5 * lit} /> : null}
    <Cat p={[3.8, 0.4, 5.6]} s={0.9} t={t} />
  </>);
};
void [Ball, Surface, Shaft, Plant, Shelf, Frame, Chair, Rug, Clock, Table, Socket, mas, pakRT, buTin, Sofa, Cyl, Box, Rug];
