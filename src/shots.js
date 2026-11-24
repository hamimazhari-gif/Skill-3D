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
  // Calm camera: one or two framings per shot, slow short pushes, no dutch angles.
  {shot: 1, loc: 'lineup', lift: false, move: 'wide on the five people, slow push', keys: [
    {at: 'start', pos: [0, 3.0, 2.9], look: [0, 1.25, -3.0]},
    {at: 'end', pos: [0, 2.9, 2.6], look: [0, 1.25, -3.0]}]},
  {shot: 2, loc: 'jakarta', lift: false, move: 'medium on the Jakarta worker, expenses fly out', keys: [
    {at: 'start', pos: [0.5, 1.7, 1.4], look: [0.5, 1.75, -2.4]},
    {at: 'end', pos: [0.45, 1.7, 1.15], look: [0.45, 1.75, -2.4]}]},
  {shot: 2, from: 'tgl15', loc: 'jakarta', lift: false, move: 'closer on the thin wallet and the calendar', keys: [
    {at: 'start', pos: [-0.6, 1.8, 0.2], look: [-0.7, 1.9, -2.3]},
    {at: 'end', pos: [-0.6, 1.8, 0.05], look: [-0.7, 1.9, -2.3]}]},
  {shot: 3, loc: 'jakarta', lift: false, move: 'close in the boarding room, instant noodles', keys: [
    {at: 'start', pos: [12.0, 1.62, -0.6], look: [12.0, 1.55, -2.5]},
    {at: 'end', pos: [12.0, 1.62, -0.75], look: [12.0, 1.55, -2.5]}]},
  {shot: 4, loc: 'bali', lift: false, move: 'the selfie: close on him with the sea and sunset', keys: [
    {at: 'start', pos: [0.05, 1.75, -0.45], look: [0.0, 1.72, -2.0]},
    {at: 'end', pos: [0.05, 1.75, -0.6], look: [0.0, 1.72, -2.0]}]},
  {shot: 4, from: 'balik', loc: 'bali', lift: false, move: 'the camera pulls back: nasi bungkus on a crate', keys: [
    {at: 'start', pos: [0.05, 1.75, -0.6], look: [0.0, 1.72, -2.0]},
    {at: 'end', pos: [0.45, 1.6, 1.3], look: [0.4, 1.35, -2.0]}]},
  {shot: 5, loc: 'bali', lift: false, move: 'steady wide on him eating', keys: [
    {at: 'start', pos: [0.45, 1.6, 1.3], look: [0.4, 1.35, -2.0]},
    {at: 'end', pos: [0.45, 1.6, 1.15], look: [0.4, 1.35, -2.0]}]},
  {shot: 6, loc: 'jogja', lift: false, move: 'wide on the angkringan at night', keys: [
    {at: 'start', pos: [0, 1.7, 2.2], look: [0, 1.6, -2.4]},
    {at: 'end', pos: [0, 1.7, 1.9], look: [0, 1.6, -2.4]}]},
  {shot: 7, loc: 'jogja', lift: false, move: 'two-shot at the bench', keys: [
    {at: 'start', pos: [0.05, 1.65, 1.0], look: [0.05, 1.62, -1.3]},
    {at: 'end', pos: [0.05, 1.65, 0.85], look: [0.05, 1.62, -1.3]}]},
  {shot: 8, loc: 'town', lift: false, move: 'medium-wide street, the worker walks home', keys: [
    {at: 'start', pos: [-0.3, 1.65, 1.5], look: [-0.2, 1.65, -2.0]},
    {at: 'end', pos: [-0.3, 1.65, 1.25], look: [-0.2, 1.65, -2.0]}]},
  {shot: 8, from: 'traktir', loc: 'town', lift: false, move: 'closer on the neighbours asking for a treat', keys: [
    {at: 'start', pos: [0.75, 1.7, 0.75], look: [0.75, 1.7, -2.2]},
    {at: 'end', pos: [0.75, 1.7, 0.6], look: [0.75, 1.7, -2.2]}]},
  {shot: 9, loc: 'desa', lift: false, move: 'medium-wide garden and savings', keys: [
    {at: 'start', pos: [-0.4, 1.7, 1.8], look: [-0.4, 1.6, -2.2]},
    {at: 'end', pos: [-0.4, 1.7, 1.5], look: [-0.4, 1.6, -2.2]}]},
  {shot: 9, from: 'masalah', loc: 'desa', lift: false, move: 'close: no signal', keys: [
    {at: 'start', pos: [-0.2, 1.85, 0.0], look: [-0.2, 2.0, -2.0]},
    {at: 'end', pos: [-0.2, 1.85, -0.1], look: [-0.2, 2.0, -2.0]}]},
  {shot: 10, loc: 'desa', lift: false, move: 'up in the coconut palm', keys: [
    {at: 'start', pos: [2.6, 4.9, 0.4], look: [2.7, 5.45, -2.5]},
    {at: 'end', pos: [2.6, 4.9, 0.2], look: [2.7, 5.45, -2.5]}]},
  {shot: 11, loc: 'call', lift: false, move: 'the video call screen, slow push', keys: [
    {at: 'start', pos: [0, 2.45, 2.4], look: [0, 2.45, -1.8]},
    {at: 'end', pos: [0, 2.45, 2.15], look: [0, 2.45, -1.8]}]},
  {shot: 12, loc: 'call', lift: false, move: 'the call and the question', keys: [
    {at: 'start', pos: [0, 2.7, 2.5], look: [0, 2.75, -1.8]},
    {at: 'end', pos: [0, 2.7, 2.3], look: [0, 2.75, -1.8]}]},
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
