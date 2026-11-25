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
  // Calm camera: slow short pushes, hard cuts inside a location on the punchlines.
  {shot: 1, loc: 'stage', lift: false, move: 'emergency news on TV', keys: [
    {at: 'start', pos: [-12, 1.55, 0.3], look: [-12, 1.5, -3.4]},
    {at: 'end', pos: [-12, 1.55, 0.0], look: [-12, 1.5, -3.4]}]},
  {shot: 1, from: 'bohong0', loc: 'home', lift: false, move: 'a man in front of the TV covers his mouth in panic', keys: [
    {at: 'start', pos: [-1.55, 1.75, -0.6], look: [-1.75, 1.6, -4.2]},
    {at: 'end', pos: [-1.55, 1.75, -0.8], look: [-1.75, 1.6, -4.2]}]},
  {shot: 2, loc: 'home', lift: false, move: '7 am: the wife comes home with a new dress', keys: [
    {at: 'start', pos: [0, 1.7, 1.2], look: [0, 1.35, -3.6]},
    {at: 'end', pos: [0, 1.7, 0.9], look: [0, 1.35, -3.6]}]},
  {shot: 2, from: 'pa', loc: 'home', move: 'close: "do I look pretty?"', keys: [
    {at: 'start', pos: [-0.45, 1.6, -1.35], look: [-0.55, 1.5, -3.0]},
    {at: 'end', pos: [-0.45, 1.6, -1.5], look: [-0.55, 1.5, -3.0]}]},
  {shot: 3, loc: 'home', move: 'close: the husband tries to keep quiet', keys: [
    {at: 'start', pos: [0.5, 1.6, -1.35], look: [0.55, 1.5, -3.0]},
    {at: 'end', pos: [0.5, 1.6, -1.5], look: [0.55, 1.5, -3.0]}]},
  {shot: 3, from: 'taplak', loc: 'home', lift: false, move: 'the dress matches grandma\'s tablecloth', keys: [
    {at: 'start', pos: [-1.0, 1.7, 0.1], look: [-1.4, 1.45, -3.4]},
    {at: 'end', pos: [-1.0, 1.7, -0.1], look: [-1.4, 1.45, -3.4]}]},
  {shot: 4, loc: 'home', lift: false, move: 'night: sleeping on the sofa', keys: [
    {at: 'start', pos: [1.55, 1.3, -1.7], look: [1.6, 0.95, -4.3]},
    {at: 'end', pos: [1.55, 1.25, -1.95], look: [1.6, 0.95, -4.3]}]},
  {shot: 5, loc: 'office', lift: false, move: '9 am: the weekly meeting', keys: [
    {at: 'start', pos: [-0.35, 1.75, 1.3], look: [-0.35, 1.3, -3.2]},
    {at: 'end', pos: [-0.35, 1.7, 1.0], look: [-0.35, 1.3, -3.2]}]},
  {shot: 5, from: 'adaPak', loc: 'office', lift: false, move: 'close: "this could be one WhatsApp message"', keys: [
    {at: 'start', pos: [0.4, 1.38, -1.85], look: [0.4, 1.3, -3.2]},
    {at: 'end', pos: [0.4, 1.38, -1.95], look: [0.4, 1.3, -3.2]}]},

  {shot: 5, from: 'seisi', loc: 'office', lift: false, move: 'the room holds its breath', keys: [
    {at: 'start', pos: [0.2, 1.9, 0.9], look: [-0.35, 1.2, -3.0]},
    {at: 'end', pos: [0.15, 1.9, 0.7], look: [-0.35, 1.2, -3.0]}]},
  {shot: 6, loc: 'market', lift: false, move: 'noon: the watermelon stall', keys: [
    {at: 'start', pos: [-0.2, 1.8, 1.6], look: [-0.2, 1.3, -3.2]},
    {at: 'end', pos: [-0.2, 1.75, 1.2], look: [-0.2, 1.3, -3.2]}]},
  {shot: 6, from: 'jujur', loc: 'market', move: 'close: "the only sweet thing is me"', keys: [
    {at: 'start', pos: [0.35, 1.62, -2.48], look: [0.35, 1.62, -3.75]},
    {at: 'end', pos: [0.35, 1.62, -2.56], look: [0.35, 1.62, -3.75]}]},
  {shot: 6, from: 'saya', loc: 'market', lift: false, move: 'wide: every buyer runs away', keys: [
    {at: 'start', pos: [-0.2, 2.1, 2.6], look: [-0.2, 1.2, -3.0]},
    {at: 'end', pos: [-0.2, 2.15, 2.8], look: [-0.2, 1.2, -3.0]}]},
  {shot: 7, loc: 'porch', lift: false, move: '3 pm: a friend comes to collect a debt', keys: [
    {at: 'start', pos: [0.6, 1.75, 1.6], look: [0.4, 1.3, -3.2]},
    {at: 'end', pos: [0.5, 1.7, 1.2], look: [0.3, 1.3, -3.2]}]},
  {shot: 7, from: 'sebenarnya', loc: 'porch', move: 'two-shot: "I love the money more than you"', keys: [
    {at: 'start', pos: [0.15, 1.65, -0.9], look: [0.15, 1.5, -3.2]},
    {at: 'end', pos: [0.15, 1.65, -1.05], look: [0.15, 1.5, -3.2]}]},
  {shot: 8, loc: 'arisan', lift: false, move: '6 pm: the arisan group chat explodes', keys: [
    {at: 'start', pos: [-0.1, 1.6, 0.2], look: [-0.1, 1.45, -3.2]},
    {at: 'end', pos: [-0.1, 1.6, -0.1], look: [-0.1, 1.45, -3.2]}]},
  {shot: 9, loc: 'wedding', lift: false, move: '7 pm: the wedding', keys: [
    {at: 'start', pos: [0, 1.95, 2.0], look: [0, 1.5, -4.5]},
    {at: 'end', pos: [0, 1.9, 1.6], look: [0, 1.5, -4.5]}]},
  {shot: 9, from: 'gimana', loc: 'wedding', move: 'two-shot: "how is the food?"', keys: [
    {at: 'start', pos: [0.15, 1.6, -0.5], look: [0.15, 1.5, -2.5]},
    {at: 'end', pos: [0.15, 1.6, -0.65], look: [0.15, 1.5, -2.5]}]},
  {shot: 9, from: 'nggakKenal', loc: 'wedding', move: 'the bride and groom: who is he?', keys: [
    {at: 'start', pos: [0, 1.95, -3.0], look: [0, 1.85, -5.5]},
    {at: 'end', pos: [0, 1.95, -3.15], look: [0, 1.85, -5.5]}]},
  {shot: 10, loc: 'stage', lift: false, move: 'the clock hits zero', keys: [
    {at: 'start', pos: [0, 2.9, 1.6], look: [0, 3.0, -5]},
    {at: 'end', pos: [0, 2.8, 1.3], look: [0, 2.9, -5]}]},
  {shot: 10, from: 'semua', loc: 'stage', lift: false, move: 'relief... and back to lying', keys: [
    {at: 'start', pos: [0, 1.75, 0.9], look: [0, 1.6, -2.8]},
    {at: 'end', pos: [0, 1.75, 0.7], look: [0, 1.6, -2.8]}]},
  {shot: 11, loc: 'home', lift: false, move: 'the next morning: "pretty?"', keys: [
    {at: 'start', pos: [0, 1.65, -0.4], look: [0, 1.4, -3.2]},
    {at: 'end', pos: [0, 1.65, -0.6], look: [0, 1.4, -3.2]}]},
  {shot: 12, loc: 'home', move: 'the question to the viewer', keys: [
    {at: 'start', pos: [0.55, 1.75, -0.6], look: [0.55, 1.65, -3.0]},
    {at: 'end', pos: [0.55, 1.75, -0.8], look: [0.55, 1.65, -3.0]}]},
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
