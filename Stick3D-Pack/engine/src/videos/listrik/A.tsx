// Listrik 30 Hari — scenes 1-8 (0 – 65.15 s)
import React from "react";
import { Easing } from "remotion";
import { Box, Cyl, Ball, CanvasPlane, Surface, INK } from "../../style/toon";
import { Person, Lights, Clock, V3 } from "../../style/kit";
import { Floor, WallDoor, SideWall, Glow, Shaft, Plant, Shelf, Frame, WindowCity, Chair, Cabinet, Rug, Dust } from "../../style/props";
import { Cam, Key, camAt, FaceGroup, hand, Building, Mug, Bin } from "../../style/extra";
import { mixC, FlatPuppet, Sky, Moon, Sofa, Bed, Table, StandFan, ACUnit, TV, TVCabinet, Router, Bulb, Candle, Phone, Socket, Plug, Cable, Tree, Palm, Fence, House, Well, Bucket, Basin, FireStove, Steam, Clothesline, Broom, Leaves, Bowl, Banner, Flag, Gecko, Cat, Bolt, OvenFront, TearCal } from "../../style/home";
import { Ctx, budi, sari, dimas, pakRT, buTin, mas, extra, ADULT, KID, toWorld, jumpBack, walkSeg, seg, lerp, clamp, WALK } from "./common";

// wall (facing +z) with a rectangular hole (window/door) built from 4 textured pieces
export const WallHole: React.FC<{ z: number; x0: number; x1: number; H?: number; hole: { x: number; y: number; w: number; h: number }; kind: "brick" | "wood" | "plain"; a: string; b: string; unit?: number }> = ({ z, x0, x1, H = 9, hole, kind, a, b, unit = 1.6 }) => {
  const l = hole.x - hole.w / 2, r = hole.x + hole.w / 2, bt = hole.y, tp = hole.y + hole.h;
  const pcs: [number, number, number, number][] = [[x0, l, 0, H], [r, x1, 0, H], [l, r, 0, bt], [l, r, tp, H]];
  return <>{pcs.map(([a0, a1, b0, b1], i) => a1 - a0 > 0.01 && b1 - b0 > 0.01 ? <Surface key={i} p={[(a0 + a1) / 2, (b0 + b1) / 2, z]} s={[a1 - a0, b1 - b0]} kind={kind} a={a} b={b} unit={unit} /> : null)}
    <Box p={[hole.x, bt - 0.08, z + 0.1]} s={[hole.w + 0.3, 0.16, 0.3]} color="#f2efe6" line={3} /><Box p={[hole.x, tp + 0.08, z + 0.05]} s={[hole.w + 0.3, 0.16, 0.2]} color="#f2efe6" line={3} />
    <Box p={[l - 0.08, (bt + tp) / 2, z + 0.05]} s={[0.16, hole.h, 0.2]} color="#f2efe6" line={3} /><Box p={[r + 0.08, (bt + tp) / 2, z + 0.05]} s={[0.16, hole.h, 0.2]} color="#f2efe6" line={3} /></>;
};

/* =================== S1 0 – 7.40  "Bayangkan ... listrik di seluruh kota tiba-tiba mati ... 30 hari penuh!" =================== */
const OFF1 = 3.05; // blackout wave reaches the far city
const city = Array.from({ length: 26 }, (_, i) => { const row = i % 3, col = Math.floor(i / 3); const z = -13 - row * 11 - ((i * 7) % 5); const x = -26 + col * 6.4 + (row % 2) * 2.6; return { x, z, w: 4.4 + ((i * 3) % 3), h: 8 + ((i * 13) % 16) + row * 4, col: ["#3a2f6a", "#4a3a7a", "#2e2a5a", "#56407e"][i % 4], seed: i + 3 }; });
const K1: Key[] = [
  { t: 0, pos: [3.0, 3.0, 7.4], look: [1.5, 2.6, 0.2], fov: 46 },
  { t: 2.2, pos: [3.8, 3.6, 8.6], look: [0.4, 3.6, -12], fov: 58 },
  { t: 3.4, pos: [3.9, 3.5, 9.0], look: [0.2, 3.3, -12], fov: 60 },
  { t: 5.2, pos: [1.6, 3.2, 8.4], look: [-1.6, 2.7, -2], fov: 56 },
  { t: 6.3, pos: [-2.2, 3.0, 7.8], look: [-3.8, 2.6, -0.2], fov: 52 },
  { t: 7.6, pos: [-2.6, 2.9, 7.0], look: [-3.9, 2.6, -0.2], fov: 50 },
];
export const S1 = ({ t, f }: Ctx) => {
  const jb = jumpBack(t, 3.2, 0.7, 0.55), w = walkSeg(t, 5.3, 6.35, 2.1, -2.9);
  const x = t < 5.3 ? 1.6 + jb.d * 0.7 : w.x, z = t < 5.3 ? 0.6 + jb.d * 0.7 : lerp(1.1, 0.9, seg(t, 5.3, 6.35));
  const P: V3 = [x, jb.y, z], off = (zz: number) => OFF1 + (-zz - 13) / -40 * 0.3 + 0.3; // far first, near last
  const myOff = 3.17, dk = seg(t, 3.05, 3.5);
  const day = t < 6.02 ? 1 : Math.min(30, 1 + Math.floor((t - 6.02) / 0.026)), tear = t > 6.02 && day < 30 ? ((t - 6.02) / 0.026) % 1 : 0;
  const phoneT: [number, number] = [0.2, 0.5];
  return (<>
    <Cam t={t} keys={K1} />
    <Lights warm="#ffc8a0" />
    <Sky p={[0, 26, -85]} s={[220, 80]} top={mixC("#3a2a8a", "#0c0a2e", dk)} bottom={mixC("#ff8a5a", "#4a2a6a", dk)} stars={seg(t, 3.4, 5.5)} t={t} />
    <Moon p={[22, 24, -80]} r={3} o={0.4 + 0.6 * dk} />
    {city.map((b, i) => <Building key={i} p={[b.x, -6, b.z]} s={[b.w, b.h + 6, 4.4]} color={mixC(b.col, "#1a1636", dk)} face="+z" seed={b.seed} lit={t < off(b.z) ? 0.6 : 0.02} trim="#1a1236" />)}
    {city.map((b, i) => t < off(b.z) ? <Glow key={"g" + i} p={[b.x, b.h * 0.5 - 4, b.z + 3]} r={b.w * 0.9} color="rgba(255,200,110,1)" o={0.22} /> : null)}
    {/* rooftop */}
    <Surface p={[0, 0, 0]} s={[18, 12]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={mixC("#d9875a", "#7a4a4a", dk)} b={mixC("#cc7a50", "#704444", dk)} unit={1.4} />
    <Box p={[0, 0.55, -4.2]} s={[18, 1.1, 0.4]} color={mixC("#e8a070", "#6a4a5a", dk)} /><Box p={[-9, 0.55, 0]} s={[0.4, 1.1, 8.8]} color={mixC("#e8a070", "#6a4a5a", dk)} /><Box p={[9, 0.55, 0]} s={[0.4, 1.1, 8.8]} color={mixC("#e8a070", "#6a4a5a", dk)} />
    {/* festoon lights along the parapet (they die with the city) */}
    <Cable a={[-8.8, 2.6, -4.1]} b={[8.8, 2.6, -4.1]} sag={0.7} n={10} />
    {Array.from({ length: 11 }, (_, i) => { const u = (i + 0.5) / 11, xx = lerp(-8.8, 8.8, u), yy = 2.6 - Math.sin(u * Math.PI) * 0.7 - 0.15, on = t < myOff ? 1 : 0; return <React.Fragment key={i}><Ball p={[xx, yy, -4.1]} r={0.13} color={on ? ["#ffe07a", "#ff8ab0", "#8affd8"][i % 3] : "#5a5a6a"} ink={0.02} />{on ? <Glow p={[xx, yy, -3.9]} r={0.7} color="rgba(255,220,140,1)" o={0.6} /> : null}</React.Fragment>; })}
    {[-8.8, 8.8].map((xx) => <Cyl key={xx} p={[xx, 1.6, -4.1]} rt={0.05} h={2.2} color="#2b3350" line={2} />)}
    {/* stairwell hut with the calendar */}
    <Box p={[-5.2, 1.9, -1.4]} s={[3.2, 3.8, 3.0]} color={mixC("#f2c08a", "#7a6070", dk)} /><Box p={[-5.2, 3.9, -1.4]} s={[3.6, 0.2, 3.4]} color="#8a3a3a" />
    <Box p={[-3.58, 1.5, -1.6]} s={[0.06, 3.0, 1.4]} color="#6b3f1f" line={3} />
    <TearCal p={[-5.2, 2.55, 0.13]} day={day} next={day + 1} k={tear} s={1.25} />
    {t > 6.8 ? <Glow p={[-5.2, 2.5, 0.4]} r={1.6} color="rgba(255,80,60,1)" o={0.35 * seg(t, 6.8, 7.0)} /> : null}
    {/* rooftop dressing */}
    <group position={[5.4, 0, -2.6]}>{[-0.8, 0.8].map((dx) => [-0.6, 0.6].map((dz) => <Box key={dx + "," + dz} p={[dx, 1.0, dz]} s={[0.14, 2.0, 0.14]} color="#2b3350" line={2} />))}<Cyl p={[0, 2.9, 0]} rt={1.2} h={1.8} color="#2f6bff" /><Cyl p={[0, 3.85, 0]} rt={1.25} h={0.12} color="#1d3fa0" line={2} /></group>
    <Clothesline p={[1.4, 0, -3.0]} w={4.2} t={t} />
    <Plant p={[-7.6, 0, -3.2]} s={1.1} /><Plant p={[7.8, 0, 1.6]} s={1.0} pot="#2f9e6a" /><Plant p={[-2.6, 0, -3.3]} s={0.8} pot="#e5483f" />
    <Chair p={[3.6, 0, 1.6]} rotY={-0.6} color="#2fd46a" /><Chair p={[5.4, 0, 0.8]} rotY={-1.0} color="#ff4fa0" />
    <Table p={[4.5, 0, 0.0]} w={1.4} d={1.0} h={0.9} top="#ffffff" leg="#c8d2e8" /><Mug p={[4.3, 1.15, 0.0]} s={1.1} />
    <Box p={[7.4, 0.6, -3.0]} s={[1.8, 1.2, 0.9]} color="#d8dde8" /><Cyl p={[7.4, 0.6, -2.5]} rt={0.42} h={0.08} color="#9aa0b8" rot={[Math.PI / 2, 0, 0]} />
    <group position={[-7.4, 0, 0.6]}><Cyl p={[0, 2.5, 0]} rt={0.05} h={5} color="#9aa0b8" line={2} />{[0, 1, 2].map((i) => <Box key={i} p={[0, 4.2 + i * 0.35, 0]} s={[1.6 - i * 0.4, 0.06, 0.06]} color="#9aa0b8" line={2} />)}</group>
    <group position={[-7.2, 0.2, -2.4]} rotation={[0.4, 0.6, 0]}><Cyl p={[0, 0.6, 0]} rt={0.7} rb={0.1} h={0.3} color="#e8eef8" /></group>
    {[0, 1, 2].map((i) => <Box key={i} p={[-1.2 + i * 0.75, 0.3, 3.3]} s={[0.7, 0.6, 0.7]} color={["#c0643a", "#8a5a32", "#c0643a"][i]} rot={[0, i * 0.3, 0]} />)}
    <Dust t={t} area={[6, 5, 4]} color="rgba(255,220,180,.8)" />
    {/* Budi */}
    <Person p={P} sy={0} h={ADULT} look={budi} f={f} pose={{ mood: t < 3.17 ? "smile" : t < 4.4 ? "shock" : t < 6.0 ? "worry" : "gulp", nerv: t < 3.17 ? 0 : t < 4.4 ? 0.75 : 0.4, sweat: t > 3.3 ? 1 : 0, squash: jb.sq, air: jb.air ? 1 : 0,
      walk: w.moving ? w.phase : undefined, speed: w.speed, flip: t > 5.3,
      armR: t < 3.25 ? phoneT : undefined, armRK: 1, arms: t > 3.5 && t < 5.2 ? "head" : "down", armK: seg(t, 3.5, 3.7) * (1 - seg(t, 5.0, 5.3)), lookX: t < 3.17 ? 0.2 : t < 5.3 ? -1 : -1, tilt: jb.air ? 0.08 : 0 }} />
    {t < 3.25 ? <FaceGroup p={P}><Phone p={hand(ADULT, phoneT, jb.sq, false, 0.12)} s={0.9} draw={(c, W, H) => { c.fillStyle = "#3f7bff"; c.fillRect(0, 0, W, H); c.fillStyle = "#fff"; c.fillRect(10, 20, W - 20, 30); c.fillRect(10, 60, W - 40, 20); }} /></FaceGroup> : null}
    {t >= 3.25 ? (() => { const camR = camAt(3.25, K1).pos; const r0 = toWorld([1.6 + jumpBack(3.25, 3.2, 0.7, 0.55).d * 0.7, jumpBack(3.25, 3.2, 0.7, 0.55).y, 0.6 + jumpBack(3.25, 3.2, 0.7, 0.55).d * 0.7], hand(ADULT, phoneT, 0, false, 0.12), camR); const dt = t - 3.25, g = 20, v = [0.6, 4.0, 0.9]; const tl = (v[1] + Math.sqrt(v[1] ** 2 + 2 * g * (r0[1] - 0.05))) / g, q = Math.min(dt, tl); return <Phone p={[r0[0] + v[0] * q, Math.max(0.05, r0[1] + v[1] * q - 0.5 * g * q * q), r0[2] + v[2] * q]} rot={dt < tl ? [dt * 10, dt * 4, 0] : [-Math.PI / 2, 0, 0.4]} s={0.9} />; })() : null}
  </>);
};

/* =================== S2 7.40 – 14.66  "Awalnya, semua orang masih santai ... rebahan sambil menunggu listrik kembali menyala." =================== */
const K2: Key[] = [
  { t: 7.2, pos: [4.2, 10.4, 10.0], look: [0.2, 0.8, -1.4], fov: 56 },
  { t: 10.2, pos: [2.4, 9.0, 8.4], look: [0.1, 0.9, -1.6], fov: 54 },
  { t: 12.4, pos: [-0.2, 5.6, 5.4], look: [-0.2, 1.2, -2.2], fov: 52 },
  { t: 13.6, pos: [-0.1, 4.0, 5.4], look: [0.2, 2.6, -1.6], fov: 54 },
  { t: 14.9, pos: [0.1, 3.4, 5.2], look: [0.3, 3.4, -1.2], fov: 56 },
];
export const S2 = ({ t, f }: Ctx) => {
  const fan = Math.sin(t * 9) * 0.06, shrug = seg(t, 10.3, 10.6) * (1 - seg(t, 11.2, 11.5)), yawn = t > 12.4 && t < 13.0;
  const car = Math.sin(t * 2.6) * 0.06, sariP: V3 = [2.5, 0, -1.4], kidP: V3 = [-1.9, 0, 0.9];
  return (<>
    <Cam t={t} keys={K2} />
    <Lights warm="#fff0c8" />
    <Floor kind="plank" a="#c98a4a" b="#bb7c40" unit={2.0} w={20} d={20} />
    <WallDoor z={-4} W={16} kind="wood" a="#f2d49a" b="#ead08e" base="#8a5a32" />
    <SideWall x={-6.5} kind="wood" a="#f0cc90" b="#e8c486" />
    <Box p={[-6.4, 3.5, -1.5]} s={[0.1, 2.4, 2.6]} color="#bfe9ff" line={4} /><Box p={[-6.35, 3.5, -1.5]} s={[0.1, 2.4, 0.08]} color={INK} line={1} />
    <Shaft p={[-4.2, 2.6, -1.2]} s={[3.2, 6.4]} rot={[0, 0.6, 0.55]} color="255,236,170" o={0.24} />
    <Rug p={[0, 0, -0.8]} s={[7, 4]} a="#e5483f" b="#ffd23a" />
    <Sofa p={[-0.2, 0, -2.6]} color="#2f8cff" w={4.6} />
    <FlatPuppet p={[-0.25, 1.38, -2.25]} h={ADULT * 0.95} rot={[-0.95, 0, Math.PI / 2]} look={budi} f={f} pose={{ mood: yawn ? "laugh" : t < 11.6 ? "smile" : "deadpan", arms: "head", armK: 1, walk: t * 2.2, speed: 0.12, lookX: t > 13.2 ? 1 : 0 }} />
    <Chair p={[sariP[0], 0, sariP[2] - 0.15]} rotY={-0.5} color="#ff4fa0" />
    <Person p={sariP} h={ADULT} look={sari} f={f} pose={{ mood: t > 10.3 && t < 11.6 ? "grin" : "smile", sit: 1, arms: shrug > 0 ? "shrug" : "down", armK: shrug, armR: shrug > 0.5 ? undefined : [0.16, 0.62 + fan], armRK: 1 - shrug, lookX: -0.6 }} />
    {shrug < 0.5 ? <FaceGroup p={sariP}><group position={hand(ADULT, [0.16, 0.62 + fan], 0, false, 0.1)} rotation={[0, 0, fan * 4]}><CanvasPlane p={[0, 0.25, 0]} s={[0.6, 0.5]} px={[120, 100]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "#ffd23a"; c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(W / 2, H); c.arc(W / 2, H, W * 0.46, Math.PI * 1.05, Math.PI * 1.95); c.closePath(); c.fill(); c.stroke(); for (let k = 1; k < 5; k++) { const a = Math.PI * (1.05 + k * 0.18); c.beginPath(); c.moveTo(W / 2, H); c.lineTo(W / 2 + Math.cos(a) * W * 0.46, H + Math.sin(a) * W * 0.46); c.stroke(); } }} /></group></FaceGroup> : null}
    <Person p={kidP} h={KID} look={dimas} f={f} pose={{ mood: "grin", sit: 1, armR: [0.26 + car, 0.12], armRK: 1, lookX: 1 }} />
    <FaceGroup p={kidP}><group position={[hand(KID, [0.26 + car, 0.12])[0] + 0.12, 0.12, 0.1]}><Box p={[0, 0.1, 0]} s={[0.5, 0.22, 0.3]} color="#e5233a" line={2} /><Ball p={[-0.16, 0, 0.12]} r={0.07} color={INK} ink={0} /><Ball p={[0.16, 0, 0.12]} r={0.07} color={INK} ink={0} /></group></FaceGroup>
    <Table p={[0.5, 0, 0.9]} w={1.8} d={1.0} h={0.6} top="#8a5a32" leg="#6b3f1f" /><Bowl p={[0.3, 0.67, 0.9]} food="#ffb84a" /><Mug p={[0.9, 0.86, 0.9]} s={1.2} color="#ffd23a" />
    <TVCabinet p={[4.4, 0, -3.3]} w={3.2} /><TV p={[4.4, 2.0, -3.4]} w={2.6} />
    <Shelf p={[-4.6, 0, -3.6]} w={2.4} rows={4} seed={5} /><Plant p={[2.2, 0, -3.4]} s={1.1} /><Plant p={[-5.8, 0, 2.2]} s={1.2} pot="#2f9e6a" />
    <Frame p={[-1.6, 5.0, -3.95]} s={[1.6, 1.2]} art={0} /><Frame p={[1.4, 5.2, -3.95]} s={[1.2, 1.6]} art={1} />
    <Clock p={[4.4, 5.4, -3.95]} r={0.55} t={t} speed={4} />
    <TearCal p={[-3.6, 4.6, -3.92]} day={1} s={0.9} />
    <StandFan p={[5.6, 0, -0.4]} rotY={-0.5} />
    <Cat p={[1.8, 0.45, 1.3]} s={1.0} t={t} sleep />
    <Bulb p={[0.5, 4.9, -0.9]} cord={3} on={0} />
    <Dust t={t} area={[5, 5, 3]} color="rgba(255,240,200,.9)" />
  </>);
};

/* =================== S3 14.66 – 24.50  hari kedua: kipas mati, AC pajangan, rumah = oven raksasa =================== */
const K3: Key[] = [
  { t: 14.46, pos: [0.0, 3.8, 11.0], look: [-0.5, 3.2, -1.5], fov: 56 },
  { t: 16.5, pos: [-0.6, 3.6, 9.2], look: [-0.8, 2.9, -1.0], fov: 52 },
  { t: 18.2, pos: [1.0, 3.4, 8.8], look: [0.7, 2.7, -1.0], fov: 52 },
  { t: 19.7, pos: [1.4, 4.2, 8.0], look: [1.4, 4.4, -2.5], fov: 52 },
  { t: 21.0, pos: [1.3, 4.8, 6.8], look: [1.5, 5.0, -3.0], fov: 50 },
  { t: 21.7, pos: [0.6, 4.2, 9.6], look: [0.4, 3.8, -2.0], fov: 56 },
  { t: 24.7, pos: [0.0, 6.2, 30.0], look: [0.0, 5.6, 0.0], fov: 50 },
];
export const S3 = ({ t, f }: Ctx) => {
  const heat = seg(t, 21.4, 23.7), w = walkSeg(t, 17.7, 18.4, -1.3, 0.55);
  const x = t < 17.7 ? -1.3 : w.x, P: V3 = [x, 0, 0.6];
  const press = seg(t, 18.4, 18.55) * (1 - seg(t, 18.9, 19.2)), jiggle = t > 18.55 ? 0.25 * Math.exp(-(t - 18.55) * 6) * Math.sin((t - 18.55) * 30) : 0;
  const fanHand = Math.sin(t * 11) * 0.04, melt = seg(t, 22.6, 24.0);
  const wall = mixC("#ffb070", "#ff6a3a", heat), wall2 = mixC("#ff9f5a", "#e8502a", heat);
  return (<>
    <Cam t={t} keys={K3} impacts={[]} />
    <Lights warm="#ffb080" />
    <Surface p={[0, 0, 0]} s={[11.6, 8]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a={mixC("#d9673a", "#c0442a", heat)} b={mixC("#c85a30", "#a83a22", heat)} unit={1.2} />
    <Surface p={[0, 0, 10]} s={[60, 12]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a="#3a3a46" b="#33333f" unit={2.4} />
    <WallDoor z={-4} W={11.6} kind="brick" a={wall} b={wall2} base="#7a2a1a" />
    <SideWall x={-5.8} kind="plain" a={mixC("#ffa060", "#ff5a2a", heat)} b="#000" /><SideWall x={5.8} kind="plain" a={mixC("#ffa060", "#ff5a2a", heat)} b="#000" />
    <Box p={[0, 7.75, 0]} s={[11.6, 0.3, 8]} color="#5a2a1a" />
    {/* oven heating elements on the ceiling (glow with the reveal) */}
    {[-3.6, 0, 3.6].map((xx) => <React.Fragment key={xx}><Box p={[xx, 7.45, 0]} s={[0.3, 0.2, 7]} color={mixC("#5a5a6a", "#ff5a1f", heat)} line={2} />{heat > 0 ? <Glow p={[xx, 7.2, 1]} r={3} color="rgba(255,90,30,1)" o={0.55 * heat} /> : null}</React.Fragment>)}
    <OvenFront p={[0, 0, 4.4]} w={11.6} h={7.6} heat={heat} temp={lerp(34, 250, heat)} />
    <TearCal p={[-0.8, 4.4, -3.92]} day={1} next={2} k={seg(t, 15.6, 16.3, Easing.in(Easing.quad))} s={0.9} />
    <Bed p={[-3.6, 0, -1.6]} sheet="#ff8fb0" />
    <ACUnit p={[1.6, 5.6, -3.7]} />
    <Plant p={[0.85, 6.03, -3.65]} s={0.4} pot="#2f6bff" /><Frame p={[2.4, 6.35, -3.62]} s={[0.7, 0.5]} art={2} />
    <Cat p={[1.75, 6.4, -3.4]} s={1.0} t={t} sleep />
    <CanvasPlane p={[1.6, 4.9, -3.42]} s={[1.3, 0.4]} px={[260, 80]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, 16); c.stroke(); c.fillStyle = "#fff6c8"; c.fillRect(20, 16, W - 40, H - 20); c.strokeRect(20, 16, W - 40, H - 20); c.fillStyle = "#c0443a"; c.font = "900 38px Inter"; c.textAlign = "center"; c.fillText("PAJANGAN", W / 2, H - 16); }} />
    <StandFan p={[1.75, 0, -0.1]} spin={jiggle} s={1.05} rotY={-0.3} />
    {/* thermometer on the wall */}
    <CanvasPlane p={[4.4, 3.6, -3.93]} s={[0.6, 2.4]} px={[60, 240]} frame={INK} draw={(c, W, H) => { c.fillStyle = "#fff"; c.fillRect(0, 0, W, H); c.fillStyle = "#e5233a"; const lv = lerp(0.55, 0.95, heat) + (t > 16.4 ? 0.05 : 0); c.fillRect(W / 2 - 8, H * (1 - lv), 16, H * lv - 30); c.beginPath(); c.arc(W / 2, H - 22, 18, 0, 7); c.fill(); }} />
    <Shelf p={[4.4, 0, -3.5]} w={1.8} rows={2} seed={2} /><Rug p={[0.4, 0, 1.2]} s={[4.6, 2.4]} a="#ffd23a" b="#e5233a" />
    <Box p={[-5.2, 0.6, 2.2]} s={[1.0, 1.2, 1.0]} color="#8a5a32" /><Mug p={[-5.2, 1.4, 2.2]} s={1.2} color="#9fe0ff" />
    <Box p={[-1.4, 3.6, -3.92]} s={[0.05, 0.05, 0.05]} color={INK} />
    <Frame p={[-3.6, 5.2, -3.95]} s={[1.6, 1.1]} art={1} />
    {/* heat haze */}
    {Array.from({ length: 10 }, (_, i) => { const u = (t * 0.45 + i * 0.1) % 1; return <Glow key={i} p={[-5 + i * 1.1, 0.5 + u * 6.5, 1.5 - (i % 3)]} r={0.6 + u * 0.6} color="rgba(255,150,60,1)" o={(0.15 + 0.35 * heat) * Math.sin(u * Math.PI)} />; })}
    <Person p={P} sy={0} h={ADULT} look={budi} f={f} pose={{ mood: t < 18.5 ? "gulp" : t < 19.5 ? "deadpan" : "gulp", sweat: 1, nerv: t > 22 ? 0.6 : 0.3, hunch: lerp(0.5, 1, heat), squash: -0.1 * melt,
      walk: w.moving ? w.phase : undefined, speed: w.speed, armR: t < 17.6 ? [0.2, 0.72 + fanHand] : press > 0 ? [0.2, 0.22] : t > 21.5 ? [0.18, 0.66 + fanHand * 1.3] : undefined, armRK: t < 17.6 ? 1 : press > 0 ? press : t > 21.5 ? seg(t, 21.5, 21.7) : 0,
      arms: t > 19.4 && t < 21.5 ? "shrug" : "down", armK: seg(t, 19.4, 19.7) * (1 - seg(t, 21.2, 21.5)), lookX: t > 19.5 && t < 21.4 ? 0.8 : 0 }} />
  </>);
};

/* =================== S4 24.50 – 31.40  hari ketiga: HP sekarat, cari colokan, listrik hilang =================== */
const K4: Key[] = [
  { t: 24.3, pos: [0.9, 3.4, 5.6], look: [-0.3, 3.3, -3.6], fov: 54 },
  { t: 26.2, pos: [0.4, 3.4, 3.6], look: [-0.9, 3.9, -4.0], fov: 46 },
  { t: 27.3, pos: [-0.6, 8.6, 12.8], look: [-1.4, 1.4, -2.6], fov: 64 },
  { t: 28.8, pos: [-2.0, 4.6, 6.0], look: [-4.6, 3.8, -4.5], fov: 50 },
  { t: 30.2, pos: [1.6, 4.6, 3.4], look: [5.0, 4.8, -5.0], fov: 46 },
  { t: 31.6, pos: [2.5, 4.8, 2.0], look: [5.2, 5.4, -6.0], fov: 44 },
];
export const S4 = ({ t, f }: Ctx) => {
  const blink = Math.sin(t * 9) > 0, sw = walkSeg(t, 26.95, 27.9, -6.6, -4.0), plugIn = seg(t, 28.05, 28.3);
  const sariP: V3 = [sw.x, 0, -3.7 + 0.9], mP: V3 = [4.2, 0, -1.8];
  const shake = t > 27.0 ? Math.sin(t * 22) * 0.04 : 0, boltK = seg(t, 29.8, 31.6, Easing.in(Easing.quad));
  return (<>
    <Cam t={t} keys={K4} />
    <Lights warm="#c8f0ff" />
    <Floor kind="tile" a="#2a6a7a" b="#24606e" unit={1.6} w={20} d={20} />
    <WallHole z={-5} x0={-8} x1={8} hole={{ x: 5.0, y: 3.6, w: 2.4, h: 2.4 }} kind="brick" a="#3f8f9f" b="#378796" />
    <Sky p={[6, 6, -40]} s={[60, 40]} top="#060a2a" bottom="#1a2a6a" stars={0.9} t={t} />
    <SideWall x={-8} kind="brick" a="#3a8494" b="#337c8c" /><SideWall x={8} kind="brick" a="#3a8494" b="#337c8c" />
    {/* the giant phone (dying patient) */}
    <group position={[-0.9, 0, -4.4]} rotation={[-0.08, 0, 0]}>
      <Box p={[0, 3.2, 0]} s={[3.3, 6.3, 0.35]} color="#1b1f33" />
      <CanvasPlane p={[0, 3.2, 0.19]} s={[3.0, 5.9]} px={[300, 590]} draw={(c, W, H) => {
        c.fillStyle = "#0e1630"; c.fillRect(0, 0, W, H); c.fillStyle = "#9fb4ff"; c.font = "900 40px Inter"; c.textAlign = "center"; c.fillText("HARI 3", W / 2, 70); c.font = "900 76px Inter"; c.fillStyle = "#fff"; c.fillText("09:41", W / 2, 150);
        const bx = 60, by = 220, bw = 180, bh = 300; c.strokeStyle = "#fff"; c.lineWidth = 12; c.strokeRect(bx, by, bw, bh); c.fillStyle = "#fff"; c.fillRect(bx + 60, by - 26, 60, 22);
        if (blink) { c.fillStyle = "#ff2b3b"; c.fillRect(bx + 12, by + bh - 40, bw - 24, 28); }
        c.fillStyle = "#ff2b3b"; c.font = "900 64px Inter"; c.fillText("1%", W / 2, by + bh + 70);
        c.strokeStyle = "#fff"; c.lineWidth = 6; for (const s of [-1, 1]) { const ex = W / 2 + s * 40, ey = by + 110; c.beginPath(); c.moveTo(ex - 16, ey - 16); c.lineTo(ex + 16, ey + 16); c.moveTo(ex + 16, ey - 16); c.lineTo(ex - 16, ey + 16); c.stroke(); }
        c.beginPath(); c.arc(W / 2, by + 200, 26, Math.PI + 0.3, -0.3); c.stroke();
      }} />
      <Glow p={[0, 3.2, 0.6]} r={3.2} color="rgba(255,60,80,1)" o={blink ? 0.3 : 0.12} />
    </group>
    <Cable a={[-0.9, 0.2, -4.1]} b={[1.4, 0.15, -3.2]} sag={0.05} n={5} /><Plug p={[1.5, 0.15, -3.1]} rot={[Math.PI / 2, 0, 0.5]} />
    {/* sockets */}
    {[-6.0, -4.0, 2.6, 7.0].map((x) => <Socket key={x} p={[x, 0.9, -4.95]} />)}
    {/* Sari carries a plug to the socket */}
    <Person p={sariP} h={ADULT} look={sari} f={f} pose={{ mood: t < 28.3 ? "worry" : t < 28.9 ? "smile" : "deadpan", sweat: 1, walk: sw.moving ? sw.phase : undefined, speed: sw.speed, hunch: t > 27.9 && t < 28.9 ? 1 : 0, armR: [0.26, t > 27.9 ? 0.36 : 0.45], armRK: 1, arms: t > 28.95 ? "shrug" : "down", armK: seg(t, 28.95, 29.2) }} />
    {t < 28.3 ? <FaceGroup p={sariP}><Plug p={hand(ADULT, [0.26, t > 27.9 ? 0.36 : 0.45], 0, false, 0.12)} rot={[0, 0, -Math.PI / 2]} /></FaceGroup> : <Plug p={[-4.0, 0.9, -4.82]} rot={[-Math.PI / 2, 0, 0]} />}
    <Cable a={[sariP[0] + 0.9, 1.2, sariP[2]]} b={[-7.8, 0.1, -3.0]} sag={0.9} n={6} />
    {t > 28.4 ? <CanvasPlane p={[-4.0, 2.2, -4.6]} s={[0.9, 0.9]} px={[100, 100]} face draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "#ff2b3b"; c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.arc(W / 2, H / 2, 44, 0, 7); c.fill(); c.stroke(); c.strokeStyle = "#fff"; c.lineWidth = 12; c.beginPath(); c.moveTo(30, 30); c.lineTo(70, 70); c.moveTo(70, 30); c.lineTo(30, 70); c.stroke(); }} /> : null}
    {/* Mas shakes a dead power bank */}
    <Person p={mP} h={ADULT} look={mas} f={f} pose={{ mood: "worry", sweat: 0.6, nerv: 0.3, armR: [0.18, 0.55 + shake], armRK: 1, armL: [-0.1, 0.5 - shake], armLK: 1, lookX: -0.5 }} />
    <FaceGroup p={mP}><Box p={hand(ADULT, [0.18, 0.55 + shake], 0, false, 0.12)} s={[0.35, 0.55, 0.12]} color="#2fd46a" line={2} /></FaceGroup>
    {/* Budi holds the giant phone's "hand" */}
    <Person p={[1.7, 0, -2.6]} h={ADULT} look={budi} f={f} pose={{ mood: t < 26.6 ? "worry" : "gulp", sweat: 1, nerv: t > 25.9 && t < 26.9 ? 0.7 : 0.35, armL: [-0.28, 0.42], armLK: 1, arms: "down", hunch: 0.5, lookX: -1 }} />
    {/* missing poster: the electricity itself has disappeared */}
    <CanvasPlane p={[-4.6, 4.2, -4.94]} s={[2.0, 2.6]} px={[200, 260]} frame="#e8dcc4" draw={(c, W, H) => { c.fillStyle = "#fff3d0"; c.fillRect(0, 0, W, H); c.fillStyle = "#c0201e"; c.font = "900 44px Inter"; c.textAlign = "center"; c.fillText("HILANG!", W / 2, 50); c.fillStyle = "#ffd23a"; c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(W * 0.58, 70); c.lineTo(W * 0.3, 150); c.lineTo(W * 0.5, 150); c.lineTo(W * 0.4, 220); c.lineTo(W * 0.72, 130); c.lineTo(W * 0.52, 130); c.closePath(); c.fill(); c.stroke(); c.fillStyle = INK; c.font = "800 20px Inter"; c.fillText("LISTRIK • 3 HARI", W / 2, 248); }} />
    {/* the electricity drifting away through the window */}
    {t > 29.6 ? <Bolt p={[lerp(5.0, 9.0, boltK), lerp(4.6, 9.0, boltK), lerp(-5.4, -26, boltK)]} s={1.3} o={1 - seg(t, 31.0, 31.6)} /> : null}
    <Shelf p={[6.4, 0, -4.6]} w={2.0} rows={3} seed={7} /><Plant p={[-7.0, 0, -4.2]} s={1.2} /><Cabinet p={[3.2, 0, -4.4]} w={1.4} h={1.6} color="#2b6a7a" />
    <Frame p={[2.4, 5.6, -4.95]} s={[1.4, 1.0]} art={2} /><Clock p={[-2.2, 7.4, -4.95]} r={0.5} t={t} />
    <Chair p={[-6.8, 0, 1.2]} rotY={0.8} color="#ffd23a" /><Rug p={[0, 0, 0.4]} s={[6, 3]} a="#1d4f8a" b="#ffd23a" />
    <Candle p={[3.2, 1.6, -4.3]} t={t} />
    <Dust t={t} area={[6, 6, 3]} color="rgba(200,240,255,.8)" />
  </>);
};

/* =================== S5 31.40 – 40.80  hari kelima: isi kulkas jadi korban (camera INSIDE the fridge) =================== */
const K5: Key[] = [
  { t: 31.2, pos: [2.2, 3.4, 9.6], look: [0.6, 2.6, -0.6], fov: 56 },
  { t: 33.0, pos: [1.2, 3.6, 7.0], look: [0.4, 3.0, -0.8], fov: 54 },
  { t: 34.2, pos: [-0.3, 4.8, 3.8], look: [-0.1, 4.2, -1.0], fov: 52 },
  { t: 35.9, pos: [-0.1, 3.6, 3.8], look: [0.0, 3.1, -1.0], fov: 52 },
  { t: 37.8, pos: [0.0, 3.4, 2.9], look: [0.0, 0.6, -0.7], fov: 54 },
  { t: 39.5, pos: [0.2, 3.2, 2.6], look: [0.0, 0.6, -0.7], fov: 50 },
  { t: 41.0, pos: [1.0, 3.4, 6.4], look: [0.5, 2.0, -1.0], fov: 58 },
];
const FW = 2.8, FH = 5.4;
export const S5 = ({ t, f }: Ctx) => {
  const door = seg(t, 32.0, 32.7, Easing.out(Easing.back(1.2))), light = seg(t, 32.0, 32.5);
  const step = walkSeg(t, 33.1, 33.7, 2.3, 2.6), P: V3 = [t < 33.1 ? 2.3 : step.x, 0, t < 33.1 ? 1.3 : lerp(1.3, 1.9, seg(t, 33.1, 33.7))];
  const melt = seg(t, 34.3, 35.8), drip = (k: number) => { const u = ((t - 34.6) * 1.4 + k * 0.33) % 1; return t > 34.6 ? u : -1; };
  const fear = seg(t, 36.0, 36.3), mold = seg(t, 37.9, 40.0, Easing.out(Easing.cubic)), drawer = seg(t, 37.4, 37.9);
  const inner = mixC("#1a2236", "#9fd4f4", light), shelfC = mixC("#2a3450", "#6ac0f0", light);
  return (<>
    <Cam t={t} keys={K5} />
    <Lights warm="#eaf6ff" />
    {/* kitchen */}
    <Floor kind="tile" a="#f2f2f2" b="#d8dde8" unit={1.2} w={20} d={24} />
    <WallDoor z={-1.95} W={18} kind="plain" a="#9fd8c8" b="#9fd8c8" base="#3a7a6a" />
    <Surface p={[0, 4.5, 7.5]} s={[18, 9]} rot={[0, Math.PI, 0]} kind="brick" a="#f2e6c8" b="#eadcb8" />
    <Box p={[-4.6, 0.9, -1.3]} s={[4.0, 1.8, 1.2]} color="#f6f2ea" /><Box p={[-4.6, 1.85, -1.3]} s={[4.2, 0.1, 1.3]} color="#4a4a5a" line={2} />
    <Box p={[4.6, 0.9, -1.3]} s={[4.0, 1.8, 1.2]} color="#f6f2ea" /><Box p={[4.6, 1.85, -1.3]} s={[4.2, 0.1, 1.3]} color="#4a4a5a" line={2} />
    <Box p={[-4.6, 4.6, -1.65]} s={[4.0, 1.6, 0.6]} color="#2fb59a" /><Box p={[4.6, 4.6, -1.65]} s={[4.0, 1.6, 0.6]} color="#2fb59a" />
    <Steam p={[4.0, 2.2, -1.2]} t={t} n={3} o={0.3} /><Cyl p={[4.0, 2.15, -1.2]} rt={0.5} h={0.5} color="#e5483f" />
    <Plant p={[-3.4, 1.9, -1.3]} s={0.5} /><Mug p={[-5.4, 2.1, -1.2]} s={1.2} color="#ffd23a" /><Bowl p={[5.6, 1.9, -1.2]} food="#ff9a3a" />
    <TearCal p={[-2.6, 3.4, -1.92]} day={5} s={0.8} />
    {/* kitchen wall behind the camera (seen from inside the fridge) */}
    <Box p={[-2.5, 0.9, 6.8]} s={[5, 1.8, 1.2]} color="#f6f2ea" /><Box p={[3.4, 3.2, 7.4]} s={[2.4, 2.2, 0.1]} color="#bfe9ff" line={4} /><Frame p={[-2.4, 4.4, 7.4]} s={[1.4, 1.0]} rot={[0, Math.PI, 0]} art={0} />
    <Shaft p={[2.4, 3.2, 4.0]} s={[2.6, 7]} rot={[0, 0, 0.4]} color="255,240,190" o={0.18} />
    {/* fridge shell */}
    <Box p={[0, FH / 2 + 0.15, -1.75]} s={[FW + 0.4, FH + 0.3, 0.2]} color="#e9f2ff" />
    <Box p={[-FW / 2 - 0.1, FH / 2 + 0.15, -0.8]} s={[0.2, FH + 0.3, 1.9]} color="#e9f2ff" /><Box p={[FW / 2 + 0.1, FH / 2 + 0.15, -0.8]} s={[0.2, FH + 0.3, 1.9]} color="#e9f2ff" />
    <Box p={[0, FH + 0.4, -0.8]} s={[FW + 0.4, 0.2, 1.9]} color="#e9f2ff" /><Box p={[0, 0.15, -0.8]} s={[FW + 0.4, 0.3, 1.9]} color="#9aa6c0" />
    <Surface p={[0, FH / 2 + 0.15, -1.64]} s={[FW, FH]} kind="plain" a={inner} b={inner} />
    {[1.6, 2.9, 4.1].map((y) => y < 2 ? null : <Box key={y} p={[0, y, -0.85]} s={[FW - 0.05, 0.06, 1.6]} color={shelfC} line={2} />)}
    {/* top shelf: ice cream melting into chocolate milk */}
    <Cyl p={[-0.5, 4.35, -0.8]} rt={0.42} rb={0.36} h={0.44} color="#ffffff" />
    <Ball p={[-0.5, 4.62 - melt * 0.2, -0.8]} r={0.36} s={[1, lerp(0.9, 0.2, melt), 1]} color="#6b3a1f" ink={0.03} />
    <CanvasPlane p={[-0.3, 4.14, -0.6]} rot={[-Math.PI / 2, 0, 0]} s={[0.3 + 1.4 * melt, 0.3 + 1.0 * melt]} px={[128, 96]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "#7a4520"; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.ellipse(W / 2, H / 2, W * 0.46, H * 0.42, 0, 0, 7); c.fill(); c.stroke(); }} />
    {[0, 1, 2].map((k) => drip(k) >= 0 ? <Ball key={k} p={[0.3 + k * 0.15, 4.1 - drip(k) * 1.15, 0.0]} r={0.06} s={[1, 1.4, 1]} color="#7a4520" ink={0.015} /> : null)}
    <Box p={[0.8, 4.45, -0.9]} s={[0.6, 0.6, 0.6]} color="#ffd23a" /><Cyl p={[0.9, 4.5, -0.3]} rt={0.14} h={0.7} color="#2fd46a" line={2} />
    {[0, 1, 2].map((i) => <Ball key={"e" + i} p={[-1.05 + i * 0.22, 4.24, -0.25]} r={0.1} s={[1, 1.25, 1]} color="#fff6e0" ink={0.02} />)}<Ball p={[0.35, 4.32, -1.1]} r={0.2} color="#e5233a" ink={0.03} /><Ball p={[0.05, 4.32, -1.2]} r={0.18} color="#ff8a1c" ink={0.03} />
    <Cyl p={[-1.0, 3.3, -0.3]} rt={0.12} h={0.7} color="#ffffff" line={2} /><Box p={[0.6, 3.1, -0.2]} s={[0.4, 0.3, 0.3]} color="#ffd23a" line={2} />
    {/* middle shelf: frightened meat */}
    <Cyl p={[0, 2.98, -0.6]} rt={0.7} h={0.06} color="#ffffff" line={2} />
    <CanvasPlane p={[0, 3.35, -0.55]} s={[1.3, 0.8]} px={[260, 160]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); const sh = fear > 0 ? Math.sin(t * 40) * 3 : 0; c.translate(sh, 0); c.fillStyle = "#e5483f"; c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.ellipse(W / 2, H * 0.55, W * 0.42, H * 0.36, 0.1, 0, 7); c.fill(); c.stroke(); c.strokeStyle = "#fff"; c.lineWidth = 10; c.beginPath(); c.ellipse(W * 0.58, H * 0.6, W * 0.2, H * 0.14, 0.1, 0, 7); c.stroke(); c.strokeStyle = INK; c.lineWidth = 5; for (const s of [-1, 1]) { const ex = W / 2 + s * 30, ey = H * 0.42; c.fillStyle = "#fff"; c.beginPath(); c.arc(ex, ey, 14 + fear * 6, 0, 7); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(ex, ey, 4, 0, 7); c.fill(); } c.beginPath(); c.ellipse(W / 2, H * 0.68, 9, 9 + fear * 6, 0, 0, 7); c.stroke(); if (fear > 0) { c.fillStyle = "#9bdcff"; c.beginPath(); c.arc(W * 0.85, H * 0.3 + ((t * 60) % 30), 8, 0, 7); c.fill(); c.stroke(); } }} />
    <Cyl p={[-0.9, 3.25, -1.0]} rt={0.18} h={0.6} color="#ff8a1c" line={2} /><Box p={[0.95, 3.15, -1.0]} s={[0.5, 0.4, 0.5]} color="#7c4dff" />
    {/* freezer drawer: biology experiment */}
    <group position={[0, 0, drawer * 0.5]}>
      <Box p={[0, 0.42, -0.8]} s={[FW - 0.1, 0.1, 1.5]} color="#cfe6ff" /><Box p={[0, 0.9, -0.03]} s={[FW - 0.1, 1.0, 0.08]} color="#cfe6ff" /><Box p={[0, 0.9, -1.55]} s={[FW - 0.1, 1.0, 0.06]} color="#cfe6ff" />
      {[-1, 1].map((sx) => <Box key={sx} p={[sx * (FW / 2 - 0.1), 0.9, -0.8]} s={[0.06, 1.0, 1.5]} color="#cfe6ff" />)}<Box p={[0, 1.42, -0.03]} s={[FW - 0.1, 0.08, 0.1]} color="#9aa6c0" line={2} />
      {[[-0.7, -0.6], [0.2, -0.9], [0.8, -0.4], [-0.2, -0.3]].map(([x, z], i) => { const g = clamp(mold * 1.4 - i * 0.15); return <React.Fragment key={i}><Box p={[x, 0.6, z]} s={[0.55, 0.25, 0.45]} color="#ffffff" line={2} />{g > 0 ? <Ball p={[x, 0.8, z]} r={0.14 + 0.3 * g} s={[1.3, 0.85, 1]} color={["#7ad63a", "#3fbf3a", "#a0e050", "#2fc890"][i]} ink={0.04} /> : null}</React.Fragment>; })}
      {mold > 0.3 ? <CanvasPlane p={[0.2, 1.15, -0.75]} s={[0.6, 0.35]} px={[120, 70]} face draw={(c, W, H) => { c.clearRect(0, 0, W, H); const op = clamp((t - 40.0) * 6); for (const s of [-1, 1]) { c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.ellipse(W / 2 + s * 22, H / 2, 16, 16 * Math.max(0.12, op), 0, 0, 7); c.fill(); c.stroke(); if (op > 0.5) { c.fillStyle = INK; c.beginPath(); c.arc(W / 2 + s * 22, H / 2 + 2, 6, 0, 7); c.fill(); } } }} /> : null}
      {mold > 0 ? Array.from({ length: 5 }, (_, i) => { const u = (t * 0.5 + i / 5) % 1; return <Glow key={i} p={[-0.8 + i * 0.4, 1.0 + u * 1.6, -0.4]} r={0.35 + u * 0.3} color="rgba(140,255,80,1)" o={0.5 * mold * (1 - u)} />; }) : null}
    </group>
    {light < 1 ? <Glow p={[0.5, 3, 0.2]} r={0.6} color="rgba(255,255,255,1)" o={0.4 * (1 - light)} /> : null}
    {/* door (hinge on the left, swings outward) */}
    <group position={[-FW / 2 - 0.2, 0, 0.15]} rotation={[0, -door * 1.75, 0]}>
      <Box p={[FW / 2 + 0.2, FH / 2 + 0.15, 0]} s={[FW + 0.4, FH + 0.3, 0.2]} color="#e9f2ff" />
      <Box p={[FW / 2 + 0.2, FH / 2, -0.25]} s={[FW - 0.2, 0.08, 0.35]} color="#bfe6ff" line={2} />
      {[0.3, 0.8, 1.3].map((x, i) => <Cyl key={x} p={[x + 0.3, FH / 2 + 0.45, -0.25]} rt={0.12} h={0.8} color={["#ff3b6b", "#2f8cff", "#ffd23a"][i]} line={2} />)}
      <Box p={[FW + 0.15, FH * 0.55, 0.16]} s={[0.12, 1.4, 0.12]} color="#9aa6c0" line={2} />
    </group>
    <Person p={P} h={ADULT} look={budi} f={f} pose={{ mood: t < 32.7 ? "smile" : t < 33.2 ? "shock" : t < 36 ? "worry" : t < 38 ? "gulp" : "worry", nerv: t > 32.7 ? 0.35 : 0, sweat: t > 35.9 ? 0.6 : 0,
      armL: t < 32.75 ? [lerp(-0.18, -0.27, seg(t, 31.6, 31.95)), 0.5] : undefined, armLK: 1 - seg(t, 32.7, 32.9), armR: [0.04, 0.72], armRK: seg(t, 32.9, 33.1), arms: "down", walk: step.moving ? step.phase : undefined, speed: step.speed, hunch: t > 33 ? 0.6 : 0, lookX: t > 33.5 ? -1 : 0, squash: t > 32.7 && t < 32.95 ? -0.08 : 0 }} />
    {t > 32.8 ? Array.from({ length: 4 }, (_, i) => { const u = (t * 0.4 + i / 4) % 1; return <Glow key={"st" + i} p={[lerp(0.2, 1.8, u), 3.2 + u * 1.5, lerp(0, 1.4, u)]} r={0.4 + u * 0.4} color="rgba(150,230,90,1)" o={0.35 * (1 - u)} />; }) : null}
  </>);
};

/* =================== S6 40.80 – 46.15  hari ketujuh: Wi-Fi mati, TV tidak bisa =================== */
const K6: Key[] = [
  { t: 40.6, pos: [1.8, 2.0, 8.4], look: [0.3, 2.1, -0.6], fov: 56 },
  { t: 43.3, pos: [1.3, 1.9, 7.4], look: [0.3, 2.2, -0.6], fov: 54 },
  { t: 44.4, pos: [-0.6, 2.8, 7.8], look: [-2.3, 2.0, -2.0], fov: 54 },
  { t: 46.4, pos: [-1.3, 2.8, 7.2], look: [-2.7, 2.0, -2.2], fov: 52 },
];
export const S6 = ({ t, f }: Ctx) => {
  const wifiDead = t > 43.38, w = walkSeg(t, 44.45, 45.05, 0.1, -1.9), P: V3 = [t < 44.45 ? 0.1 : w.x, 0, t < 44.45 ? -0.6 : lerp(-0.6, -1.0, seg(t, 44.45, 45.05))];
  const sway = Math.sin(t * 3.2) * 0.06, smack = seg(t, 45.0, 45.15) * (1 - seg(t, 45.25, 45.5)), hit = 45.18;
  const wob = t > hit ? 0.06 * Math.exp(-(t - hit) * 5) * Math.sin((t - hit) * 26) : 0, kidP: V3 = [-3.2, 0, 0.6];
  return (<>
    <Cam t={t} keys={K6} impacts={[[hit, 0.008]]} />
    <Lights warm="#d8c8ff" />
    <Floor kind="carpet" a="#4a3a8a" b="#433480" unit={1.6} w={20} d={20} />
    <WallDoor z={-3.5} W={16} kind="wood" a="#6a5ab0" b="#6252a6" base="#2a2050" />
    <SideWall x={-6.5} kind="wood" a="#5e50a2" b="#574a98" />
    <WindowCity p={[3.6, 4.4, -3.45]} s={[2.6, 2.2]} dusk />
    <Table p={[0.9, 0, 1.8]} w={1.6} d={1.0} h={0.75} top="#c98a4a" leg="#6b3f1f" />
    <Router p={[0.9, 0.82, 1.8]} s={1.3} ok={!wifiDead} blink={Math.sin(t * 10) > 0 ? 1 : 0} />
    <CanvasPlane p={[0.9, 2.3 + Math.sin(t * 2) * 0.05, 1.8]} s={[1.0, 0.8]} px={[200, 160]} face draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.lineCap = "round"; const col = wifiDead ? "#ff3b3b" : "#2fd46a"; for (let i = 0; i < 3; i++) { c.strokeStyle = INK; c.lineWidth = 22; c.beginPath(); c.arc(W / 2, H * 0.9, 30 + i * 34, Math.PI * 1.25, Math.PI * 1.75); c.stroke(); c.strokeStyle = wifiDead && i > 0 ? "rgba(255,255,255,.35)" : col; c.lineWidth = 12; c.beginPath(); c.arc(W / 2, H * 0.9, 30 + i * 34, Math.PI * 1.25, Math.PI * 1.75); c.stroke(); } if (wifiDead) { const k = clamp((t - 43.38) * 6); c.strokeStyle = INK; c.lineWidth = 24; c.beginPath(); c.moveTo(W * 0.2, H * 0.15); c.lineTo(lerp(W * 0.2, W * 0.8, k), lerp(H * 0.15, H * 0.95, k)); c.stroke(); c.strokeStyle = "#ff3b3b"; c.lineWidth = 12; c.stroke(); } }} />
    <Candle p={[1.5, 0.82, 1.6]} t={t} s={0.9} />
    <TVCabinet p={[-3.2, 0, -2.8]} w={3.2} />
    <group position={[-3.2, 2.05, -2.85]} rotation={[0, 0, wob]}><TV p={[0, 0, 0]} w={2.8} draw={(c, W, H) => { c.fillStyle = "#0b0e18"; c.fillRect(0, 0, W, H); c.fillStyle = "rgba(255,255,255,.07)"; c.beginPath(); c.moveTo(W * 0.1, 0); c.lineTo(W * 0.3, 0); c.lineTo(W * 0.15, H); c.lineTo(0, H); c.fill(); c.fillStyle = "rgba(160,170,220,.12)"; c.beginPath(); c.arc(W * 0.42, H * 0.6, 26, 0, 7); c.fill(); c.fillRect(W * 0.42 - 26, H * 0.6 + 20, 52, 60); c.beginPath(); c.arc(W * 0.6, H * 0.7, 18, 0, 7); c.fill(); }} /></group>
    <Person p={kidP} h={KID} look={dimas} f={f} pose={{ mood: t < 44.6 ? "deadpan" : "worry", sit: 1, armR: [0.22, 0.32], armRK: 1, lookX: -0.4, sweat: 0 }} />
    <FaceGroup p={kidP}><Box p={hand(KID, [0.22, 0.32], 0, false, 0.1)} s={[0.12, 0.35, 0.08]} rot={[0, 0, -0.6]} color="#2b3350" line={2} /></FaceGroup>
    <Bowl p={[-2.2, 0, 0.9]} food="#fff0a0" />
    <Person p={P} h={ADULT} look={budi} f={f} pose={{ mood: t < 43.38 ? "worry" : t < 44.4 ? "shock" : t < 45.2 ? "angry" : "deadpan", nerv: t > 43.3 && t < 44.3 ? 0.5 : 0.1, sweat: t > 43.4 ? 0.5 : 0,
      armR: t < 43.8 ? [0.14 + sway, 0.96] : smack > 0 ? [0.3, lerp(0.75, 0.62, seg(t, 45.0, 45.15))] : undefined, armRK: t < 43.8 ? 1 - seg(t, 43.7, 43.9) : smack, hunch: t > 43.74 && t < 44.4 ? 0.8 : 0,
      walk: w.moving ? w.phase : undefined, speed: w.speed, flip: t > 44.45, lookX: t < 43.3 ? 0.5 : 0, squash: t > hit && t < hit + 0.15 ? -0.06 : 0 }} />
    {t < 43.9 ? <FaceGroup p={P}><Phone p={hand(ADULT, [0.14 + sway, 0.96], 0, false, 0.12)} s={0.85} draw={(c, W, H) => { c.fillStyle = "#1a2a5a"; c.fillRect(0, 0, W, H); c.fillStyle = "#fff"; c.font = "900 18px Inter"; c.textAlign = "center"; c.fillText("Mencari", W / 2, H / 2 - 6); c.fillText("Wi-Fi...", W / 2, H / 2 + 18); }} /></FaceGroup> : <Phone p={[1.3, 0.83, 2.1]} rot={[-Math.PI / 2, 0, 0.3]} s={0.85} />}
    <Sofa p={[3.4, 0, -2.4]} color="#ff8a1c" w={3.4} /><Shelf p={[-5.6, 0, -3.1]} w={1.6} rows={4} seed={9} /><Plant p={[5.8, 0, 0.4]} s={1.2} />
    <Frame p={[-0.6, 4.8, -3.45]} s={[1.4, 1.0]} art={1} /><Clock p={[1.4, 5.6, -3.45]} r={0.5} t={t} />
    <TearCal p={[-1.6, 4.4, -3.42]} day={7} s={0.8} /><Rug p={[-1, 0, 0.6]} s={[6, 3.2]} a="#ffd23a" b="#ff4fa0" />
    <Dust t={t} area={[5, 4, 3]} color="rgba(220,210,255,.8)" />
  </>);
};

/* =================== S7 46.15 – 52.00  hiburan: tetangga menyapu, cicak di dinding =================== */
const K7: Key[] = [
  { t: 45.95, pos: [7.8, 3.2, 11.6], look: [0.8, 1.8, -1.2], fov: 54 },
  { t: 48.6, pos: [6.4, 3.0, 10.6], look: [0.8, 1.8, -1.2], fov: 52 },
  { t: 49.7, pos: [2.0, 3.2, 8.2], look: [-0.8, 2.8, -2.6], fov: 54 },
  { t: 51.2, pos: [0.6, 3.4, 6.8], look: [-0.8, 3.0, -2.9], fov: 52 },
  { t: 52.2, pos: [0.4, 3.5, 6.4], look: [-0.8, 3.0, -2.9], fov: 52 },
];
export const S7 = ({ t, f }: Ctx) => {
  const sw = Math.sin(t * 5.2), sweepX = 4.4 + Math.sin(t * 0.8) * 0.6, look = clamp(sw * 0.8 + 0.4, -1, 1);
  const gk = seg(t, 49.4, 51.6, Easing.linear), gx = lerp(1.6, -1.2, gk), gy = 3.8 + Math.sin(gk * 6) * 0.15;
  const point = seg(t, 49.9, 50.2), cheer = seg(t, 51.2, 51.45);
  const fam = [{ p: [-2.4, 0, -1.5] as V3, l: sari, h: ADULT }, { p: [-1.1, 0, -1.4] as V3, l: dimas, h: KID }, { p: [0.2, 0, -1.5] as V3, l: budi, h: ADULT }];
  const rtP: V3 = [sweepX, 0, 3.8];
  return (<>
    <Cam t={t} keys={K7} />
    <Lights warm="#fff0b0" />
    <Sky p={[0, 12, -30]} s={[90, 40]} top="#5ab0ff" bottom="#d8f0ff" />
    <Surface p={[0, 0, 2]} s={[40, 30]} rot={[-Math.PI / 2, 0, 0]} kind="carpet" a="#5ac85a" b="#52be52" unit={2.4} />
    {/* porch + house facade */}
    <Box p={[-1, 0.15, -1.6]} s={[8, 0.3, 3.2]} color="#c98a4a" />
    <Surface p={[-1, 2.4, -3.0]} s={[8, 4.8]} kind="wood" a="#f2d49a" b="#ead08e" unit={1.4} />
    <Box p={[-1, 5.0, -2.2]} s={[9, 0.3, 2.4]} color="#c0443a" />{[-4.8, 2.8].map((x) => <Box key={x} p={[x, 2.5, -0.2]} s={[0.25, 5.0, 0.25]} color="#8a5a32" line={3} />)}
    <Box p={[-3.6, 1.7, -2.97]} s={[1.1, 2.8, 0.06]} color="#7a4a2a" line={3} /><Box p={[1.2, 2.8, -2.97]} s={[1.4, 1.1, 0.05]} color="#bfe9ff" line={3} />
    <Bulb p={[-1.0, 4.3, -2.6]} cord={0.4} on={0} />
    <Box p={[-1.1, 0.45, -1.7]} s={[4.2, 0.18, 0.8]} color="#8a5a32" />{[-2.9, 0.7].map((x) => <Box key={x} p={[x, 0.3, -1.7]} s={[0.14, 0.3, 0.7]} color="#6b3f1f" line={2} />)}
    <Gecko p={[gx, gy, -2.93]} rot={[0, 0, Math.PI / 2 + Math.sin(gk * 6) * 0.3]} s={0.9} t={t} />
    {fam.map((m, i) => <Person key={i} p={m.p} sy={0.3} h={m.h} look={m.l} f={f + i * 7} pose={{ mood: t < 49.5 ? "deadpan" : t < 51.2 ? "shock" : "grin", sit: 1, lookX: t < 49.4 ? look : -0.6,
      arms: t > 51.2 ? "up" : point > 0 && i === 2 ? "point" : "down", armK: t > 51.2 ? cheer : point, armR: i === 1 && t > 50.3 && t < 51.2 ? [0.06, 0.48 + Math.abs(Math.sin(t * 14)) * 0.05] : t < 49.4 && i === 0 ? [0.08, 0.36] : undefined, armRK: 1,
      armL: i === 1 && t > 50.3 && t < 51.2 ? [-0.06, 0.48 + Math.abs(Math.sin(t * 14)) * 0.05] : undefined, armLK: 1 }} />)}
    <Bowl p={[-1.8, 0.55, -1.75]} food="#ffcf5a" s={0.8} />
    {/* low fence + neighbour sweeping */}
    <Fence p={[1.6, 0, 2.5]} n={12} gap={0.62} />
    <Person p={rtP} h={ADULT} look={pakRT} f={f} pose={{ mood: "smile", armR: [0.2 + sw * 0.08, 0.38], armRK: 1, armL: [0.06 + sw * 0.08, 0.55], armLK: 1, walk: Math.sin(t * 0.8) * 2, speed: 0.15 }} />
    <FaceGroup p={rtP}><group position={hand(ADULT, [0.14 + sw * 0.08, 0.45], 0, false, 0.15)} rotation={[0, 0, 0.35 + sw * 0.35]}><Broom p={[0, -1.4, 0]} /></group></FaceGroup>
    <Leaves p={[sweepX + 0.8, 0, 4.2]} n={12} spread={1.2} push={Math.sin(t * 5.2) * 0.15} />
    <Tree p={[8, 0, -4]} s={1.2} /><Tree p={[-8, 0, -5]} s={1.4} leaf="#2f9e4a" /><Palm p={[5.6, 0, -6]} s={1.1} />
    <Plant p={[-5.6, 0.3, -0.6]} s={0.9} /><Plant p={[2.4, 0.3, -0.4]} s={0.8} pot="#2f6bff" /><Bucket p={[6.2, 0.22, 2.6]} />
    <House p={[10, 0, -2]} rotY={-0.6} wall="#f2b0c0" /><Bin p={[7.4, 0, 4.2]} />
    <Dust t={t} area={[7, 4, 4]} color="rgba(255,255,220,.8)" />
  </>);
};

/* =================== S8 52.00 – 65.15  hari kesepuluh: bakat terpendam -> zaman kerajaan =================== */
const K8: Key[] = [
  { t: 51.8, pos: [-6.2, 3.8, 10.6], look: [-6.4, 2.2, -1.6], fov: 56 },
  { t: 55.3, pos: [-4.0, 3.6, 9.6], look: [-3.6, 1.9, -1.2], fov: 54 },
  { t: 57.1, pos: [1.2, 3.4, 9.4], look: [1.4, 1.6, -1.0], fov: 54 },
  { t: 59.1, pos: [5.6, 3.6, 9.8], look: [5.8, 2.2, -1.0], fov: 54 },
  { t: 60.8, pos: [5.0, 4.0, 11.4], look: [4.0, 2.4, -2], fov: 56 },
  { t: 63.7, pos: [0.0, 6.4, 19.0], look: [0.0, 3.0, -3], fov: 58 },
  { t: 65.4, pos: [0.0, 6.6, 19.8], look: [0.0, 3.1, -3], fov: 56 },
];
const CH0 = 53.55, CH1 = 54.12, CH2 = 54.23; // wind-up, strike, split
export const S8 = ({ t, f }: Ctx) => {
  const bP: V3 = [-7.2, 0, 0.4], sP: V3 = [-3.6, 0, 0.2], tP: V3 = [1.6, 0, 0.6], dP: V3 = [5.2, 0, 0.8];
  const wind = seg(t, CH0, CH1 - 0.05, Easing.inOut(Easing.sin)), strike = seg(t, CH1 - 0.05, CH2, Easing.in(Easing.quad));
  const axeT: [number, number] = t < CH0 ? [0.22, 0.4] : t < CH2 - 0.05 ? [lerp(0.22, 0.04, wind), lerp(0.4, 1.02, wind)] : [lerp(0.04, 0.27, strike), lerp(1.02, 0.42, strike)];
  const axeRot = t < CH0 ? -1.2 : t < CH2 - 0.05 ? lerp(-1.2, 0.5, wind) : lerp(0.5, -1.55, strike);
  const sd = Math.max(0, t - CH2), g = 20, split = (s: number): V3 => { const v = [s * 2.2, 3.4, 0.6]; const tl = (v[1] + Math.sqrt(v[1] ** 2 + 2 * g * 0.5)) / g, q = Math.min(sd, tl); return [-6.25 + v[0] * q + (sd > tl ? s * 0.3 * (1 - Math.exp(-(sd - tl) * 5)) : 0), Math.max(0.25, 1.0 + v[1] * q - 0.5 * g * q * q), 0.5 + v[2] * q]; };
  const stir = t * 4, scrub = Math.sin(t * 9), pour = seg(t, 59.15, 59.6), lift = seg(t, 58.4, 59.0, Easing.inOut(Easing.sin));
  const unroll = seg(t, 63.9, 64.5, Easing.out(Easing.quad)), raise = seg(t, 64.19, 64.9, Easing.out(Easing.cubic)), royal = t > 63.9;
  const bucketT: [number, number] = [lerp(0.2, 0.02, lift), lerp(0.38, 1.12, lift)];
  return (<>
    <Cam t={t} keys={K8} impacts={[[CH2, 0.006]]} />
    <Lights warm="#fff0c0" />
    <Sky p={[0, 14, -40]} s={[120, 50]} top="#3a9aff" bottom="#cfeaff" />
    <Surface p={[0, 0, 2]} s={[50, 30]} rot={[-Math.PI / 2, 0, 0]} kind="plank" a="#c9a46a" b="#bf9a60" unit={2.6} />
    {/* long village house behind */}
    <Surface p={[0, 2.2, -4]} s={[22, 4.4]} kind="wood" a="#e8b878" b="#dcac6c" unit={1.4} />
    <Box p={[0, 4.6, -3.2]} s={[23, 0.4, 2.4]} color="#8a3a2a" />{[-10.6, -5, 0, 5, 10.6].map((x) => <Box key={x} p={[x, 2.2, -3.9]} s={[0.3, 4.4, 0.3]} color="#6b3f1f" line={3} />)}
    <Box p={[-2.4, 1.6, -3.96]} s={[1.2, 3.0, 0.06]} color="#6b3f1f" line={3} />{[-8.8, 3.2, 8.0].map((x) => <Box key={x} p={[x, 2.6, -3.96]} s={[1.3, 1.1, 0.05]} color="#2a3a5a" line={3} />)}
    <TearCal p={[-5.8, 3.2, -3.92]} day={9} next={10} k={seg(t, 52.1, 52.8, Easing.in(Easing.quad))} s={0.85} />
    {[-6, 0, 6].map((x, i) => <Banner key={x} p={[x, 4.35, -3.85]} w={1.8} h={3.4} k={royal ? clamp(unroll * 1.1 - i * 0.05) : 0} />)}
    <Flag p={[-8.6, 0, -2.6]} h={6.4} up={raise} t={t} /><Flag p={[9.0, 0, -2.6]} h={6.4} up={raise} t={t} color="#2f6bff" />
    {/* station 1: Budi chops firewood */}
    <Cyl p={[-6.25, 0.35, 0.5]} rt={0.5} h={0.7} color="#8a5a32" />
    {t < CH2 ? <Cyl p={[-6.25, 1.0, 0.5]} rt={0.3} h={0.6} color="#c9a46a" /> : <>{[-1, 1].map((s) => { const q = split(s); return <Box key={s} p={q} s={[0.28, 0.6, 0.55]} rot={[0, 0, s * Math.min(1.57, sd * 9)]} color="#c9a46a" />; })}</>}
    {t > CH2 ? <Glow p={[-6.25, 1.1, 0.8]} r={1.2} color="rgba(255,255,220,1)" o={0.8 * Math.exp(-(t - CH2) * 8)} /> : null}
    {Array.from({ length: 6 }, (_, i) => <Cyl key={i} p={[-8.8 + (i % 3) * 0.55, 0.25 + Math.floor(i / 3) * 0.48, -2.6]} rt={0.24} h={1.6} color="#a0703a" rot={[Math.PI / 2, 0, 0]} />)}
    <Person p={bP} h={ADULT} look={budi} f={f} pose={{ mood: t < CH0 ? "grin" : t < CH2 + 0.3 ? "angry" : "grin", armR: axeT, armRK: 1, armL: [axeT[0] - 0.05, axeT[1] - 0.04], armLK: 1, squash: t > CH2 && t < CH2 + 0.15 ? -0.08 : t > CH0 && t < CH1 ? 0.04 * wind : 0, tilt: t > CH2 - 0.05 && t < CH2 + 0.3 ? 0.08 : 0, lookX: 1 }} />
    <FaceGroup p={bP}><group position={hand(ADULT, axeT, 0, false, 0.14)} rotation={[0, 0, axeRot]}><Cyl p={[0, 0.7, 0]} rt={0.05} h={1.5} color="#a0703a" line={2} /><Box p={[0.18, 1.4, 0]} s={[0.4, 0.32, 0.08]} color="#9aa0b8" line={2} /></group></FaceGroup>
    {/* station 2: Sari cooks on a wood fire */}
    <FireStove p={[-2.6, 0, 0.0]} t={t} /><Steam p={[-2.6, 1.6, 0.0]} t={t} />
    <Person p={sP} h={ADULT} look={sari} f={f} pose={{ mood: "smile", armR: [0.24 + Math.cos(stir) * 0.025, 0.42 + Math.sin(stir) * 0.015], armRK: 1, lookX: 1, armL: t > 55.4 && t < 56.8 ? [-0.1, 0.64] : undefined, armLK: 1 }} />
    <FaceGroup p={sP}><group position={hand(ADULT, [0.24 + Math.cos(stir) * 0.025, 0.42 + Math.sin(stir) * 0.015], 0, false, 0.1)} rotation={[0, 0, -0.5]}><Cyl p={[0, -0.3, 0]} rt={0.03} h={0.9} color="#c9a46a" line={2} /></group></FaceGroup>
    {/* station 3: Bu Tin washes clothes by hand */}
    <Basin p={[2.6, 0, 0.6]} />
    <Box p={[1.0, 0.25, 0.4]} s={[0.6, 0.5, 0.6]} color="#2f6bff" line={2} />
    <Person p={tP} h={ADULT} look={buTin} f={f} pose={{ mood: t > 57 && t < 58.4 ? "grin" : "smile", sit: 1, armR: [0.26 + scrub * 0.03, 0.2], armRK: 1, armL: [0.16 + scrub * 0.03, 0.22], armLK: 1, hunch: 0.6 }} />
    {Array.from({ length: 6 }, (_, i) => { const u = (t * 0.7 + i / 6) % 1; return <Ball key={i} p={[2.4 + Math.sin(i * 2) * 0.5, 0.5 + u * 1.2, 0.7 + Math.cos(i) * 0.3]} r={0.08 + 0.05 * (i % 2)} color="#eaf6ff" ink={0.012} />; })}
    <Clothesline p={[2.4, 0, -2.4]} w={4.4} t={t} />
    {/* station 4: Dimas bathes with well water */}
    <Well p={[7.2, 0, -0.6]} bucketUp={1} rope={t * 0.3} />
    <Person p={dP} h={KID} look={dimas} f={f} pose={{ mood: pour > 0 ? "laugh" : "grin", armR: bucketT, armRK: 1, armL: [-bucketT[0], bucketT[1]], armLK: 1, squash: pour > 0.3 && t < 60.2 ? -0.05 : 0, nerv: pour > 0.5 && t < 60.4 ? 0.6 : 0 }} />
    <FaceGroup p={dP}><Bucket p={[0, hand(KID, bucketT)[1] + 0.25, 0.15]} rot={[0, 0, pour * 2.2]} /></FaceGroup>
    {pour > 0.2 && t < 60.6 ? Array.from({ length: 14 }, (_, i) => { const u = ((t - 59.3) * 2.2 + i / 14) % 1; return <Ball key={i} p={[dP[0] + 0.15 + Math.sin(i * 3) * 0.2, KID + 0.5 - u * (KID + 0.4), dP[2] + 0.3 + Math.cos(i) * 0.15]} r={0.07} s={[1, 1.6, 1]} color="#6ac8ff" ink={0.012} />; }) : null}
    {t > 59.4 ? <CanvasPlane p={[dP[0], 0.03, dP[2] + 0.3]} rot={[-Math.PI / 2, 0, 0]} s={[1.8 * seg(t, 59.4, 60.2) + 0.01, 1.0 * seg(t, 59.4, 60.2) + 0.01]} px={[128, 80]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = "#6ac8ff"; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.ellipse(W / 2, H / 2, W * 0.46, H * 0.4, 0, 0, 7); c.fill(); c.stroke(); }} /> : null}
    <Tree p={[-11, 0, 1]} s={1.3} /><Palm p={[10.4, 0, -6]} s={1.2} /><Bucket p={[6.0, 0.22, 2.0]} color="#ff4fa0" /><Plant p={[-0.4, 0, -3.3]} s={0.9} />
    <Fence p={[-12, 0, 4.8]} n={10} gap={0.7} /><Fence p={[6, 0, 4.8]} n={10} gap={0.7} />
    <Dust t={t} area={[9, 5, 4]} color="rgba(255,250,220,.8)" />
  </>);
};
void [Ball, Clock, Box, Cyl, Bed, Glow, House, Bin];
