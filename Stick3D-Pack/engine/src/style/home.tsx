// Household / village / night props (added for "listrik-30-hari"). Logged in rules/ACTION-LIBRARY.md.
import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Box, Cyl, Ball, CanvasPlane, INK } from "./toon";
import { V3, lerp, clamp } from "./kit";
import { Glow } from "./props";
import { drawPuppet, Look, Pose } from "./puppet";

/* ---------- colour helpers ---------- */
const hx = (c: string) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const mixC = (a: string, b: string, k: number) => { const A = hx(a), B = hx(b), q = clamp(k); return "#" + A.map((v, i) => Math.round(lerp(v, B[i], q)).toString(16).padStart(2, "0")).join(""); };

/* ---------- flat puppet (lying on a sofa / bed / floor); drawn on a plane, rot sets the plane ---------- */
export const FlatPuppet: React.FC<{ p: V3; h: number; rot: V3; look: Look; pose: Omit<Pose, "t"> & { t?: number }; f: number }> = ({ p, h, rot, look, pose, f }) => (
  <CanvasPlane p={p} rot={rot} s={[h * 512 / 768, h]} px={[512, 768]} draw={(c, W, H) => drawPuppet(c, W, H, look, { ...pose, t: pose.t ?? f })} />
);

/* ---------- sky gradient with optional stars (cheap canvas) ---------- */
export const Sky: React.FC<{ p: V3; s: [number, number]; top: string; bottom: string; stars?: number; t?: number; rot?: V3 }> = ({ p, s, top, bottom, stars = 0, t = 0, rot }) => (
  <CanvasPlane p={p} s={s} rot={rot} px={[256, 384]} draw={(c, W, H) => {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom); c.fillStyle = g; c.fillRect(0, 0, W, H);
    if (stars > 0) for (let i = 0; i < 90; i++) { const x = ((i * 7919) % 1000) / 1000 * W, y = ((i * 104729) % 1000) / 1000 * H * 0.75, tw = 0.5 + 0.5 * Math.sin(t * 3 + i); c.fillStyle = `rgba(255,255,235,${stars * (0.3 + 0.7 * tw)})`; c.beginPath(); c.arc(x, y, 0.7 + (i % 3) * 0.5, 0, 7); c.fill(); }
  }} />
);
export const Moon: React.FC<{ p: V3; r?: number; o?: number }> = ({ p, r = 2, o = 1 }) => (<><Ball p={p} r={r} color="#fff6c8" ink={0} /><Ball p={[p[0] - r * 0.3, p[1] + r * 0.2, p[2] + r * 0.8]} r={r * 0.22} color="#efe2a8" ink={0} /><Glow p={[p[0], p[1], p[2] + 0.5]} r={r * 3.2} color="rgba(255,250,210,1)" o={0.45 * o} /></>);

/* ---------- furniture ---------- */
export const Sofa: React.FC<{ p: V3; rotY?: number; color?: string; w?: number }> = ({ p, rotY = 0, color = "#3a6fd8", w = 4.2 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, 0.4, 0]} s={[w, 0.8, 1.6]} color={color} /><Box p={[0, 1.25, -0.62]} s={[w, 1.3, 0.36]} color={color} />
    <Box p={[-w / 2 + 0.2, 0.95, 0]} s={[0.4, 0.5, 1.6]} color={color} /><Box p={[w / 2 - 0.2, 0.95, 0]} s={[0.4, 0.5, 1.6]} color={color} />
    <Box p={[-w / 4 + 0.1, 0.88, 0.05]} s={[w / 2 - 0.5, 0.18, 1.3]} color={mixC(color, "#ffffff", 0.25)} line={2} /><Box p={[w / 4 - 0.1, 0.88, 0.05]} s={[w / 2 - 0.5, 0.18, 1.3]} color={mixC(color, "#ffffff", 0.25)} line={2} />
    <Box p={[-w / 2 + 0.75, 1.25, -0.3]} s={[0.7, 0.6, 0.25]} rot={[0, 0, 0.25]} color="#ffd23a" line={2} />
  </group>
);
export const Bed: React.FC<{ p: V3; rotY?: number; sheet?: string; w?: number; l?: number }> = ({ p, rotY = 0, sheet = "#ff8fb0", w = 3.4, l = 4.6 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, 0.35, 0]} s={[w, 0.7, l]} color="#8a5a32" /><Box p={[0, 0.85, 0.1]} s={[w - 0.1, 0.35, l - 0.3]} color={sheet} /><Box p={[0, 1.4, -l / 2]} s={[w, 2.0, 0.25]} color="#8a5a32" />
    <Box p={[0, 1.15, -l / 2 + 0.6]} s={[w * 0.7, 0.3, 0.7]} color="#ffffff" line={2} />
  </group>
);
export const Table: React.FC<{ p: V3; w?: number; d?: number; h?: number; top?: string; leg?: string }> = ({ p, w = 2.4, d = 1.4, h = 1.1, top = "#b5783f", leg = "#6b3f1f" }) => (
  <group position={p}><Box p={[0, h, 0]} s={[w, 0.14, d]} color={top} />{[-1, 1].map((sx) => [-1, 1].map((sz) => <Box key={sx + "," + sz} p={[sx * (w / 2 - 0.12), h / 2, sz * (d / 2 - 0.12)]} s={[0.12, h, 0.12]} color={leg} line={2} />))}</group>
);
// standing fan; spin = blade angle (radians)
export const StandFan: React.FC<{ p: V3; spin?: number; s?: number; rotY?: number }> = ({ p, spin = 0, s = 1, rotY = 0 }) => (
  <group position={p} scale={s} rotation={[0, rotY, 0]}>
    <Cyl p={[0, 0.06, 0]} rt={0.55} h={0.12} color="#e8eef8" /><Cyl p={[0, 1.2, 0]} rt={0.06} h={2.3} color="#c8d2e8" line={2} />
    <Box p={[0, 0.2, 0.32]} s={[0.5, 0.08, 0.14]} color="#7ec8ff" line={1} />
    <Cyl p={[0, 2.45, -0.18]} rt={0.2} rb={0.24} h={0.4} color="#e8eef8" rot={[Math.PI / 2, 0, 0]} />
    <group position={[0, 2.45, 0.08]} rotation={[0, 0, spin]}>{[0, 1, 2].map((i) => <Box key={i} p={[Math.cos(i * 2.094) * 0.36, Math.sin(i * 2.094) * 0.36, 0]} s={[0.62, 0.26, 0.03]} rot={[0, 0, i * 2.094]} color="#7ec8ff" line={2} />)}<Ball p={[0, 0, 0.04]} r={0.09} color="#e8eef8" ink={0.02} /></group>
    <mesh position={[0, 2.45, 0.1]}><torusGeometry args={[0.78, 0.035, 8, 40]} /><meshBasicMaterial color="#c8d2e8" /></mesh>
    <mesh position={[0, 2.45, 0.1]}><torusGeometry args={[0.78, 0.06, 8, 40]} /><meshBasicMaterial color={INK} side={THREE.BackSide} /></mesh>
  </group>
);
export const ACUnit: React.FC<{ p: V3; on?: boolean }> = ({ p, on }) => (
  <group position={p}>
    <Box p={[0, 0, 0]} s={[2.6, 0.85, 0.5]} color="#f6f7fb" /><Box p={[0, -0.32, 0.22]} s={[2.3, 0.08, 0.12]} color="#b9c2d6" line={2} />
    {[-0.12, 0.05].map((y) => <Box key={y} p={[0, y, 0.26]} s={[2.2, 0.03, 0.02]} color="#d4dae8" line={1} />)}
    <CanvasPlane p={[0.85, 0.2, 0.26]} s={[0.4, 0.18]} px={[80, 36]} draw={(c, W, H) => { c.fillStyle = on ? "#38e0ff" : "#2a2f3a"; c.fillRect(0, 0, W, H); if (on) { c.fillStyle = "#003"; c.font = "900 26px Inter"; c.fillText("16°", 14, 27); } }} />
  </group>
);
export const Fridge: React.FC<{ p: V3; door?: number; color?: string; h?: number; w?: number; children?: React.ReactNode; magnet?: string }> = ({ p, door = 0, color = "#e9f2ff", h = 4.2, w = 2.0, children, magnet }) => (
  <group position={p}>
    <Box p={[0, h / 2, -0.82]} s={[w, h, 0.16]} color={color} /><Box p={[-w / 2 + 0.08, h / 2, 0]} s={[0.16, h, 1.8]} color={color} /><Box p={[w / 2 - 0.08, h / 2, 0]} s={[0.16, h, 1.8]} color={color} />
    <Box p={[0, h - 0.08, 0]} s={[w, 0.16, 1.8]} color={color} /><Box p={[0, 0.12, 0]} s={[w, 0.24, 1.8]} color="#9aa6c0" />
    <Box p={[0, h / 2, -0.7]} s={[w - 0.34, h - 0.4, 0.04]} color="#cfe0f8" line={1} />
    {[1.2, 2.3, 3.3].map((y) => <Box key={y} p={[0, y, -0.1]} s={[w - 0.34, 0.05, 1.4]} color="#bfe6ff" line={2} />)}
    {children}
    <group position={[w / 2, 0, 0.9]} rotation={[0, door * 1.9, 0]}>
      <Box p={[-w / 2, h / 2, 0.08]} s={[w, h, 0.16]} color={color} /><Box p={[-w + 0.22, h * 0.55, 0.22]} s={[0.1, 1.2, 0.12]} color="#9aa6c0" line={2} />
      <Box p={[-w / 2, h * 0.62, 0.17]} s={[w, 0.04, 0.02]} color={INK} line={1} />
      {magnet ? <CanvasPlane p={[-w * 0.42, h * 0.8, 0.17]} s={[0.7, 0.8]} px={[140, 160]} frame={INK} draw={(c, W, H) => { c.fillStyle = "#fffaf0"; c.fillRect(0, 0, W, H); c.fillStyle = "#e23b3b"; c.fillRect(0, 0, W, 44); c.fillStyle = "#fff"; c.font = "900 30px Inter"; c.textAlign = "center"; c.fillText("HARI", W / 2, 33); c.fillStyle = INK; c.font = "900 90px Inter"; c.fillText(magnet, W / 2, 138); }} /> : null}
      <Box p={[-w / 2, h * 0.3, -0.05]} s={[w - 0.3, 0.06, 0.25]} color="#bfe6ff" line={1} />
    </group>
  </group>
);
export const TV: React.FC<{ p: V3; w?: number; rotY?: number; draw?: (c: CanvasRenderingContext2D, W: number, H: number) => void }> = ({ p, w = 3.2, rotY = 0, draw }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, 0, 0]} s={[w, w * 0.6, 0.18]} color="#151826" />
    <CanvasPlane p={[0, 0, 0.1]} s={[w * 0.92, w * 0.52]} px={[320, 180]} draw={draw ?? ((c, W, H) => { const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#20263a"); g.addColorStop(0.5, "#0b0e18"); g.addColorStop(1, "#1a1f30"); c.fillStyle = g; c.fillRect(0, 0, W, H); c.fillStyle = "rgba(255,255,255,.08)"; c.beginPath(); c.moveTo(W * 0.1, 0); c.lineTo(W * 0.3, 0); c.lineTo(W * 0.15, H); c.lineTo(0, H); c.fill(); })} />
    <Box p={[0, -w * 0.33, 0]} s={[0.3, 0.1, 0.3]} color="#151826" line={2} />
  </group>
);
export const TVCabinet: React.FC<{ p: V3; w?: number }> = ({ p, w = 4 }) => (<group position={p}><Box p={[0, 0.5, 0]} s={[w, 1.0, 1.2]} color="#8a5a32" /><Box p={[-w / 4, 0.5, 0.61]} s={[w / 2 - 0.2, 0.7, 0.02]} color="#6b3f1f" line={2} /><Box p={[w / 4, 0.5, 0.61]} s={[w / 2 - 0.2, 0.7, 0.02]} color="#6b3f1f" line={2} /></group>);
export const Router: React.FC<{ p: V3; ok?: boolean; blink?: number; s?: number }> = ({ p, ok, blink = 1, s = 1 }) => (
  <group position={p} scale={s}>
    <Box p={[0, 0.12, 0]} s={[1.0, 0.24, 0.7]} color="#f2f4fa" />{[-0.38, 0.38].map((x) => <Cyl key={x} p={[x, 0.6, -0.25]} rt={0.04} h={0.8} color="#2b3350" line={2} rot={[0, 0, x * 0.4]} />)}
    {[-0.3, -0.1, 0.1, 0.3].map((x, i) => <Ball key={x} p={[x, 0.16, 0.36]} r={0.04} color={ok ? "#2fd46a" : i === 0 && blink > 0.5 ? "#ff2b3b" : "#3a3f50"} ink={0.01} />)}
  </group>
);
export const Bulb: React.FC<{ p: V3; on?: number; cord?: number }> = ({ p, on = 0, cord = 2 }) => (
  <group position={p}>
    <Cyl p={[0, cord / 2 + 0.3, 0]} rt={0.025} h={cord} color={INK} line={1} /><Cyl p={[0, 0.25, 0]} rt={0.12} h={0.2} color="#9aa0b8" line={2} />
    <Ball p={[0, 0, 0]} r={0.26} color={mixC("#d8dde8", "#fff6c0", on)} ink={0.03} />
    {on > 0 ? <Glow p={[0, 0, 0.1]} r={2.6} color="rgba(255,236,160,1)" o={0.7 * on} /> : null}
  </group>
);
export const Candle: React.FC<{ p: V3; t: number; s?: number; lit?: number }> = ({ p, t, s = 1, lit = 1 }) => {
  const fl = 1 + 0.12 * Math.sin(t * 23) + 0.08 * Math.sin(t * 37);
  return (<group position={p} scale={s}>
    <Cyl p={[0, 0.03, 0]} rt={0.28} h={0.06} color="#c9a46a" line={2} /><Cyl p={[0, 0.32, 0]} rt={0.09} h={0.55} color="#fff8e8" line={2} />
    {lit > 0 ? <><Ball p={[0, 0.68, 0]} r={0.07 * lit} s={[1, 1.9 * fl, 1]} color="#ffb020" ink={0.012} /><Ball p={[0, 0.66, 0.02]} r={0.035 * lit} s={[1, 1.6, 1]} color="#fff6b0" ink={0} /><Glow p={[0, 0.7, 0.05]} r={1.9 * fl} color="rgba(255,190,90,1)" o={0.6 * lit} /></> : null}
  </group>);
};
// prepaid electricity meter (token meter)
export const TokenMeter: React.FC<{ p: V3; kwh: number; warn?: number; s?: number }> = ({ p, kwh, warn = 0, s = 1 }) => (
  <group position={p} scale={s}>
    <Box p={[0, 0, 0]} s={[1.3, 1.8, 0.3]} color="#f2f2ea" />
    <CanvasPlane p={[0, 0.35, 0.16]} s={[1.0, 0.5]} px={[300, 150]} frame={INK} draw={(c, W, H) => { c.fillStyle = warn > 0.5 ? "#ff4040" : "#8fe070"; c.fillRect(0, 0, W, H); c.fillStyle = "#102010"; c.font = "900 84px 'Courier New', monospace"; c.textAlign = "right"; c.textBaseline = "middle"; c.fillText(kwh.toFixed(2), W - 18, H * 0.48); c.font = "900 30px Inter"; c.textAlign = "left"; c.fillText("kWh", 12, H - 18); }} />
    <CanvasPlane p={[0, -0.42, 0.16]} s={[1.0, 0.75]} px={[200, 150]} draw={(c, W, H) => { c.fillStyle = "#f2f2ea"; c.fillRect(0, 0, W, H); for (let i = 0; i < 12; i++) { const x = 12 + (i % 4) * 47, y = 8 + Math.floor(i / 4) * 47; c.fillStyle = "#d0d4dc"; c.fillRect(x, y, 38, 38); c.strokeStyle = INK; c.lineWidth = 4; c.strokeRect(x, y, 38, 38); c.fillStyle = INK; c.font = "900 24px Inter"; c.textAlign = "center"; c.fillText(String("123456789*0#"[i]), x + 19, y + 28); } }} />
    <Ball p={[0.48, 0.75, 0.16]} r={0.07} color={warn > 0 && warn % 1 > 0.5 ? "#ff2020" : "#4a1010"} ink={0.015} />
    {warn > 0 && warn % 1 > 0.5 ? <Glow p={[0.48, 0.75, 0.25]} r={0.5} color="rgba(255,40,40,1)" o={0.8} /> : null}
  </group>
);
export const Phone: React.FC<{ p: V3; rot?: V3; s?: number; draw?: (c: CanvasRenderingContext2D, W: number, H: number) => void }> = ({ p, rot, s = 1, draw }) => (
  <group position={p} rotation={rot} scale={s}>
    <Box p={[0, 0, 0]} s={[0.5, 0.95, 0.07]} color="#1b1f33" line={2} />
    <CanvasPlane p={[0, 0, 0.04]} s={[0.44, 0.86]} px={[110, 216]} draw={draw ?? ((c, W, H) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#4a8cff"); g.addColorStop(1, "#a0d8ff"); c.fillStyle = g; c.fillRect(0, 0, W, H); c.fillStyle = "rgba(255,255,255,.85)"; c.fillRect(12, 24, W - 24, 18); c.fillRect(12, 52, W - 40, 12); c.beginPath(); c.arc(W / 2, H - 22, 9, 0, 7); c.fill(); })} />
  </group>
);
export const Socket: React.FC<{ p: V3; rotY?: number }> = ({ p, rotY = 0 }) => (<group position={p} rotation={[0, rotY, 0]}><Box p={[0, 0, 0]} s={[0.42, 0.42, 0.06]} color="#f6f6f0" line={2} /><Ball p={[-0.08, 0, 0.04]} r={0.035} color={INK} ink={0} /><Ball p={[0.08, 0, 0.04]} r={0.035} color={INK} ink={0} /></group>);
export const Plug: React.FC<{ p: V3; rot?: V3 }> = ({ p, rot }) => (<group position={p} rotation={rot}><Box p={[0, 0, 0]} s={[0.22, 0.3, 0.16]} color="#2b3350" line={2} /><Cyl p={[-0.05, 0.2, 0]} rt={0.02} h={0.14} color="#d8d8e0" line={1} /><Cyl p={[0.05, 0.2, 0]} rt={0.02} h={0.14} color="#d8d8e0" line={1} /></group>);
// cable as a sagging polyline of thin cylinders between two points
export const Cable: React.FC<{ a: V3; b: V3; sag?: number; color?: string; n?: number }> = ({ a, b, sag = 0.6, color = "#1b1f33", n = 8 }) => {
  const pts: V3[] = Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - Math.sin(u * Math.PI) * sag, lerp(a[2], b[2], u)]; });
  return <>{pts.slice(1).map((q, i) => { const p0 = pts[i], d = new THREE.Vector3(q[0] - p0[0], q[1] - p0[1], q[2] - p0[2]); const L = d.length(); const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); const e = new THREE.Euler().setFromQuaternion(quat); return <Cyl key={i} p={[(q[0] + p0[0]) / 2, (q[1] + p0[1]) / 2, (q[2] + p0[2]) / 2]} rt={0.03} h={L} color={color} line={1} rot={[e.x, e.y, e.z]} />; })}</>;
};

/* ---------- village / outdoor ---------- */
export const Tree: React.FC<{ p: V3; s?: number; leaf?: string }> = ({ p, s = 1, leaf = "#36a85a" }) => (
  <group position={p} scale={s}><Cyl p={[0, 1.6, 0]} rt={0.25} rb={0.38} h={3.2} color="#7a4a2a" /><Ball p={[0, 3.9, 0]} r={1.5} color={leaf} /><Ball p={[-1.0, 3.3, 0.3]} r={1.0} color={mixC(leaf, "#ffffff", 0.12)} /><Ball p={[1.0, 3.4, -0.2]} r={1.1} color={mixC(leaf, "#000000", 0.12)} /></group>
);
export const Palm: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}><Cyl p={[0, 2.5, 0]} rt={0.18} rb={0.3} h={5} color="#9a6a3a" rot={[0, 0, 0.08]} />{Array.from({ length: 6 }, (_, i) => <Box key={i} p={[Math.cos(i * 1.05) * 1.1, 5.0, Math.sin(i * 1.05) * 1.1]} s={[2.4, 0.08, 0.6]} rot={[0, -i * 1.05, -0.45]} color="#2f9e4a" line={2} />)}</group>
);
export const Fence: React.FC<{ p: V3; n?: number; gap?: number; rotY?: number; color?: string; h?: number }> = ({ p, n = 8, gap = 0.7, rotY = 0, color = "#f2e6c8", h = 1.4 }) => (
  <group position={p} rotation={[0, rotY, 0]}>{Array.from({ length: n }, (_, i) => <Box key={i} p={[i * gap, h / 2, 0]} s={[0.18, h, 0.1]} color={color} line={2} />)}<Box p={[(n - 1) * gap / 2, h * 0.7, -0.06]} s={[(n - 1) * gap + 0.3, 0.12, 0.06]} color={color} line={2} /><Box p={[(n - 1) * gap / 2, h * 0.3, -0.06]} s={[(n - 1) * gap + 0.3, 0.12, 0.06]} color={color} line={2} /></group>
);
// simple house front (box + pitched roof) facing +z
export const House: React.FC<{ p: V3; w?: number; h?: number; d?: number; wall?: string; roof?: string; lit?: number; rotY?: number; door?: string }> = ({ p, w = 6, h = 3.6, d = 5, wall = "#f2d49a", roof = "#c0443a", lit = 0, rotY = 0, door = "#7a4a2a" }) => {
  const roofGeo = useMemo(() => { const s = new THREE.Shape([new THREE.Vector2(-w / 2 - 0.4, 0), new THREE.Vector2(0, h * 0.55), new THREE.Vector2(w / 2 + 0.4, 0)]); const g = new THREE.ExtrudeGeometry(s, { depth: d + 0.6, bevelEnabled: false }); g.translate(0, 0, -(d + 0.6) / 2); return g; }, [w, h, d]);
  const win = lit > 0 ? mixC("#28304a", "#ffd770", lit) : "#28304a";
  return (<group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, h / 2, 0]} s={[w, h, d]} color={wall} />
    <group position={[0, h, 0]}><mesh geometry={roofGeo}><meshToonMaterial color={roof} /></mesh></group>
    <Box p={[0, h + 0.02, 0]} s={[w + 0.8, 0.1, d + 0.6]} color={mixC(roof, "#000000", 0.3)} line={3} />
    <Box p={[-w * 0.18, h * 0.36, d / 2 + 0.03]} s={[1.1, h * 0.72, 0.06]} color={door} line={3} />
    {[-w * 0.38, w * 0.22].map((x) => <React.Fragment key={x}><Box p={[x, h * 0.55, d / 2 + 0.03]} s={[1.2, 1.0, 0.05]} color={win} line={3} /><Box p={[x, h * 0.55, d / 2 + 0.06]} s={[0.06, 1.0, 0.03]} color={INK} line={1} />{lit > 0.3 ? <Glow p={[x, h * 0.55, d / 2 + 0.5]} r={1.6} color="rgba(255,210,120,1)" o={0.45 * lit} /> : null}</React.Fragment>)}
  </group>);
};
export const Well: React.FC<{ p: V3; rope?: number; bucketUp?: number }> = ({ p, rope = 0, bucketUp = 0 }) => (
  <group position={p}>
    <Cyl p={[0, 0.55, 0]} rt={1.1} h={1.1} color="#a8a0a0" /><Cyl p={[0, 1.12, 0]} rt={0.85} h={0.06} color="#1a3a6a" line={1} />
    {[-1.05, 1.05].map((x) => <Box key={x} p={[x, 1.9, 0]} s={[0.18, 2.6, 0.18]} color="#7a4a2a" line={2} />)}
    <Box p={[0, 3.25, 0]} s={[2.8, 0.12, 1.6]} rot={[0, 0, 0]} color="#c0443a" />
    <group position={[0, 2.7, 0]} rotation={[rope, 0, 0]}><Cyl p={[0, 0, 0]} rt={0.12} h={2.1} color="#9a6a3a" rot={[0, 0, Math.PI / 2]} /></group>
    <Cyl p={[0, 2.7 - (1 - bucketUp) * 1.5 / 2 - 0.05, 0]} rt={0.02} h={(1 - bucketUp) * 1.5 + 0.1} color="#e0c890" line={1} />
    <Cyl p={[0, 2.7 - (1 - bucketUp) * 1.5 - 0.3, 0]} rt={0.24} rb={0.2} h={0.4} color="#2f6bff" line={2} />
  </group>
);
export const Bucket: React.FC<{ p: V3; rot?: V3; s?: number; color?: string }> = ({ p, rot, s = 1, color = "#2f6bff" }) => (<group position={p} rotation={rot} scale={s}><Cyl p={[0, 0, 0]} rt={0.26} rb={0.21} h={0.42} color={color} line={2} /><Cyl p={[0, 0.2, 0]} rt={0.22} h={0.02} color="#6ac8ff" line={0} /></group>);
export const Basin: React.FC<{ p: V3; s?: number }> = ({ p, s = 1 }) => (<group position={p} scale={s}><Cyl p={[0, 0.22, 0]} rt={0.9} rb={0.7} h={0.44} color="#e5483f" /><Cyl p={[0, 0.4, 0]} rt={0.82} h={0.04} color="#9fd8ff" line={1} /><Box p={[0.2, 0.44, 0.1]} s={[0.8, 0.06, 0.5]} rot={[0, 0.5, 0]} color="#ffd23a" line={1} /></group>);
// wood fire stove: stones + logs + flickering flames + pot
export const FireStove: React.FC<{ p: V3; t: number; pot?: boolean; o?: number }> = ({ p, t, pot = true, o = 1 }) => (
  <group position={p}>
    {Array.from({ length: 7 }, (_, i) => <Ball key={i} p={[Math.cos(i * 0.9) * 0.75, 0.2, Math.sin(i * 0.9) * 0.55]} r={0.24} color="#8a8690" ink={0.03} />)}
    {[0.5, -0.5, 1.6].map((r, i) => <Cyl key={i} p={[0, 0.2, 0]} rt={0.08} h={1.6} color="#6b3f1f" line={2} rot={[Math.PI / 2, r, 0.2]} />)}
    {[0, 1, 2, 3].map((i) => { const fl = 1 + 0.25 * Math.sin(t * (13 + i * 3) + i); return <Ball key={"f" + i} p={[(i - 1.5) * 0.16, 0.45 + 0.1 * fl, 0.05]} r={0.17 * o} s={[1, 2.1 * fl, 1]} color={i % 2 ? "#ffb020" : "#ff5a1f"} ink={0.015} />; })}
    <Glow p={[0, 0.8, 0.3]} r={2.4} color="rgba(255,150,60,1)" o={0.55 * o} />
    {pot ? <><Cyl p={[0, 1.05, 0]} rt={0.55} rb={0.45} h={0.7} color="#2b2b38" /><Cyl p={[0, 1.42, 0]} rt={0.58} h={0.08} color="#3a3a4a" line={2} /></> : null}
  </group>
);
export const Steam: React.FC<{ p: V3; t: number; n?: number; o?: number }> = ({ p, t, n = 5, o = 0.7 }) => (
  <>{Array.from({ length: n }, (_, i) => { const u = (t * 0.6 + i / n) % 1; return <Glow key={i} p={[p[0] + Math.sin(u * 6 + i) * 0.25, p[1] + u * 2.2, p[2]]} r={0.3 + u * 0.5} color="rgba(255,255,255,1)" o={o * (1 - u) * 0.8} />; })}</>
);
export const Clothesline: React.FC<{ p: V3; w?: number; t: number; cols?: string[] }> = ({ p, w = 5, t, cols = ["#ff4fa0", "#2f8cff", "#ffd23a", "#2fd46a"] }) => (
  <group position={p}>
    {[-w / 2, w / 2].map((x) => <Cyl key={x} p={[x, 1.4, 0]} rt={0.06} h={2.8} color="#7a4a2a" line={2} />)}<Cyl p={[0, 2.7, 0]} rt={0.015} h={w} color="#f2f2f2" line={1} rot={[0, 0, Math.PI / 2]} />
    {cols.map((c, i) => <Box key={i} p={[-w / 2 + (i + 0.7) * w / (cols.length + 0.4), 2.25, 0]} s={[0.85, 0.9, 0.04]} rot={[Math.sin(t * 2 + i) * 0.15, 0, 0]} color={c} line={2} />)}
  </group>
);
export const Broom: React.FC<{ p: V3; rot?: V3 }> = ({ p, rot }) => (<group position={p} rotation={rot}><Cyl p={[0, 0.9, 0]} rt={0.04} h={1.8} color="#c9a46a" line={2} /><Cyl p={[0, 0.05, 0]} rt={0.36} rb={0.12} h={0.4} color="#e0c070" line={2} rot={[0, 0, Math.PI]} /></group>);
export const Leaves: React.FC<{ p: V3; n?: number; spread?: number; push?: number }> = ({ p, n = 10, spread = 2, push = 0 }) => (
  <>{Array.from({ length: n }, (_, i) => <Box key={i} p={[p[0] + Math.sin(i * 7.3) * spread + push * (0.5 + (i % 3) * 0.3), p[1] + 0.03, p[2] + Math.cos(i * 3.1) * spread * 0.5]} s={[0.22, 0.03, 0.14]} rot={[0, i, 0]} color={["#d9a23a", "#c0643a", "#9ab83a"][i % 3]} line={1} />)}</>
);
export const Mat: React.FC<{ p: V3; s: [number, number]; a?: string; b?: string }> = ({ p, s, a = "#e8c070", b = "#c0443a" }) => (
  <CanvasPlane p={[p[0], p[1] + 0.02, p[2]]} rot={[-Math.PI / 2, 0, 0]} s={s} px={[256, Math.round(256 * s[1] / s[0])]} draw={(c, W, H) => { c.fillStyle = a; c.fillRect(0, 0, W, H); c.strokeStyle = "rgba(120,70,20,.4)"; c.lineWidth = 3; for (let x = 0; x < W; x += 12) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } c.strokeStyle = b; c.lineWidth = 12; c.strokeRect(10, 10, W - 20, H - 20); c.strokeStyle = INK; c.lineWidth = 5; c.strokeRect(2, 2, W - 4, H - 4); }} />
);
export const Bowl: React.FC<{ p: V3; food?: string; s?: number }> = ({ p, food = "#fff6e0", s = 1 }) => (<group position={p} scale={s}><Cyl p={[0, 0.12, 0]} rt={0.34} rb={0.2} h={0.24} color="#ffffff" line={2} /><Ball p={[0, 0.22, 0]} r={0.28} s={[1, 0.45, 1]} color={food} ink={0.015} /></group>);
export const Banner: React.FC<{ p: V3; w: number; h: number; k: number; color?: string; crest?: string }> = ({ p, w, h, k, color = "#8a1a2e", crest = "#ffc23a" }) => (
  <group position={p}>
    <Cyl p={[0, 0, 0.05]} rt={0.08} h={w + 0.3} color={crest} rot={[0, 0, Math.PI / 2]} line={2} />
    {k > 0.01 ? <CanvasPlane p={[0, -h * k / 2, 0]} s={[w, h * k]} px={[160, Math.max(4, Math.round(320 * k))]} draw={(c, W, H) => { c.fillStyle = color; c.fillRect(0, 0, W, H); c.fillStyle = crest; c.fillRect(10, 0, 8, H); c.fillRect(W - 18, 0, 8, H); const hh = 320; const cy = hh * 0.45 - (hh - H); c.beginPath(); c.moveTo(W / 2, cy - 50); c.lineTo(W / 2 + 40, cy - 10); c.lineTo(W / 2 + 26, cy + 50); c.lineTo(W / 2 - 26, cy + 50); c.lineTo(W / 2 - 40, cy - 10); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 5; c.stroke(); c.strokeRect(2, 0, W - 4, H - 2); }} /> : null}
  </group>
);
export const Flag: React.FC<{ p: V3; h?: number; up: number; t: number; color?: string }> = ({ p, h = 5, up, t, color = "#e5233a" }) => (
  <group position={p}><Cyl p={[0, h / 2, 0]} rt={0.06} h={h} color="#c9a46a" line={2} /><Ball p={[0, h + 0.1, 0]} r={0.12} color="#ffc23a" ink={0.02} />
    <CanvasPlane p={[0.7, lerp(0.8, h - 0.5, up), 0]} s={[1.4, 0.9]} px={[140, 90]} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.beginPath(); for (let x = 0; x <= W; x += 10) { const y = Math.sin(x * 0.06 - t * 8) * 6 * (x / W); x ? c.lineTo(x, 6 + y) : c.moveTo(x, 6); } for (let x = W; x >= 0; x -= 10) { const y = Math.sin(x * 0.06 - t * 8) * 6 * (x / W); c.lineTo(x, H - 6 + y); } c.closePath(); c.fillStyle = color; c.fill(); c.strokeStyle = INK; c.lineWidth = 4; c.stroke(); c.fillStyle = "#ffc23a"; c.beginPath(); c.arc(W * 0.45, H / 2, 14, 0, 7); c.fill(); }} />
  </group>
);

/* ---------- 2D critters drawn in the puppet style (camera-facing sprites) ---------- */
type Draw = (c: CanvasRenderingContext2D, W: number, H: number) => void;
const Sprite: React.FC<{ p: V3; s: number; draw: Draw; rot?: V3; face?: boolean }> = ({ p, s, draw, rot, face = true }) => <CanvasPlane p={p} s={[s, s]} px={[256, 256]} face={face && !rot} rot={rot} draw={(c, W, H) => { c.clearRect(0, 0, W, H); c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = INK; draw(c, W, H); }} />;
const eyes = (c: CanvasRenderingContext2D, x: number, y: number, r: number, gap: number, look = 0) => { for (const s of [-1, 1]) { c.fillStyle = "#fff"; c.lineWidth = 5; c.beginPath(); c.arc(x + s * gap, y, r, 0, 7); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(x + s * gap + look * r * 0.35, y + 1, r * 0.42, 0, 7); c.fill(); } };
export const Frog: React.FC<{ p: V3; s?: number; puff?: number; t: number }> = ({ p, s = 1.6, puff = 0, t }) => <Sprite p={p} s={s} draw={(c, W, H) => {
  const b = Math.abs(Math.sin(t * 4)) * 4; c.fillStyle = "#3fbf5a"; c.lineWidth = 8;
  c.beginPath(); c.ellipse(W / 2, H * 0.66 - b, W * 0.36, H * 0.24, 0, 0, 7); c.fill(); c.stroke();
  if (puff > 0) { c.fillStyle = "#ffe9b0"; c.beginPath(); c.ellipse(W / 2, H * 0.74 - b, W * 0.18 * (0.5 + puff), H * 0.12 * (0.5 + puff), 0, 0, 7); c.fill(); c.stroke(); }
  c.fillStyle = "#3fbf5a"; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(W / 2 + sx * W * 0.3, H * 0.88, W * 0.12, H * 0.05, 0, 0, 7); c.fill(); c.stroke(); }
  c.fillStyle = "#3fbf5a"; for (const sx of [-1, 1]) { c.beginPath(); c.arc(W / 2 + sx * W * 0.16, H * 0.42 - b, W * 0.12, 0, 7); c.fill(); c.stroke(); }
  eyes(c, W / 2, H * 0.42 - b, W * 0.08, W * 0.16); c.lineWidth = 6; c.beginPath(); c.arc(W / 2, H * 0.58 - b, W * 0.14, 0.2, Math.PI - 0.2); c.stroke();
}} />;
export const Cricket: React.FC<{ p: V3; s?: number; t: number; play?: number }> = ({ p, s = 1.2, t, play = 0 }) => <Sprite p={p} s={s} draw={(c, W, H) => {
  c.lineWidth = 6; c.fillStyle = "#6b4a1f"; c.beginPath(); c.ellipse(W * 0.5, H * 0.62, W * 0.3, H * 0.13, -0.1, 0, 7); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(W * 0.6, H * 0.6); c.lineTo(W * 0.8, H * 0.38); c.lineTo(W * 0.92, H * 0.78); c.stroke();
  c.beginPath(); c.moveTo(W * 0.35, H * 0.7); c.lineTo(W * 0.3, H * 0.84); c.moveTo(W * 0.5, H * 0.72); c.lineTo(W * 0.48, H * 0.86); c.stroke();
  c.fillStyle = "#7a5a2a"; c.beginPath(); c.arc(W * 0.24, H * 0.52, W * 0.11, 0, 7); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(W * 0.2, H * 0.44); c.quadraticCurveTo(W * 0.1, H * 0.2, W * 0.3, H * 0.1); c.moveTo(W * 0.26, H * 0.43); c.quadraticCurveTo(W * 0.3, H * 0.2, W * 0.45, H * 0.14); c.stroke();
  eyes(c, W * 0.24, H * 0.5, W * 0.045, W * 0.05);
  if (play > 0) { const a = Math.sin(t * 20) * 0.3; c.save(); c.translate(W * 0.45, H * 0.45); c.fillStyle = "#c0643a"; c.beginPath(); c.ellipse(0, 0, W * 0.07, H * 0.11, 0.6, 0, 7); c.fill(); c.stroke(); c.rotate(a - 0.9); c.lineWidth = 4; c.beginPath(); c.moveTo(-W * 0.12, 0); c.lineTo(W * 0.14, 0); c.stroke(); c.restore(); }
}} />;
export const Mosquito: React.FC<{ p: V3; s?: number; t: number; mic?: boolean }> = ({ p, s = 1.2, t, mic }) => <Sprite p={p} s={s} draw={(c, W, H) => {
  const fl = Math.sin(t * 60) * 0.5; c.fillStyle = "rgba(220,240,255,.75)"; c.lineWidth = 4;
  for (const sx of [-1, 1]) { c.save(); c.translate(W / 2, H * 0.42); c.rotate(sx * (0.7 + fl)); c.beginPath(); c.ellipse(sx * W * 0.16, -H * 0.08, W * 0.17, H * 0.07, 0, 0, 7); c.fill(); c.stroke(); c.restore(); }
  c.lineWidth = 5; c.fillStyle = "#3a3a4a"; c.beginPath(); c.ellipse(W / 2, H * 0.55, W * 0.08, H * 0.16, 0, 0, 7); c.fill(); c.stroke();
  for (let i = 0; i < 3; i++) for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(W / 2, H * (0.5 + i * 0.06)); c.lineTo(W / 2 + sx * W * 0.26, H * (0.68 + i * 0.08)); c.stroke(); }
  c.fillStyle = "#3a3a4a"; c.beginPath(); c.arc(W / 2, H * 0.34, W * 0.08, 0, 7); c.fill(); c.stroke(); eyes(c, W / 2, H * 0.33, W * 0.04, W * 0.045);
  c.beginPath(); c.moveTo(W / 2, H * 0.4); c.lineTo(W * 0.5, H * 0.52); c.stroke();
  if (mic) { c.fillStyle = "#9aa0b8"; c.beginPath(); c.arc(W * 0.72, H * 0.3, W * 0.05, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(W * 0.7, H * 0.34); c.lineTo(W * 0.6, H * 0.48); c.stroke(); }
}} />;
export const Gecko: React.FC<{ p: V3; rot: V3; s?: number; t: number }> = ({ p, rot, s = 1.2, t }) => <Sprite p={p} s={s} rot={rot} draw={(c, W, H) => {
  const w = Math.sin(t * 9) * 0.25; c.fillStyle = "#c8b98a"; c.lineWidth = 6;
  c.beginPath(); c.moveTo(W / 2, H * 0.62); c.quadraticCurveTo(W / 2 + Math.sin(w) * 60, H * 0.82, W / 2 - 20, H * 0.97); c.stroke();
  for (const [y, sx] of [[0.38, -1], [0.38, 1], [0.6, -1], [0.6, 1]]) { const k = (sx > 0 ? 1 : -1) * (y < 0.5 ? w : -w); c.beginPath(); c.moveTo(W / 2, H * y); c.lineTo(W / 2 + sx * W * 0.2, H * (y - 0.06 + k * 0.1)); c.stroke(); c.beginPath(); c.arc(W / 2 + sx * W * 0.2, H * (y - 0.06 + k * 0.1), 6, 0, 7); c.fill(); c.stroke(); }
  c.beginPath(); c.ellipse(W / 2, H * 0.5, W * 0.08, H * 0.16, 0, 0, 7); c.fill(); c.stroke();
  c.beginPath(); c.ellipse(W / 2, H * 0.27, W * 0.08, H * 0.08, 0, 0, 7); c.fill(); c.stroke(); eyes(c, W / 2, H * 0.24, W * 0.03, W * 0.05);
}} />;
export const Note: React.FC<{ p: V3; s?: number; color?: string; o?: number; two?: boolean }> = ({ p, s = 0.8, color = "#ffd23a", o = 1, two }) => <Sprite p={p} s={s} draw={(c, W, H) => { c.globalAlpha = o; c.fillStyle = color; c.lineWidth = 10; c.font = `900 ${W * 0.8}px Inter, Arial`; c.textAlign = "center"; c.textBaseline = "middle"; c.strokeText(two ? "♫" : "♪", W / 2, H / 2); c.fillText(two ? "♫" : "♪", W / 2, H / 2); }} />;
export const Cat: React.FC<{ p: V3; s?: number; t: number; sleep?: boolean }> = ({ p, s = 1.2, t, sleep }) => <Sprite p={p} s={s} draw={(c, W, H) => {
  c.fillStyle = "#ff9a3a"; c.lineWidth = 7; const br = Math.sin(t * 2) * 3;
  c.beginPath(); c.ellipse(W / 2, H * 0.72 - br, W * 0.36, H * 0.18 + br, 0, 0, 7); c.fill(); c.stroke();
  c.beginPath(); c.arc(W * 0.28, H * 0.6, W * 0.16, 0, 7); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(W * 0.16, H * 0.52); c.lineTo(W * 0.16, H * 0.36); c.lineTo(W * 0.26, H * 0.46); c.moveTo(W * 0.32, H * 0.45); c.lineTo(W * 0.4, H * 0.34); c.lineTo(W * 0.42, H * 0.5); c.fill(); c.stroke();
  c.lineWidth = 5; if (sleep) { c.beginPath(); c.arc(W * 0.22, H * 0.6, 10, 0.2, Math.PI - 0.2); c.moveTo(W * 0.38, H * 0.6); c.arc(W * 0.34, H * 0.6, 10, 0.2, Math.PI - 0.2); c.stroke(); c.fillStyle = "#fff"; c.font = "900 44px Inter"; c.fillText("z", W * 0.5, H * 0.3 - (t * 20) % 30); } else eyes(c, W * 0.28, H * 0.58, 10, 18);
  c.lineWidth = 7; c.beginPath(); c.moveTo(W * 0.85, H * 0.75); c.quadraticCurveTo(W * 0.98, H * 0.5 + br * 3, W * 0.88, H * 0.42); c.stroke();
}} />;
export const Bolt: React.FC<{ p: V3; s?: number; mood?: "sad" | "happy"; o?: number }> = ({ p, s = 1.6, mood = "sad", o = 1 }) => <Sprite p={p} s={s} draw={(c, W, H) => {
  c.globalAlpha = o; c.fillStyle = "#ffd23a"; c.lineWidth = 9; c.beginPath(); c.moveTo(W * 0.58, H * 0.04); c.lineTo(W * 0.24, H * 0.56); c.lineTo(W * 0.48, H * 0.56); c.lineTo(W * 0.36, H * 0.96); c.lineTo(W * 0.78, H * 0.4); c.lineTo(W * 0.52, H * 0.4); c.closePath(); c.fill(); c.stroke();
  eyes(c, W * 0.5, H * 0.33, W * 0.045, W * 0.06); c.lineWidth = 5; c.beginPath(); if (mood === "sad") c.arc(W * 0.5, H * 0.5, W * 0.06, Math.PI + 0.4, -0.4); else c.arc(W * 0.5, H * 0.42, W * 0.06, 0.3, Math.PI - 0.3); c.stroke();
}} />;
// confetti burst from a point (ballistic, spinning), t relative to burst
export const Confetti: React.FC<{ p: V3; dt: number; n?: number; spread?: number }> = ({ p, dt, n = 36, spread = 3 }) => {
  if (dt < 0) return null; const cols = ["#ff3b6b", "#ffd23a", "#2fd46a", "#2f8cff", "#b44dff", "#ff8a1c"];
  return <>{Array.from({ length: n }, (_, i) => { const a = i * 2.39996, v = 3 + (i % 5) * 0.9, vx = Math.cos(a) * spread * 0.6, vz = Math.sin(a) * spread * 0.3, vy = v + 2; const tt = Math.min(dt, 3); const drag = (1 - Math.exp(-tt * 1.8)) / 1.8; const y = p[1] + vy * drag - 3.2 * tt * tt * 0.5 + Math.sin(tt * 6 + i) * 0.1; if (y < 0.02) return null; return <mesh key={i} position={[p[0] + vx * drag, y, p[2] + vz * drag]} rotation={[tt * 7 + i, tt * 5, i]}><planeGeometry args={[0.16, 0.24]} /><meshBasicMaterial color={cols[i % cols.length]} side={THREE.DoubleSide} /></mesh>; })}</>;
};
// oven front panel framing an opening (room inside the oven); opening w x h centred at (0, h/2+base)
export const OvenFront: React.FC<{ p: V3; w: number; h: number; heat: number; temp: number }> = ({ p, w, h, heat, temp }) => {
  const B = 2.2, T = 3.6;
  return (<group position={p}>
    <Box p={[-(w / 2 + B / 2), h / 2, 0]} s={[B, h + 2 * B + T, 0.8]} color="#2b2e3a" /><Box p={[w / 2 + B / 2, h / 2, 0]} s={[B, h + 2 * B + T, 0.8]} color="#2b2e3a" />
    <Box p={[0, -B / 2, 0]} s={[w, B, 0.8]} color="#2b2e3a" /><Box p={[0, h + (B + T) / 2, 0]} s={[w, B + T, 0.8]} color="#2b2e3a" />
    <Box p={[0, h + 0.15, 0.45]} s={[w + 0.4, 0.3, 0.2]} color="#9aa0b8" line={3} /><Box p={[0, -0.15, 0.45]} s={[w + 0.4, 0.3, 0.2]} color="#9aa0b8" line={3} />
    <Box p={[0, h + B * 0.7, 0.6]} s={[w * 0.8, 0.35, 0.35]} color="#c8ccd8" line={3} />
    {[-0.36, -0.18, 0.18, 0.36].map((k, i) => <group key={k} position={[k * w, h + B + T * 0.5, 0.45]} rotation={[Math.PI / 2, 0, 0]}><Cyl p={[0, 0, 0]} rt={0.7} h={0.4} color="#c8ccd8" /><Box p={[0, -0.25, 0.3]} s={[0.15, 0.1, 0.6]} rot={[0, heat * (i + 1) * 0.8, 0]} color="#e5233a" line={2} /></group>)}
    <CanvasPlane p={[0, h + B + T * 0.5, 0.42]} s={[3.2, 1.4]} px={[320, 140]} frame={INK} draw={(c, W, H) => { c.fillStyle = "#120808"; c.fillRect(0, 0, W, H); c.fillStyle = "#ff3b1f"; c.font = "900 96px 'Courier New', monospace"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(`${Math.round(temp)}°`, W / 2, H / 2 + 4); }} />
    <Glow p={[0, h + B + T * 0.5, 0.9]} r={2.6} color="rgba(255,60,20,1)" o={0.5 * heat} />
  </group>);
};
// little wall calendar with a page that can tear off (k 0..1 falls)
export const TearCal: React.FC<{ p: V3; day: number; next?: number; k?: number; s?: number; label?: string }> = ({ p, day, next, k = 0, s = 1, label = "HARI" }) => {
  const page = (d: number): Draw => (c, W, H) => { c.fillStyle = "#fffaf0"; c.fillRect(0, 0, W, H); c.fillStyle = "#e23b3b"; c.fillRect(0, 0, W, 64); c.fillStyle = "#fff"; c.font = "900 50px Inter"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(label, W / 2, 34); c.fillStyle = INK; c.font = `900 ${d >= 10 ? 130 : 150}px Inter`; c.fillText(String(d), W / 2, 150); c.strokeStyle = INK; c.lineWidth = 8; c.strokeRect(4, 4, W - 8, H - 8); };
  const fall = k > 0 && next !== undefined;
  return (<group position={p} scale={s}>
    <Box p={[0, 0.05, -0.04]} s={[1.3, 1.5, 0.05]} color="#3a2a1a" line={2} />
    <CanvasPlane p={[0, 0, 0]} s={[1.2, 1.3]} px={[240, 260]} draw={page(fall ? next! : day)} />
    {fall && k < 1 ? <group position={[0.2 * k, -2.6 * k * k, 0.05 + 0.6 * k]} rotation={[k * 1.4, k * 0.8, -k * 1.2]}><CanvasPlane p={[0, 0, 0]} s={[1.2, 1.3]} px={[240, 260]} draw={page(day)} /></group> : null}
  </group>);
};
export const SignalBars: React.FC<{ p: V3; s?: number; n: number; pop?: number }> = ({ p, s = 2, n, pop = 0 }) => (
  <CanvasPlane p={p} s={[s, s]} px={[256, 256]} face draw={(c, W, H) => { c.clearRect(0, 0, W, H); for (let i = 0; i < 4; i++) { const on = i < n, bh = 40 + i * 44, x = 20 + i * 58, sc = on && i === n - 1 ? 1 + pop * 0.2 : 1; c.save(); c.translate(x + 22, H - 20); c.scale(sc, sc); c.fillStyle = on ? "#2fd46a" : "rgba(255,255,255,.25)"; c.strokeStyle = INK; c.lineWidth = 8; c.fillRect(-22, -bh, 44, bh); c.strokeRect(-22, -bh, 44, bh); c.restore(); } }} />
);
export const useCamPos = () => useThree().camera.position;
