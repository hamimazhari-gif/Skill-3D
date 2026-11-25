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
  // Calm camera: slow pushes, close cuts onto the small things (insects, fruit, the midge).
  {shot: 1, loc: 'space', lift: false, move: 'the Earth and its insects', keys: [
    {at: 'start', pos: [0, 1.9, 0.6], look: [0, 1.9, -3.6]},
    {at: 'end', pos: [0, 1.9, 0.1], look: [0, 1.9, -3.6]}]},
  {shot: 2, loc: 'bedroom', lift: false, move: 'no more mosquitoes!', keys: [
    {at: 'start', pos: [-0.4, 1.7, -0.2], look: [-0.5, 1.6, -3.4]},
    {at: 'end', pos: [-0.4, 1.7, -0.45], look: [-0.5, 1.6, -3.4]}]},
  {shot: 2, from: 'hariPertama', loc: 'bedroom', lift: false, move: 'sleeping like in heaven', keys: [
    {at: 'start', pos: [1.05, 1.4, -1.5], look: [1.05, 0.95, -3.7]},
    {at: 'end', pos: [1.05, 1.35, -1.7], look: [1.05, 0.95, -3.7]}]},
  {shot: 3, loc: 'bedroom', lift: false, move: 'the next morning: but...', keys: [
    {at: 'start', pos: [-1.0, 1.7, -0.9], look: [-1.1, 1.6, -3.4]},
    {at: 'end', pos: [-1.0, 1.7, -1.1], look: [-1.1, 1.6, -3.4]}]},
  {shot: 4, loc: 'garden', lift: false, move: 'plants without fruit', keys: [
    {at: 'start', pos: [-0.1, 1.7, 0.2], look: [-0.1, 1.3, -3.4]},
    {at: 'end', pos: [-0.1, 1.7, -0.1], look: [-0.1, 1.3, -3.4]}]},
  {shot: 4, from: 'lebah', loc: 'garden', lift: false, move: 'close: bees and butterflies pollinate', keys: [
    {at: 'start', pos: [0.6, 1.2, -1.4], look: [0.6, 0.85, -3.4]},
    {at: 'end', pos: [0.6, 1.2, -1.6], look: [0.6, 0.85, -3.4]}]},
  {shot: 5, loc: 'market', lift: false, move: 'scarce fruit', keys: [
    {at: 'start', pos: [-0.3, 1.7, 0.3], look: [-0.3, 1.3, -3.2]},
    {at: 'end', pos: [-0.3, 1.7, 0.0], look: [-0.3, 1.3, -3.2]}]},
  {shot: 5, from: 'apel', loc: 'market', lift: false, move: 'close: apples, mangoes, watermelons, tomatoes', keys: [
    {at: 'start', pos: [-0.6, 1.4, -0.3], look: [-0.6, 1.05, -2.6]},
    {at: 'end', pos: [-0.6, 1.4, -0.45], look: [-0.6, 1.05, -2.6]}]},
  {shot: 6, loc: 'choco', lift: false, move: 'chocolate almost gone', keys: [
    {at: 'start', pos: [-0.2, 1.75, 0.2], look: [-0.2, 1.6, -3.6]},
    {at: 'end', pos: [-0.2, 1.75, -0.1], look: [-0.2, 1.6, -3.6]}]},
  {shot: 6, from: 'kakao', loc: 'choco', lift: false, move: 'the cocoa flower and the midge', keys: [
    {at: 'start', pos: [-1.6, 1.15, -1.8], look: [-2.1, 1.15, -3.8]},
    {at: 'end', pos: [-1.65, 1.15, -1.95], look: [-2.1, 1.15, -3.8]}]},
  {shot: 6, from: 'kopi', loc: 'choco', lift: false, move: 'coffee too', keys: [
    {at: 'start', pos: [0.1, 1.7, -0.9], look: [0.2, 1.6, -3.2]},
    {at: 'end', pos: [0.1, 1.7, -1.05], look: [0.2, 1.6, -3.2]}]},
  {shot: 7, loc: 'choco', move: 'close: "mosquitoes, come back!"', keys: [
    {at: 'start', pos: [-0.85, 1.65, -1.5], look: [-0.9, 1.6, -2.8]},
    {at: 'end', pos: [-0.85, 1.65, -1.6], look: [-0.9, 1.6, -2.8]}]},
  {shot: 8, loc: 'pond', lift: false, move: 'the food chain collapses', keys: [
    {at: 'start', pos: [0.4, 1.9, 1.0], look: [0.4, 1.0, -3.6]},
    {at: 'end', pos: [0.4, 1.9, 0.7], look: [0.4, 1.0, -3.6]}]},
  {shot: 8, from: 'burung', loc: 'pond', lift: false, move: 'birds, frogs, lizards, fish', keys: [
    {at: 'start', pos: [-0.4, 1.3, -0.2], look: [-0.4, 0.5, -3.0]},
    {at: 'end', pos: [-0.4, 1.3, -0.4], look: [-0.4, 0.5, -3.0]}]},
  {shot: 8, from: 'terancam', loc: 'pond', lift: false, move: 'the animals that eat them', keys: [
    {at: 'start', pos: [1.6, 1.9, 0.3], look: [1.9, 1.3, -4.0]},
    {at: 'end', pos: [1.6, 1.9, 0.1], look: [1.9, 1.3, -4.0]}]},
  {shot: 9, loc: 'forest', lift: false, move: 'rubbish piles up', keys: [
    {at: 'start', pos: [0, 1.8, 0.6], look: [0, 1.1, -3.6]},
    {at: 'end', pos: [0, 1.8, 0.3], look: [0, 1.1, -3.6]}]},
  {shot: 9, from: 'semut', loc: 'forest', lift: false, move: 'close: ants, termites, dung beetles', keys: [
    {at: 'start', pos: [0.1, 0.9, -1.3], look: [0.1, 0.4, -2.6]},
    {at: 'end', pos: [0.1, 0.9, -1.45], look: [0.1, 0.4, -2.6]}]},
  {shot: 9, from: 'tanpa4', loc: 'forest', lift: false, move: 'it stinks', keys: [
    {at: 'start', pos: [-0.3, 1.75, 0.0], look: [-0.3, 1.4, -3.0]},
    {at: 'end', pos: [-0.3, 1.75, -0.2], look: [-0.3, 1.4, -3.0]}]},
  {shot: 10, loc: 'stage', lift: false, move: 'hidden heroes', keys: [
    {at: 'start', pos: [0, 1.6, 0.4], look: [0, 1.3, -3.6]},
    {at: 'end', pos: [0, 1.55, -0.3], look: [0, 1.2, -3.6]}]},
  {shot: 11, loc: 'bedroom', lift: false, move: '"you may come back... no biting"', keys: [
    {at: 'start', pos: [-1.0, 1.7, -0.8], look: [-1.05, 1.75, -3.4]},
    {at: 'end', pos: [-1.0, 1.7, -1.0], look: [-1.05, 1.75, -3.4]}]},
  {shot: 12, loc: 'stage', lift: false, move: 'which insect helps most?', keys: [
    {at: 'start', pos: [0, 1.8, 0.6], look: [0, 1.7, -3.0]},
    {at: 'end', pos: [0, 1.8, 0.35], look: [0, 1.7, -3.0]}]},
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
