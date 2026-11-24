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
  // Calm camera (user request): one to three framings per shot, slow short pushes, no dutch angles.
  // 1 the note introduces itself on the ATM ledge
  {shot: 1, loc: 'atm', lift: false, move: 'close on the note, slow push', keys: [
    {at: 'start', pos: [-0.2, 1.12, -1.15], look: [-0.25, 1.0, -2.0]},
    {at: 'end', pos: [-0.2, 1.12, -1.25], look: [-0.25, 1.0, -2.0]}]},
  // 2 six o'clock: the owner withdraws, the note comes out, the kiss
  {shot: 2, loc: 'atm', lift: false, move: 'medium-wide: clock, ATM and the owner walking in', keys: [
    {at: 'start', pos: [-0.9, 1.7, 1.9], look: [-0.8, 1.55, -2.0]},
    {at: 'end', pos: [-0.85, 1.65, 1.6], look: [-0.75, 1.5, -2.0]}]},
  {shot: 2, from: 'atm', loc: 'atm', lift: false, move: 'medium on the cash slot and the owner', keys: [
    {at: 'start', pos: [0.1, 1.45, 0.5], look: [0.0, 1.3, -2.1]},
    {at: 'end', pos: [0.1, 1.45, 0.3], look: [0.0, 1.3, -2.1]}]},
  {shot: 2, from: 'cium', loc: 'atm', lift: false, move: 'close on the owner and the note, hearts', keys: [
    {at: 'start', pos: [-0.3, 1.8, -0.1], look: [-0.35, 1.85, -1.6]},
    {at: 'end', pos: [-0.3, 1.8, -0.25], look: [-0.35, 1.85, -1.6]}]},
  // 3 an hour later: the clock runs to seven while the owner walks off
  {shot: 3, loc: 'atm', lift: false, move: 'steady on the street clock, the owner walks through', keys: [
    {at: 'start', pos: [-1.9, 1.95, 1.5], look: [-2.2, 2.0, -1.6]},
    {at: 'end', pos: [-1.9, 1.95, 1.2], look: [-2.2, 2.05, -1.6]}]},
  // 4 the café: the note is broken into change
  {shot: 4, loc: 'cafe', lift: false, move: 'medium on the counter, slow push', keys: [
    {at: 'start', pos: [-0.15, 1.45, 0.1], look: [-0.1, 1.3, -2.6]},
    {at: 'end', pos: [-0.15, 1.45, -0.1], look: [-0.1, 1.3, -2.6]}]},
  // 5 the parking attendant from nowhere
  {shot: 5, loc: 'parking', lift: false, move: 'medium-wide on the owner, scooter and the empty spot', keys: [
    {at: 'start', pos: [0.2, 1.5, 2.0], look: [0.1, 1.3, -2.0]},
    {at: 'end', pos: [0.2, 1.5, 1.7], look: [0.1, 1.3, -2.0]}]},
  {shot: 5, from: 'tadi', loc: 'parking', lift: false, move: 'close on the owner pointing', keys: [
    {at: 'start', pos: [1.05, 1.7, -0.1], look: [1.1, 1.75, -1.75]},
    {at: 'end', pos: [1.05, 1.7, -0.2], look: [1.1, 1.75, -1.75]}]},
  {shot: 5, from: 'prit', loc: 'parking', lift: false, move: 'medium on the attendant waving the owner back', keys: [
    {at: 'start', pos: [-0.3, 1.55, 1.2], look: [-0.4, 1.45, -1.8]},
    {at: 'end', pos: [-0.3, 1.55, 1.0], look: [-0.4, 1.45, -1.8]}]},
  // 6 noon: the shopping app, FLASH SALE
  {shot: 6, loc: 'room', lift: false, move: 'medium on the owner with the phone, slow push', keys: [
    {at: 'start', pos: [-0.1, 1.7, 0.2], look: [-0.15, 1.75, -2.8]},
    {at: 'end', pos: [-0.1, 1.7, 0.0], look: [-0.15, 1.78, -2.8]}]},
  // 7 the 50k note shouts; checkout anyway
  {shot: 7, loc: 'room', lift: false, move: 'close on the shouting note on the desk', keys: [
    {at: 'start', pos: [0.65, 1.18, -1.9], look: [0.75, 1.1, -3.05]},
    {at: 'end', pos: [0.66, 1.18, -2.0], look: [0.75, 1.1, -3.05]}]},
  {shot: 7, from: 'kelima', loc: 'room', lift: false, move: 'the note and the stack of shoe boxes', keys: [
    {at: 'start', pos: [1.15, 1.35, -1.5], look: [1.25, 1.05, -3.3]},
    {at: 'end', pos: [1.15, 1.35, -1.6], look: [1.25, 1.05, -3.3]}]},
  {shot: 7, from: 'checkout', loc: 'room', lift: false, move: 'medium on the checkout', keys: [
    {at: 'start', pos: [-0.2, 1.7, 0.1], look: [-0.3, 1.75, -2.8]},
    {at: 'end', pos: [-0.2, 1.7, -0.05], look: [-0.3, 1.75, -2.8]}]},
  // 8 the kampung: hand to hand
  {shot: 8, loc: 'kampung', lift: false, move: 'close on the lucky 20k note', keys: [
    {at: 'start', pos: [-4.1, 1.72, -0.75], look: [-4.3, 1.66, -1.9]},
    {at: 'end', pos: [-4.1, 1.72, -0.85], look: [-4.3, 1.66, -1.9]}]},
  {shot: 8, from: 'sayur', loc: 'kampung', lift: false, move: 'wide street: veg cart, minibus, food stall, very slow pan', keys: [
    {at: 'start', pos: [-0.6, 1.7, 1.8], look: [-0.6, 1.4, -2.8]},
    {at: 'end', pos: [1.2, 1.7, 1.8], look: [1.2, 1.4, -2.8]}]},
  {shot: 8, from: 'nenek', loc: 'kampung', lift: false, move: 'medium on grandma and the grandchild', keys: [
    {at: 'start', pos: [5.05, 1.5, 0.7], look: [5.05, 1.4, -2.5]},
    {at: 'end', pos: [5.05, 1.48, 0.45], look: [5.05, 1.4, -2.5]}]},
  // 9 the kid's room: into the chicken piggy bank
  {shot: 9, loc: 'kidroom', lift: false, move: 'medium on the kid and the piggy bank', keys: [
    {at: 'start', pos: [0.0, 1.15, -0.7], look: [0.0, 1.0, -2.8]},
    {at: 'end', pos: [0.0, 1.15, -0.85], look: [0.0, 1.0, -2.8]}]},
  {shot: 9, from: 'istirahat', loc: 'kidroom', lift: false, move: 'close on the sleeping piggy bank', keys: [
    {at: 'start', pos: [0.45, 1.45, -1.5], look: [0.4, 1.2, -3.0]},
    {at: 'end', pos: [0.45, 1.42, -1.65], look: [0.4, 1.2, -3.0]}]},
  // 10 night: the empty wallet
  {shot: 10, loc: 'room', lift: false, move: 'wide night room: owner, shoe boxes, coffee cup', keys: [
    {at: 'start', pos: [0.45, 1.65, 0.6], look: [0.45, 1.5, -2.9]},
    {at: 'end', pos: [0.4, 1.65, 0.4], look: [0.4, 1.5, -2.9]}]},
  {shot: 10, from: 'lho', loc: 'room', lift: false, move: 'close on the owner and the wallet', keys: [
    {at: 'start', pos: [-0.4, 1.75, -0.85], look: [-0.5, 1.75, -2.55]},
    {at: 'end', pos: [-0.4, 1.75, -0.95], look: [-0.5, 1.75, -2.55]}]},
  // 11 the desk: that's me; keep a log
  {shot: 11, loc: 'desk', lift: false, move: 'the note and the money log, slow push', keys: [
    {at: 'start', pos: [0.05, 1.38, -1.2], look: [0.05, 1.0, -2.5]},
    {at: 'end', pos: [0.05, 1.36, -1.32], look: [0.05, 1.0, -2.5]}]},
  // 12 the question
  {shot: 12, loc: 'desk', lift: false, move: 'frontal on the note and the signs', keys: [
    {at: 'start', pos: [-0.3, 1.3, -0.9], look: [-0.3, 1.02, -2.6]},
    {at: 'end', pos: [-0.3, 1.3, -1.0], look: [-0.3, 1.02, -2.6]}]},
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
