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
  // Camera language for this video: low angles looking up the long pole to the windows, high crane shots over the
  // terraced street, close-ups inside windows, an over-the-shoulder up the pea shooter, an overhead in the bedroom,
  // dutch angles on the rude awakenings, side tracking shots with the walking knocker, lens changes (fov).
  // 1 pre-dawn street: the knocker taps a window; the sleeper pops up; TRUE STORY
  {shot: 1, loc: 'street', lift: false, move: 'low angle up the pole to the window, slow push', keys: [
    {at: 'start', pos: [-1.5, 0.5, 0.7], look: [-3.5, 2.7, -3.6], fov: 74},
    {at: 'end', pos: [-2.1, 0.65, 0.2], look: [-3.7, 3.1, -3.8], fov: 74}]},
  {shot: 1, from: 'bangunkan', loc: 'street', lift: false, move: 'high close-up into the window, dutch', keys: [
    {at: 'start', pos: [-3.0, 3.55, -1.4], look: [-3.95, 3.95, -4.2], roll: 0.06},
    {at: 'end', pos: [-3.3, 3.75, -1.8], look: [-4.0, 4.0, -4.2], roll: 0.1}]},
  {shot: 1, from: 'nyata', loc: 'street', lift: false, move: 'pull back and crane up to the stamp', keys: [
    {at: 'start', pos: [-0.9, 2.0, 1.2], look: [-2.3, 2.4, -3.2]},
    {at: 'end', pos: [0.2, 2.7, 2.4], look: [-2.2, 2.6, -3.4], fov: 84}]},
  // 2 the mill at dawn: high crane down on the workers; the expensive alarm clock
  {shot: 2, loc: 'factory', lift: false, move: 'high crane down over the mill to the workers', keys: [
    {at: 'start', pos: [3.6, 6.8, 6.5], look: [0, 3.8, -6.5], fov: 74},
    {at: 'end', pos: [2.4, 2.2, 2.2], look: [0.4, 1.6, -3.6]}]},
  {shot: 2, from: 'masalah', loc: 'factory', move: 'low push onto the worker and the clock', keys: [
    {at: 'start', pos: [-0.3, 0.9, -0.2], look: [-2.0, 1.45, -3.1]},
    {at: 'end', pos: [-0.9, 1.0, -0.8], look: [-2.1, 1.55, -3.1]}]},
  {shot: 2, from: 'langka', loc: 'factory', move: 'dutch close-up on the crying worker', keys: [
    {at: 'start', pos: [-0.9, 1.5, -1.2], look: [-1.5, 1.4, -2.8], roll: -0.1},
    {at: 'end', pos: [-1.0, 1.45, -1.45], look: [-1.55, 1.42, -2.8], roll: -0.06}]},
  // 3 the title: the knocker walks in, banner pops
  {shot: 3, loc: 'street', move: 'side track with the walking knocker, ending low under the banner', keys: [
    {at: 'start', pos: [4.8, 1.0, 0.0], look: [3.4, 1.35, -2.4]},
    {at: 'knocker', pos: [1.0, 1.0, 1.4], look: [0.2, 1.8, -3.0]},
    {at: 'end', pos: [0.8, 0.7, 1.2], look: [0.15, 1.95, -3.0], fov: 78}]},
  // 4 the rounds: tracking shot along the street, then high over the lit windows
  {shot: 4, loc: 'street', move: 'low tracking shot beside the walking knocker, tilt up to the window', keys: [
    {at: 'start', pos: [-5.4, 0.6, -0.5], look: [-6.3, 1.4, -2.4]},
    {at: 'tongkat', pos: [-1.5, 0.65, -0.5], look: [-2.2, 1.5, -2.5]},
    {at: 'ketuk', pos: [-0.6, 0.75, -0.3], look: [0.3, 2.3, -3.1]},
    {at: 'end', pos: [-0.4, 0.8, -0.1], look: [0.5, 2.6, -3.4]}]},
  {shot: 4, from: 'pelanggan', loc: 'street', lift: false, move: 'high angle over the street of lit windows', keys: [
    {at: 'start', pos: [2.4, 5.0, 0.8], look: [-0.4, 2.6, -3.8], fov: 80},
    {at: 'end', pos: [3.2, 5.6, 1.8], look: [-0.6, 2.5, -3.8], fov: 84}]},
  // 5 bedroom A: the pole taps the window, the sleeper wakes up shouting
  {shot: 5, loc: 'bedroom', lift: false, move: 'close-up on the window being tapped', keys: [
    {at: 'start', pos: [0.55, 1.75, -2.5], look: [1.3, 1.95, -4.9], fov: 74},
    {at: 'end', pos: [0.4, 1.7, -2.3], look: [1.25, 1.9, -4.9], fov: 74}]},
  {shot: 5, from: 'tok3', loc: 'bedroom', move: 'push in on the sleeper, dutch on the shout', keys: [
    {at: 'start', pos: [0.4, 1.35, -1.6], look: [-0.6, 1.3, -3.9]},
    {at: 'iya', pos: [0.1, 1.4, -2.0], look: [-0.6, 1.35, -3.9], roll: 0.1},
    {at: 'end', pos: [0.0, 1.45, -2.2], look: [-0.6, 1.35, -3.9], roll: 0.06}]},
  // 6 don't pretend: over the knocker's shoulder up to the window, then a low angle on the stubborn knocker
  {shot: 6, loc: 'street', lift: false, move: 'crane up behind the knocker to the window', keys: [
    {at: 'start', pos: [3.2, 3.3, -2.2], look: [2.4, 3.95, -4.2]},
    {at: 'end', pos: [2.95, 3.65, -2.6], look: [2.4, 4.0, -4.2]}]},
  {shot: 6, from: 'pergi', loc: 'street', lift: false, move: 'low angle up at the stubborn knocker and the window', keys: [
    {at: 'start', pos: [4.3, 0.5, -0.3], look: [2.7, 2.5, -3.4], roll: -0.07},
    {at: 'end', pos: [4.0, 0.45, -0.1], look: [2.6, 2.6, -3.5], roll: -0.03}]},
  // 7 London: the woman walks in; over-the-shoulder up the pea shooter; the window
  {shot: 7, loc: 'london', move: 'sideways track with the walking woman to the LONDON sign', keys: [
    {at: 'start', pos: [-1.8, 1.15, 0.4], look: [-2.4, 1.4, -2.4]},
    {at: 'london', pos: [-1.3, 1.2, 0.7], look: [-1.3, 1.6, -2.8]},
    {at: 'end', pos: [-1.2, 1.2, 0.5], look: [-1.0, 1.55, -2.7]}]},
  {shot: 7, from: 'sumpit', loc: 'london', lift: false, move: 'low over-the-shoulder up the pea shooter to the window', keys: [
    {at: 'start', pos: [-1.35, 1.15, -1.3], look: [0.5, 3.4, -4.0], fov: 74},
    {at: 'end', pos: [-1.05, 1.35, -1.7], look: [0.7, 3.8, -4.0], fov: 74}]},
  {shot: 7, from: 'tik1', loc: 'london', lift: false, move: 'high close-up on the window being hit', keys: [
    {at: 'start', pos: [0.0, 3.6, -1.8], look: [0.8, 3.95, -4.1], roll: 0.05},
    {at: 'end', pos: [0.2, 3.8, -2.1], look: [0.8, 4.0, -4.1], roll: 0.09}]},
  // 8 the pay: arc around the woman and the coins
  {shot: 8, loc: 'london', lift: false, move: 'arc around the payment', keys: [
    {at: 'start', pos: [1.5, 1.65, -0.6], look: [0.0, 1.85, -3.0]},
    {at: 'end', pos: [-1.3, 1.9, -0.3], look: [-0.4, 2.05, -3.0]}]},
  // 9 bedroom B: who wakes the knocker? overhead crane down, then a dutch close-up
  {shot: 9, loc: 'bedroom', lift: false, move: 'overhead crane down onto the sleeping knocker', keys: [
    {at: 'start', pos: [11.7, 2.95, -2.3], look: [11.4, 0.9, -4.0], fov: 84},
    {at: 'end', pos: [11.9, 2.2, -1.4], look: [11.4, 1.35, -3.9]}]},
  {shot: 9, from: 'siapa', loc: 'bedroom', lift: false, move: 'dutch close-up as he wakes confused', keys: [
    {at: 'start', pos: [12.0, 1.65, -2.0], look: [11.5, 1.7, -3.9], roll: 0.12},
    {at: 'end', pos: [12.3, 1.8, -1.4], look: [11.7, 2.05, -3.8], roll: 0.05}]},
  // 10 the night walk to sunrise
  {shot: 10, loc: 'street', move: 'crane down from the moonlit roofs to a low track beside the knocker', keys: [
    {at: 'start', pos: [-4.0, 4.6, 2.6], look: [-5.6, 2.2, -2.6], fov: 74},
    {at: 'belum', pos: [-0.6, 0.95, -0.2], look: [-1.6, 1.45, -2.6]},
    {at: 'end', pos: [-0.4, 1.0, -0.1], look: [-1.5, 1.5, -2.6]}]},
  {shot: 10, from: 'semua', loc: 'street', lift: false, move: 'wide pull back into the sunrise', keys: [
    {at: 'start', pos: [0.6, 1.5, 0.6], look: [1.2, 2.5, -3.4]},
    {at: 'end', pos: [2.0, 2.6, 2.2], look: [2.4, 2.8, -3.6], fov: 84}]},
  // 11 the clock shop: truck from the sad knocker to the cheap clocks
  {shot: 11, loc: 'shop', lift: false, move: 'truck from the sad knocker to the stall', keys: [
    {at: 'start', pos: [-3.4, 1.4, -0.4], look: [-2.3, 1.75, -2.8]},
    {at: 'murah', pos: [-0.2, 1.5, 0.6], look: [0.2, 1.7, -3.3]},
    {at: 'end', pos: [-0.5, 1.55, 0.9], look: [0.0, 1.7, -3.3]}]},
  // 12 today: overhead on the bed, the snooze counter, then the question
  {shot: 12, loc: 'modern', lift: false, move: 'overhead on the sleeper, descend to the phone and counter', keys: [
    {at: 'start', pos: [-0.3, 2.9, -2.5], look: [-0.6, 0.9, -3.9]},
    {at: 'snooze', pos: [0.4, 1.85, -1.7], look: [0.0, 1.85, -3.8]},
    {at: 'end', pos: [0.45, 1.9, -1.6], look: [0.05, 1.95, -3.8]}]},
  {shot: 12, from: 'langsung', loc: 'modern', lift: false, move: 'wide frontal on the choice, push in on the comment', keys: [
    {at: 'start', pos: [0.25, 1.65, 1.0], look: [0.25, 2.1, -2.8], fov: 84},
    {at: 'komentar', pos: [0.25, 1.6, 0.6], look: [0.25, 2.15, -2.8]},
    {at: 'end', pos: [0.25, 1.6, 0.45], look: [0.25, 2.15, -2.8]}]},
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
