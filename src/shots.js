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
  // Calm camera: slow pushes; a crane up to Monas in the snow.
  {shot: 1, loc: 'jakarta', lift: false, move: 'Jakarta at noon, the thermometer drops, snow on Monas', keys: [
    {at: 'start', pos: [0.6, 1.5, 0.6], look: [0.6, 2.6, -8]},
    {at: 'end', pos: [0.6, 1.5, 0.3], look: [0.6, 3.2, -8]}]},
  {shot: 2, loc: 'jakarta', lift: false, move: 'Bapak in a sarung steps out and freezes', keys: [
    {at: 'start', pos: [-6.8, 1.7, 0.2], look: [-6.9, 1.4, -3.4]},
    {at: 'end', pos: [-6.8, 1.7, -0.1], look: [-6.9, 1.4, -3.4]}]},
  {shot: 2, from: 'pertama', loc: 'jakarta', lift: false, move: 'snow falls on Monas', keys: [
    {at: 'start', pos: [0, 1.4, 0.6], look: [0, 7.5, -18]},
    {at: 'end', pos: [0, 1.4, 0.2], look: [0, 8.5, -18]}]},
  {shot: 3, loc: 'jakarta', lift: false, move: 'close: "like abroad!"', keys: [
    {at: 'start', pos: [-0.25, 1.25, -1.2], look: [-0.25, 1.35, -2.5]},
    {at: 'end', pos: [-0.25, 1.25, -1.3], look: [-0.25, 1.35, -2.5]}]},
  {shot: 4, loc: 'jakarta', lift: false, move: 'but the fun is short', keys: [
    {at: 'start', pos: [-0.3, 1.75, 0.3], look: [-0.3, 1.5, -3.0]},
    {at: 'end', pos: [-0.3, 1.75, 0.0], look: [-0.3, 1.5, -3.0]}]},
  {shot: 5, loc: 'house', lift: false, move: 'a house built to stay cool', keys: [
    {at: 'start', pos: [0, 1.8, 0.6], look: [0, 1.4, -3.6]},
    {at: 'end', pos: [0, 1.8, 0.3], look: [0, 1.4, -3.6]}]},
  {shot: 5, from: 'keluarga', loc: 'house', lift: false, move: 'everyone hugs the rice cooker', keys: [
    {at: 'start', pos: [0, 1.55, -0.8], look: [0, 1.15, -3.2]},
    {at: 'end', pos: [0, 1.55, -1.0], look: [0, 1.15, -3.2]}]},
  {shot: 6, loc: 'house', lift: false, move: 'close: "move over, my turn!"', keys: [
    {at: 'start', pos: [-0.1, 1.5, -1.3], look: [-0.1, 1.3, -3.3]},
    {at: 'end', pos: [-0.1, 1.5, -1.45], look: [-0.1, 1.3, -3.3]}]},
  {shot: 7, loc: 'field', lift: false, move: 'the rice field freezes', keys: [
    {at: 'start', pos: [0.4, 1.5, 0.2], look: [0.3, 0.9, -3.6]},
    {at: 'end', pos: [0.4, 1.45, -0.05], look: [0.3, 0.9, -3.6]}]},
  {shot: 7, from: 'uduk', loc: 'field', lift: false, move: 'nasi uduk costs a fortune', keys: [
    {at: 'start', pos: [6.7, 1.7, 0.0], look: [6.7, 1.4, -3.0]},
    {at: 'end', pos: [6.7, 1.7, -0.3], look: [6.7, 1.4, -3.0]}]},
  {shot: 8, loc: 'space', lift: false, move: 'ice reflects sunlight, the loop', keys: [
    {at: 'start', pos: [11.8, 2.1, 2.6], look: [11.8, 2.2, -3.8]},
    {at: 'end', pos: [11.8, 2.1, 2.1], look: [11.8, 2.2, -3.8]}]},
  {shot: 9, loc: 'lab', lift: false, move: 'scientists: Snowball Earth', keys: [
    {at: 'start', pos: [-0.2, 1.75, 0.4], look: [-0.2, 1.6, -3.4]},
    {at: 'end', pos: [-0.2, 1.75, 0.1], look: [-0.2, 1.6, -3.4]}]},
  {shot: 9, from: 'bolaSalju', loc: 'lab', lift: false, move: 'close: the white Earth', keys: [
    {at: 'start', pos: [0.6, 1.7, -2.0], look: [0.6, 1.65, -3.6]},
    {at: 'end', pos: [0.6, 1.7, -2.15], look: [0.6, 1.65, -3.6]}]},
  {shot: 10, loc: 'lab', lift: false, move: 'last ice age −6 vs −30', keys: [
    {at: 'start', pos: [5.6, 1.75, 0.5], look: [5.6, 1.5, -3.3]},
    {at: 'end', pos: [5.6, 1.75, 0.2], look: [5.6, 1.5, -3.3]}]},
  {shot: 11, loc: 'jakarta', lift: false, move: 'back in the heat', keys: [
    {at: 'start', pos: [-0.4, 1.7, -0.2], look: [-0.4, 1.5, -3.0]},
    {at: 'end', pos: [-0.4, 1.7, -0.45], look: [-0.4, 1.5, -3.0]}]},
  {shot: 12, loc: 'jakarta', lift: false, move: 'what would you do first?', keys: [
    {at: 'start', pos: [-0.25, 1.85, 0.5], look: [-0.25, 1.75, -3.0]},
    {at: 'end', pos: [-0.25, 1.85, 0.25], look: [-0.25, 1.75, -3.0]}]},
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
