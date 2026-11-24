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
  // Calm camera: one to four framings per shot, slow short pushes, no dutch angles.
  {shot: 1, loc: 'palace', lift: false, move: 'wide: the new president at the podium', keys: [
    {at: 'start', pos: [0, 1.7, 1.3], look: [0, 1.85, -4]},
    {at: 'end', pos: [0, 1.7, 1.0], look: [0, 1.85, -4]}]},
  {shot: 1, from: 'berubah', loc: 'palace', lift: false, move: 'close: changes everything', keys: [
    {at: 'start', pos: [0, 1.75, -1.2], look: [0, 1.68, -3.45]},
    {at: 'end', pos: [0, 1.75, -1.35], look: [0, 1.68, -3.45]}]},
  {shot: 2, loc: 'cabinet', lift: false, move: 'the cabinet meeting, a long presentation', keys: [
    {at: 'start', pos: [-0.7, 1.8, 1.0], look: [-0.9, 1.45, -4.4]},
    {at: 'end', pos: [-0.7, 1.8, 0.75], look: [-0.9, 1.45, -4.4]}]},
  {shot: 2, from: 'pakMenteri', loc: 'cabinet', lift: false, move: 'close: emak scolds', keys: [
    {at: 'start', pos: [3.15, 1.72, -1.15], look: [3.9, 1.66, -2.9]},
    {at: 'end', pos: [3.2, 1.72, -1.3], look: [3.9, 1.66, -2.9]}]},
  {shot: 2, from: 'intinya', loc: 'cabinet', lift: false, move: 'close: the minister sweats', keys: [
    {at: 'start', pos: [-1.55, 1.72, -2.85], look: [-1.9, 1.66, -4.7]},
    {at: 'end', pos: [-1.6, 1.72, -3.0], look: [-1.9, 1.66, -4.7]}]},
  {shot: 2, from: 'mau', loc: 'cabinet', lift: false, move: 'close: mau mau, enggak enggak', keys: [
    {at: 'start', pos: [3.15, 1.72, -1.15], look: [3.9, 1.66, -2.9]},
    {at: 'end', pos: [3.2, 1.72, -1.3], look: [3.9, 1.66, -2.9]}]},
  {shot: 3, loc: 'market', lift: false, move: 'the market: chilli prices', keys: [
    {at: 'start', pos: [-0.2, 1.75, 1.1], look: [-0.2, 1.45, -3.2]},
    {at: 'end', pos: [-0.2, 1.75, 0.85], look: [-0.2, 1.45, -3.2]}]},
  {shot: 3, from: 'menang', loc: 'market', lift: false, move: 'close: the seller is nervous', keys: [
    {at: 'start', pos: [0.1, 1.75, -1.7], look: [0.1, 1.6, -4.05]},
    {at: 'end', pos: [0.1, 1.75, -1.85], look: [0.1, 1.6, -4.05]}]},
  {shot: 4, loc: 'market', lift: false, move: 'two-shot: the bargain', keys: [
    {at: 'start', pos: [-0.35, 1.7, 0.4], look: [-0.35, 1.45, -3.3]},
    {at: 'end', pos: [-0.35, 1.7, 0.2], look: [-0.35, 1.45, -3.3]}]},
  {shot: 4, from: 'pindah', loc: 'market', lift: false, move: 'wider: I will go next door', keys: [
    {at: 'start', pos: [0.8, 1.75, 1.5], look: [0.8, 1.5, -3.4]},
    {at: 'end', pos: [0.8, 1.75, 1.3], look: [0.8, 1.5, -3.4]}]},
  {shot: 5, loc: 'cabinet', lift: false, move: 'the door: Bambang sneaks in late', keys: [
    {at: 'start', pos: [-2.5, 1.7, -1.1], look: [-3.4, 1.5, -5.0]},
    {at: 'end', pos: [-2.55, 1.7, -1.3], look: [-3.4, 1.5, -5.0]}]},
  {shot: 5, from: 'bambang', loc: 'cabinet', lift: false, move: 'close: emak calls his full name', keys: [
    {at: 'start', pos: [3.15, 1.72, -1.15], look: [3.9, 1.66, -2.9]},
    {at: 'end', pos: [3.2, 1.72, -1.3], look: [3.9, 1.66, -2.9]}]},
  {shot: 5, from: 'jam', loc: 'cabinet', lift: false, move: 'close: Bambang trembles', keys: [
    {at: 'start', pos: [-2.95, 1.72, -2.6], look: [-3.2, 1.62, -4.6]},
    {at: 'end', pos: [-2.95, 1.72, -2.75], look: [-3.2, 1.62, -4.6]}]},
  {shot: 6, loc: 'cabinet', lift: false, move: 'all ministers sit up straight', keys: [
    {at: 'start', pos: [0.6, 1.55, 0.05], look: [0.6, 1.25, -4.0]},
    {at: 'end', pos: [0.6, 1.55, -0.1], look: [0.6, 1.25, -4.0]}]},
  {shot: 7, loc: 'palace', lift: false, move: 'emak at her desk', keys: [
    {at: 'start', pos: [4.7, 1.6, -0.5], look: [4.7, 1.3, -3.6]},
    {at: 'end', pos: [4.7, 1.6, -0.7], look: [4.7, 1.3, -3.6]}]},
  {shot: 7, from: 'buku', loc: 'palace', lift: false, move: 'macro: the cartoon budget book', keys: [
    {at: 'start', pos: [4.25, 1.5, -2.15], look: [4.25, 0.8, -3.05]},
    {at: 'end', pos: [4.25, 1.48, -2.25], look: [4.25, 0.8, -3.05]}]},
  {shot: 7, from: 'kaleng', loc: 'palace', lift: false, move: 'the biscuit tin full of money', keys: [
    {at: 'start', pos: [4.95, 1.5, -1.7], look: [5.0, 1.1, -3.3]},
    {at: 'end', pos: [4.95, 1.48, -1.85], look: [5.0, 1.1, -3.3]}]},
  {shot: 8, loc: 'palace', lift: false, move: 'new policies: lamps off', keys: [
    {at: 'start', pos: [4.7, 1.7, -0.5], look: [4.7, 1.95, -4.5]},
    {at: 'end', pos: [4.7, 1.7, -0.7], look: [4.7, 1.95, -4.5]}]},
  {shot: 8, from: 'kantong', loc: 'palace', lift: false, move: 'macro: plastic bags folded into triangles', keys: [
    {at: 'start', pos: [4.7, 1.4, -1.85], look: [4.7, 0.95, -3.0]},
    {at: 'end', pos: [4.7, 1.38, -1.95], look: [4.7, 0.95, -3.0]}]},
  {shot: 9, loc: 'home', lift: false, move: 'lost remote: found in one second', keys: [
    {at: 'start', pos: [-0.2, 1.65, 0.7], look: [-0.2, 1.4, -3.0]},
    {at: 'end', pos: [-0.2, 1.65, 0.5], look: [-0.2, 1.4, -3.0]}]},
  {shot: 9, from: 'makanya', loc: 'home', lift: false, move: 'closer: look with your eyes', keys: [
    {at: 'start', pos: [0.45, 1.72, -1.0], look: [0.65, 1.6, -2.6]},
    {at: 'end', pos: [0.45, 1.72, -1.12], look: [0.65, 1.6, -2.6]}]},
  {shot: 10, loc: 'home', lift: false, move: 'close: emak is already a president', keys: [
    {at: 'start', pos: [2.2, 1.72, -2.05], look: [2.2, 1.55, -4.05]},
    {at: 'end', pos: [2.2, 1.72, -2.2], look: [2.2, 1.55, -4.05]}]},
  {shot: 10, from: 'rumah', loc: 'home', lift: false, move: 'president at home', keys: [
    {at: 'start', pos: [2.3, 1.75, -1.2], look: [2.3, 1.55, -4.0]},
    {at: 'end', pos: [2.3, 1.75, -1.35], look: [2.3, 1.55, -4.0]}]},
  {shot: 11, loc: 'home', lift: false, move: 'everything she runs', keys: [
    {at: 'start', pos: [2.2, 1.75, 0.5], look: [2.2, 1.75, -3.4]},
    {at: 'end', pos: [2.2, 1.75, 0.3], look: [2.2, 1.75, -3.4]}]},
  {shot: 12, loc: 'home', lift: false, move: 'the family and the question', keys: [
    {at: 'start', pos: [0, 1.75, 1.1], look: [0, 2.0, -3]},
    {at: 'end', pos: [0, 1.75, 0.9], look: [0, 2.0, -3]}]},
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
    const rolls = p.keys.map((k) => k.roll || 0), fovs = p.keys.map((k) => k.fov || 80);
    return {...p, t0, t1, times, pos, look, rolls, fovs};
  });
}

// Camera at time t: the last framing that has started.
export function camAt(cams, t) {
  let c = cams[0];
  for (const k of cams) if (t >= k.t0) c = k;
  const u = warpU(c.times, t);
  // roll (dutch angle, rad) and fov (lens) per key, eased between keys
  const s = u * (c.rolls.length - 1), i = Math.min(c.rolls.length - 2, Math.floor(s)), f = s - i;
  const e = f * f * (3 - 2 * f), mix = (a) => (a.length < 2 ? a[0] : a[i] + (a[i + 1] - a[i]) * e);
  return {pos: c.pos.getPoint(u), look: c.look.getPoint(u), loc: c.loc, roll: mix(c.rolls), fov: mix(c.fovs)};
}
