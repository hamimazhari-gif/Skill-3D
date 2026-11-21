// Thumbnail for "Listrik 30 Hari" (still, 720x1280 rendered at scale 1.5 -> 1080x1920)
import React from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Box, Surface } from "../style/toon";
import { Person, Lights } from "../style/kit";
import { Glow, Dust } from "../style/props";
import { Cam, FaceGroup, hand, Building, StreetLamp } from "../style/extra";
import { Sky, Moon, Candle, TokenMeter, Bolt, Phone } from "../style/home";
import { budi } from "./listrik/common";

const S = ({ t }: { t: number }) => {
  const P: [number, number, number] = [0, 0, 0];
  return (<>
    <Cam t={0} keys={[{ t: 0, pos: [0, 2.4, 8.4], look: [0, 3.6, -2], fov: 60 }]} />
    <Lights warm="#8a9aff" />
    <Sky p={[0, 20, -60]} s={[140, 70]} top="#05061e" bottom="#3a1a5a" stars={1} t={1} />
    <Moon p={[9, 14, -50]} r={3} />
    {Array.from({ length: 12 }, (_, i) => <Building key={i} p={[-22 + i * 4, -2, -18 - (i % 3) * 4]} s={[3.6, 10 + ((i * 7) % 9), 3]} color={["#241a4a", "#2a2056", "#1e1840"][i % 3]} face="+z" seed={i + 4} lit={0.0} trim="#140e30" />)}
    <Surface p={[0, 0, -4]} s={[40, 30]} rot={[-Math.PI / 2, 0, 0]} kind="tile" a="#1c1c36" b="#18182e" unit={1.6} />
    <StreetLamp p={[-4.2, 0, -3]} on={0} /><StreetLamp p={[4.4, 0, -4]} on={0} flip />
    {/* token meter: 0.00 */}
    <Box p={[2.5, 1.7, -1.6]} s={[0.12, 3.4, 0.12]} color="#2b3350" line={2} />
    <group rotation={[0, -0.25, 0]}><TokenMeter p={[2.0, 3.4, -1.0]} kwh={0} warn={0.75} s={1.25} /></group>
    <Glow p={[2.0, 3.6, -0.5]} r={2.2} color="rgba(255,40,40,1)" o={0.55} />
    {/* dying phone */}
    <group position={[-2.1, 3.3, -1.0]} rotation={[0, 0.3, 0.12]}><Phone p={[0, 0, 0]} s={1.9} draw={(c, W, H) => { c.fillStyle = "#0e1630"; c.fillRect(0, 0, W, H); c.strokeStyle = "#fff"; c.lineWidth = 6; c.strokeRect(28, 50, 54, 100); c.fillRect(44, 42, 22, 8); c.fillStyle = "#ff2b3b"; c.fillRect(33, 132, 44, 13); c.fillStyle = "#ff2b3b"; c.font = "900 34px Inter"; c.textAlign = "center"; c.fillText("1%", W / 2, 190); }} /></group>
    <Glow p={[-2.1, 3.3, -0.5]} r={1.8} color="rgba(255,60,90,1)" o={0.35} />
    <Bolt p={[-2.4, 5.0, -2]} s={1.2} mood="sad" />
    {/* Budi */}
    <Person p={P} h={3.9} look={budi} f={30} pose={{ mood: "shock", nerv: 0.4, sweat: 1, t: 30, armR: [0.2, 0.5], armRK: 1, armL: [-0.3, 0.86], armLK: 1, squash: 0.04 }} />
    <FaceGroup p={P}><Candle p={hand(3.9, [0.2, 0.5], 0.04, false, 0.16)} t={0.3} s={1.1} /></FaceGroup>
    <Glow p={[0.9, 2.3, 0.9]} r={2.4} color="rgba(255,170,80,1)" o={0.28} />
    <Dust t={t} area={[6, 6, 4]} color="rgba(200,200,255,.7)" />
  </>);
};
const txt: React.CSSProperties = { fontFamily: "Inter, Arial", fontWeight: 900, textAlign: "center", paintOrder: "stroke fill", WebkitTextStroke: "16px #000", lineHeight: 0.95 };
export const Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "#05061e" }}>
    <AbsoluteFill style={{ filter: "saturate(1.35) contrast(1.1)" }}>
      <ThreeCanvas width={720} height={1280} camera={{ fov: 58, position: [0, 2, 8], near: 0.1, far: 200 }} gl={{ antialias: true }}><color attach="background" args={["#05061e"]} /><S t={2} /></ThreeCanvas>
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0) 45%, rgba(0,0,20,.65) 100%)" }} />
    <div style={{ position: "absolute", top: 60, left: 0, right: 0, ...txt, whiteSpace: "nowrap", fontSize: 150, color: "#ffd23a", transform: "rotate(-4deg)", textShadow: "0 14px 0 rgba(0,0,0,.5)" }}>30 HARI</div>
    <div style={{ position: "absolute", top: 215, left: 0, right: 0, ...txt, fontSize: 100, color: "#fff", transform: "rotate(-4deg)", textShadow: "0 10px 0 rgba(0,0,0,.5)" }}>TANPA<br /><span style={{ color: "#ff3b3b" }}>LISTRIK?!</span></div>
    <div style={{ position: "absolute", bottom: 120, left: 40, right: 40, ...txt, WebkitTextStroke: "12px #000", fontSize: 66, color: "#fff" }}>Hari ke-30 malah <span style={{ color: "#ffd23a" }}>TOKEN HABIS!</span></div>
  </AbsoluteFill>
);
