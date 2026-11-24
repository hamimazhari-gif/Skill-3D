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
  // Calm camera (user request): one or two framings per shot, slow short pushes, no dutch angles, steady lens.
  // 1 pre-dawn street: the knocker taps a window; the sleeper pops up; TRUE STORY
  {shot: 1, loc: 'street', lift: false, move: 'low angle up the pole to the window, slow push', keys: [
    {at: 'start', pos: [-1.7, 0.6, 0.5], look: [-3.6, 2.9, -3.7], fov: 76},
    {at: 'end', pos: [-2.0, 0.7, 0.1], look: [-3.7, 3.1, -3.8], fov: 76}]},
  {shot: 1, from: 'nyata', loc: 'street', lift: false, move: 'steady wide on the stamp', keys: [
    {at: 'start', pos: [-0.6, 2.2, 1.6], look: [-2.3, 2.5, -3.3]},
    {at: 'end', pos: [-0.5, 2.3, 1.9], look: [-2.3, 2.5, -3.3]}]},
  // 2 the mill at dawn
  {shot: 2, loc: 'factory', lift: false, move: 'wide on the mill, slow push', keys: [
    {at: 'start', pos: [2.2, 2.6, 3.0], look: [0.2, 2.2, -4.5]},
    {at: 'end', pos: [1.9, 2.3, 2.2], look: [0.0, 1.9, -4.0]}]},
  {shot: 2, from: 'masalah', loc: 'factory', move: 'medium on the worker and the clock', keys: [
    {at: 'start', pos: [-0.6, 1.1, -0.4], look: [-2.0, 1.5, -3.1]},
    {at: 'end', pos: [-0.8, 1.1, -0.7], look: [-2.0, 1.5, -3.1]}]},
  // 3 the title
  {shot: 3, loc: 'street', move: 'frontal on the knocker under the banner, slight push', keys: [
    {at: 'start', pos: [-0.1, 1.15, 2.1], look: [-0.2, 1.95, -3.0]},
    {at: 'end', pos: [-0.1, 1.05, 1.7], look: [-0.2, 2.0, -3.0]}]},
  // 4 the rounds: gentle pan with the knocker to the window
  {shot: 4, loc: 'street', move: 'gentle pan with the walking knocker', keys: [
    {at: 'start', pos: [-1.0, 1.1, 0.8], look: [-2.2, 1.6, -2.6]},
    {at: 'end', pos: [-0.4, 1.1, 0.7], look: [0.4, 2.5, -3.4]}]},
  // 5 bedroom A
  {shot: 5, loc: 'bedroom', lift: false, move: 'still on the window being tapped', keys: [
    {at: 'start', pos: [0.5, 1.75, -2.45], look: [1.3, 1.95, -4.9], fov: 76},
    {at: 'end', pos: [0.45, 1.75, -2.4], look: [1.3, 1.95, -4.9], fov: 76}]},
  {shot: 5, from: 'tok3', loc: 'bedroom', move: 'medium on the sleeper, slight push', keys: [
    {at: 'start', pos: [0.3, 1.4, -1.8], look: [-0.6, 1.33, -3.9]},
    {at: 'end', pos: [0.15, 1.4, -2.05], look: [-0.6, 1.33, -3.9]}]},
  // 6 don't pretend: one steady framing with the knocker and the window
  {shot: 6, loc: 'street', lift: false, move: 'steady low-medium on the knocker and the window', keys: [
    {at: 'start', pos: [1.0, 1.3, 0.5], look: [1.95, 2.7, -3.6]},
    {at: 'end', pos: [1.05, 1.3, 0.2], look: [1.95, 2.75, -3.6]}]},
  // 7 London
  {shot: 7, loc: 'london', move: 'medium-wide on the woman and the LONDON sign, slow push', keys: [
    {at: 'start', pos: [-1.3, 1.25, 1.0], look: [-1.3, 1.6, -2.8]},
    {at: 'end', pos: [-1.2, 1.25, 0.6], look: [-1.1, 1.6, -2.8]}]},
  {shot: 7, from: 'sumpit', loc: 'london', lift: false, move: 'still low over-the-shoulder up the pea shooter to the window', keys: [
    {at: 'start', pos: [-1.25, 1.3, -1.45], look: [0.6, 3.6, -4.0], fov: 76},
    {at: 'end', pos: [-1.2, 1.35, -1.55], look: [0.65, 3.7, -4.0], fov: 76}]},
  // 8 the pay
  {shot: 8, loc: 'london', lift: false, move: 'steady medium on the payment', keys: [
    {at: 'start', pos: [0.3, 1.8, -0.3], look: [-0.1, 1.95, -3.0]},
    {at: 'end', pos: [0.2, 1.85, -0.45], look: [-0.15, 2.0, -3.0]}]},
  // 9 bedroom B
  {shot: 9, loc: 'bedroom', lift: false, move: 'medium on the sleeping knocker, slow push', keys: [
    {at: 'start', pos: [11.9, 1.9, -1.3], look: [11.45, 1.6, -3.9]},
    {at: 'end', pos: [11.85, 1.9, -1.6], look: [11.5, 1.75, -3.9]}]},
  // 10 the night walk to sunrise
  {shot: 10, loc: 'street', move: 'wide street, gentle pan with the knocker', keys: [
    {at: 'start', pos: [-2.2, 1.4, 1.6], look: [-3.2, 1.9, -3.0]},
    {at: 'end', pos: [-0.6, 1.5, 1.6], look: [-0.4, 2.2, -3.2]}]},
  // 11 the clock shop
  {shot: 11, loc: 'shop', lift: false, move: 'steady medium-wide on the knocker and the stall', keys: [
    {at: 'start', pos: [-0.5, 1.6, 1.3], look: [-0.45, 1.7, -3.0]},
    {at: 'end', pos: [-0.6, 1.6, 1.0], look: [-0.55, 1.7, -3.0]}]},
  // 12 today
  {shot: 12, loc: 'modern', lift: false, move: 'medium on the sleeper with the phone and counter', keys: [
    {at: 'start', pos: [0.35, 1.8, -1.5], look: [-0.05, 1.8, -3.8]},
    {at: 'end', pos: [0.3, 1.8, -1.7], look: [-0.05, 1.85, -3.8]}]},
  {shot: 12, from: 'langsung', loc: 'modern', lift: false, move: 'steady frontal on the choice', keys: [
    {at: 'start', pos: [0.25, 1.62, 0.8], look: [0.25, 2.15, -2.8], fov: 84},
    {at: 'end', pos: [0.25, 1.6, 0.5], look: [0.25, 2.15, -2.8], fov: 84}]},
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
