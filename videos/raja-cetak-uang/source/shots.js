// Camera plan: framings. Each entry is one framing inside narration shot `shot`; `from` (EV name) starts a hard cut
// inside that shot (the framing then runs until the next framing / shot end). Keys: {at: 'start' | 'end' | EV, pos, look}
// in location-local coordinates.
import * as THREE from 'three';
import {LOC, CHAR_DESIGN} from './world';
import {headLift} from './char';

// Framings were planned for classic-height characters; keys aimed at people (look height > 0.9 m) rise with the head.
const LIFT = headLift(CHAR_DESIGN) - 0.03;
const ly = (p, k) => (p.lift !== false && k.look[1] > 0.9 ? LIFT : 0);

export const SHOT_PLAN = [
  // 1 village: the poor people, then the king's idea in the palace
  {shot: 1, loc: 'square', move: 'crane down onto the poor villagers', keys: [
    {at: 'start', pos: [0.4, 3.4, 3.4], look: [0, 1.6, -5.0]},
    {at: 'end', pos: [0.2, 1.8, 1.0], look: [-0.1, 1.35, -3.0]}]},
  {shot: 1, from: 'raja', loc: 'throne', move: 'push on the king and his idea', keys: [
    {at: 'start', pos: [0.4, 1.9, 0.4], look: [-0.15, 1.7, -3.6]},
    {at: 'end', pos: [0.2, 1.8, -1.6], look: [-0.15, 1.75, -3.6]}]},
  // 2 palace: "Easy!" then the printing press
  {shot: 2, loc: 'throne', move: 'low close-up on the king', keys: [
    {at: 'start', pos: [-0.5, 1.35, -1.9], look: [-0.2, 1.5, -3.6]},
    {at: 'end', pos: [-0.45, 1.4, -2.2], look: [-0.2, 1.5, -3.6]}]},
  {shot: 2, from: 'cetak', loc: 'throne', move: 'track to the roaring press', keys: [
    {at: 'start', pos: [0.4, 1.9, 0.6], look: [2.2, 1.1, -3.4]},
    {at: 'end', pos: [1.0, 1.85, -0.4], look: [2.2, 1.1, -3.4]}]},
  {shot: 2, from: 'haha', loc: 'throne', move: 'king laughing in the money', keys: [
    {at: 'start', pos: [0.3, 1.55, -1.5], look: [-0.1, 1.45, -3.6]},
    {at: 'end', pos: [0.25, 1.5, -1.85], look: [-0.1, 1.45, -3.6]}]},
  // 3 village: money rain
  {shot: 3, loc: 'square', move: 'low angle in the money rain', keys: [
    {at: 'start', pos: [0.3, 1.0, -0.6], look: [-0.2, 1.8, -2.3]},
    {at: 'end', pos: [0.2, 1.1, -0.9], look: [-0.2, 1.75, -2.3]}]},
  {shot: 3, from: 'mobil', loc: 'square', move: 'wide with the car', keys: [
    {at: 'start', pos: [-0.6, 1.9, 1.6], look: [1.0, 1.2, -3.6]},
    {at: 'end', pos: [-0.4, 1.8, 0.9], look: [1.0, 1.2, -3.6]}]},
  // 4 market: everyone rich, same bread and rice
  {shot: 4, loc: 'market', move: 'crowd at the bakery', keys: [
    {at: 'start', pos: [0.3, 2.2, 2.6], look: [0.4, 1.3, -3.6]},
    {at: 'end', pos: [0.4, 2.0, 1.4], look: [0.4, 1.3, -3.6]}]},
  {shot: 4, from: 'roti5', loc: 'market', lift: false, move: 'close on the bread and rice', keys: [
    {at: 'start', pos: [0.2, 1.55, -0.6], look: [0.5, 0.95, -3.5]},
    {at: 'end', pos: [0.5, 1.5, -1.0], look: [0.7, 0.95, -3.4]}]},
  // 5 market: the baker and the climbing price
  {shot: 5, loc: 'market', move: 'push on the baker and the price', keys: [
    {at: 'start', pos: [0.4, 1.75, -0.2], look: [0.35, 1.45, -4.2]},
    {at: 'end', pos: [0.4, 1.7, -1.0], look: [0.4, 1.45, -4.2]}]},
  {shot: 5, from: 'naik3', loc: 'market', move: 'snap closer on the last price', keys: [
    {at: 'start', pos: [0.5, 1.65, -1.3], look: [0.45, 1.5, -4.0]},
    {at: 'end', pos: [0.5, 1.65, -1.55], look: [0.45, 1.5, -4.0]}]},
  // 6 market: the goat that became bread; then the king turns the press off
  {shot: 6, loc: 'market', move: 'close on the crying customer', keys: [
    {at: 'start', pos: [-1.1, 1.65, 0.1], look: [-1.75, 1.6, -2.4]},
    {at: 'end', pos: [-1.15, 1.65, -0.3], look: [-1.75, 1.6, -2.4]}]},
  {shot: 6, from: 'sekarang7', loc: 'market', move: 'push on the tears', keys: [
    {at: 'start', pos: [-1.2, 1.55, -1.1], look: [-1.5, 1.45, -2.2]},
    {at: 'end', pos: [-1.25, 1.5, -1.3], look: [-1.5, 1.45, -2.2]}]},
  {shot: 6, from: 'ehem', loc: 'throne', move: 'king sneaks to the lever', keys: [
    {at: 'start', pos: [1.0, 1.65, -0.3], look: [1.9, 1.35, -3.1]},
    {at: 'end', pos: [1.1, 1.6, -0.7], look: [1.9, 1.35, -3.1]}]},
  // 7 the real country: street and the rocketing chart
  {shot: 7, loc: 'country', move: 'establishing push down the street', keys: [
    {at: 'start', pos: [0.6, 2.6, 4.0], look: [0, 1.4, -4.5]},
    {at: 'end', pos: [0.3, 1.9, 1.0], look: [0, 1.4, -3.0]}]},
  {shot: 7, from: 'barang', loc: 'country', lift: false, move: 'close on the price chart', keys: [
    {at: 'start', pos: [1.6, 1.6, -1.2], look: [2.2, 1.5, -3.4]},
    {at: 'end', pos: [1.7, 1.6, -1.6], look: [2.2, 1.55, -3.4]}]},
  // 8 prices double each day; the 100 trillion note
  {shot: 8, loc: 'country', move: 'price tag and clock', keys: [
    {at: 'start', pos: [-1.4, 1.8, -0.1], look: [-0.25, 1.8, -4.2]},
    {at: 'end', pos: [-1.4, 1.75, -0.7], look: [-0.25, 1.8, -4.2]}]},
  {shot: 8, from: 'triliun', loc: 'country', move: 'low angle on the giant note', keys: [
    {at: 'start', pos: [0.3, 1.0, -0.4], look: [0.4, 1.7, -2.6]},
    {at: 'end', pos: [0.25, 1.05, -0.7], look: [0.4, 1.7, -2.6]}]},
  // 9 money abandoned, foreign currency
  {shot: 9, loc: 'country', move: 'wheelbarrow and the bin', keys: [
    {at: 'start', pos: [0.0, 2.2, 1.8], look: [0, 0.9, -2.4]},
    {at: 'end', pos: [0.0, 2.0, 1.1], look: [0, 0.9, -2.4]}]},
  {shot: 9, from: 'asing', loc: 'country', move: 'close on the new money', keys: [
    {at: 'start', pos: [0.3, 1.5, -1.3], look: [0.0, 1.35, -2.6]},
    {at: 'end', pos: [0.3, 1.5, -1.55], look: [0.0, 1.35, -2.6]}]},
  // 10 collector's shop
  {shot: 10, loc: 'collector', move: 'push past the collector to the framed note', keys: [
    {at: 'start', pos: [0.2, 1.9, 0.8], look: [0.0, 1.7, -5.0]},
    {at: 'end', pos: [-0.2, 1.85, -1.0], look: [0.2, 1.75, -5.0]}]},
  {shot: 10, from: 'mahal', loc: 'collector', move: 'collector cheering by the price', keys: [
    {at: 'start', pos: [0.1, 1.7, -0.7], look: [0.0, 1.6, -4.6]},
    {at: 'end', pos: [0.1, 1.7, -1.0], look: [0.0, 1.6, -4.6]}]},
  // 11 closing question in the golden village
  {shot: 11, loc: 'square', move: 'push on the villager with the note', keys: [
    {at: 'start', pos: [0.2, 1.8, 0.8], look: [-0.1, 1.6, -2.4]},
    {at: 'end', pos: [0.1, 1.75, -0.2], look: [-0.1, 1.65, -2.4]}]},
  {shot: 11, from: 'beli', loc: 'square', move: 'pull back to the wishes', keys: [
    {at: 'start', pos: [0.1, 1.85, 0.3], look: [-0.1, 1.9, -2.6]},
    {at: 'end', pos: [0.2, 1.95, 1.2], look: [-0.1, 2.0, -2.8]}]},
];

export function warpU(T, t) {
  const n = T.length; if (t <= T[0]) return 0; if (t >= T[n - 1]) return 1;
  const sec = []; for (let i = 0; i < n - 1; i++) sec.push((1 / (n - 1)) / (T[i + 1] - T[i]));
  const m = [0]; for (let i = 1; i < n - 1; i++) m.push(2 * sec[i - 1] * sec[i] / (sec[i - 1] + sec[i])); m.push(0);
  let i = 0; while (t > T[i + 1]) i++;
  const h = T[i + 1] - T[i], x = (t - T[i]) / h, x2 = x * x, x3 = x2 * x;
  return (2 * x3 - 3 * x2 + 1) * (i / (n - 1)) + (x3 - 2 * x2 + x) * h * m[i] + (-2 * x3 + 3 * x2) * ((i + 1) / (n - 1)) + (x3 - x2) * h * m[i + 1];
}

// Build per-framing curves and key times. A framing with `from` cuts in 0.12 s before its word.
export function buildCameras(T, EVt) {
  const start = (p) => (p.from ? Math.max(T.CUTS[p.shot - 1] + 0.3, EVt[p.from] - 0.12) : T.CUTS[p.shot - 1]);
  return SHOT_PLAN.map((p, i) => {
    const nx = SHOT_PLAN[i + 1];
    const t0 = start(p), t1 = nx && nx.shot === p.shot ? start(nx) : T.CUTS[p.shot];
    const ox = LOC[p.loc];
    const times = p.keys.map((k) => (k.at === 'start' ? t0 : k.at === 'end' ? t1 - 0.05 : EVt[k.at] + 0.15));
    for (let j = 1; j < times.length; j++) times[j] = Math.max(times[j], times[j - 1] + 0.35);
    const pos = new THREE.CatmullRomCurve3(p.keys.map((k) => new THREE.Vector3(k.pos[0] + ox, k.pos[1] + ly(p, k), k.pos[2])), false, 'centripetal');
    const look = new THREE.CatmullRomCurve3(p.keys.map((k) => new THREE.Vector3(k.look[0] + ox, k.look[1] + ly(p, k), k.look[2])), false, 'centripetal');
    return {...p, t0, t1, times, pos, look};
  });
}

// Camera at time t: the last framing that has started.
export function camAt(cams, t) {
  let c = cams[0];
  for (const k of cams) if (t >= k.t0) c = k;
  const u = warpU(c.times, t);
  return {pos: c.pos.getPoint(u), look: c.look.getPoint(u), loc: c.loc};
}
