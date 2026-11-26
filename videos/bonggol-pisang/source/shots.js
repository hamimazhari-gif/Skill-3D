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
  // 1 kebun (pale, sad): close-up of Darto's gloomy face, pulling back to reveal the DIJUAL sign on the fence behind him
  {shot: 1, loc: 'kebun', move: 'close-up, slow pull back + drift left', keys: [
    {at: 'start', pos: [0.15, 1.45, 0.75], look: [-0.25, 1.4, -0.5]},
    {at: 'end', pos: [0.2, 1.48, 1.45], look: [-0.45, 1.38, -0.6]}]},
  // 2 kebun: macro on a stunted seedling, slow track along the yellowing row, empty wallet + sacks, crying close-up
  {shot: 2, loc: 'kebun', lift: false, move: 'macro push on a stunted seedling', keys: [
    {at: 'start', pos: [1.35, 0.6, 1.55], look: [0.85, 0.38, 0.5]},
    {at: 'end', pos: [1.12, 0.5, 1.22], look: [0.85, 0.36, 0.5]}]},
  {shot: 2, from: 'menguning', loc: 'kebun', lift: false, move: 'slow low track along the row of seedlings', keys: [
    {at: 'start', pos: [0.7, 0.72, -0.2], look: [1.2, 0.35, -1.5]},
    {at: 'end', pos: [2.4, 0.72, -0.2], look: [2.9, 0.35, -1.5]}]},
  {shot: 2, from: 'uang', loc: 'kebun', move: 'medium: empty wallet beside the sacks', keys: [
    {at: 'start', pos: [-0.45, 1.5, 2.9], look: [-0.45, 1.0, -0.4]},
    {at: 'end', pos: [-0.5, 1.42, 2.35], look: [-0.45, 1.0, -0.4]}]},
  {shot: 2, from: 'kecewa', loc: 'kebun', move: 'close-up: crying', keys: [
    {at: 'start', pos: [0.0, 1.45, 0.85], look: [-0.15, 1.4, -0.25]},
    {at: 'end', pos: [-0.05, 1.42, 0.62], look: [-0.15, 1.4, -0.25]}]},
  // 3 tepi (sunset): establish the pile and the sitting farmer, low over the pile, sad close-up
  {shot: 3, loc: 'tepi', lift: false, move: 'crane down', keys: [
    {at: 'start', pos: [2.6, 3.0, 5.2], look: [0, 0.9, -1.2]},
    {at: 'end', pos: [0.8, 1.6, 2.6], look: [0, 1.05, -1.0]}]},
  {shot: 3, from: 'menatap', loc: 'tepi', lift: false, move: 'low over the trunk pile up to Darto', keys: [
    {at: 'start', pos: [0.75, 0.75, 1.9], look: [0.0, 0.85, -0.8]},
    {at: 'end', pos: [0.45, 0.85, 1.35], look: [0.0, 1.0, -0.9]}]},
  {shot: 3, from: 'ditebang', loc: 'tepi', lift: false, move: 'close-up: sad', keys: [
    {at: 'start', pos: [0.25, 1.4, 0.35], look: [0, 1.35, -1.05]},
    {at: 'end', pos: [0.2, 1.38, 0.18], look: [0, 1.35, -1.05]}]},
  // 4 tepi: Kakek Rahmat walks in from the side, low angle on the old farmer, two-shot laugh
  {shot: 4, loc: 'tepi', move: 'track left with Kakek', keys: [
    {at: 'start', pos: [-3.2, 1.6, 2.8], look: [-4.2, 1.15, -0.6]},
    {at: 'lewat', pos: [-1.9, 1.55, 2.7], look: [-2.3, 1.12, -0.6]},
    {at: 'end', pos: [-0.9, 1.5, 2.6], look: [-1.0, 1.1, -0.7]}]},
  {shot: 4, from: 'empat', loc: 'tepi', move: 'low angle on Kakek', keys: [
    {at: 'start', pos: [-1.05, 1.0, 0.75], look: [-1.35, 1.55, -0.55]},
    {at: 'end', pos: [-1.0, 1.05, 0.55], look: [-1.35, 1.55, -0.55]}]},
  {shot: 4, from: 'tertawa', loc: 'tepi', move: 'two-shot', keys: [
    {at: 'start', pos: [-0.5, 1.5, 2.2], look: [-0.65, 1.2, -0.8]},
    {at: 'end', pos: [-0.55, 1.45, 1.8], look: [-0.65, 1.2, -0.8]}]},
  // 5 tepi: Kakek talks, Darto jumps up on "emasnya", fast zoom onto the glowing bonggol ("ting!")
  {shot: 5, loc: 'tepi', move: 'close-up Kakek talking', keys: [
    {at: 'start', pos: [-1.05, 1.5, 0.75], look: [-1.35, 1.4, -0.55]},
    {at: 'end', pos: [-1.1, 1.48, 0.55], look: [-1.35, 1.4, -0.55]}]},
  {shot: 5, from: 'emas', loc: 'tepi', move: 'Darto shoots up', keys: [
    {at: 'start', pos: [0.2, 1.35, 1.6], look: [0, 1.25, -1.0]},
    {at: 'end', pos: [0.25, 1.5, 1.2], look: [0, 1.4, -1.0]}]},
  {shot: 5, from: 'menunjuk', loc: 'tepi', lift: false, move: 'Kakek points, fast zoom to the golden bonggol', keys: [
    {at: 'start', pos: [-0.3, 1.45, 2.8], look: [0.3, 1.0, -0.5]},
    {at: 'bonggol', pos: [-0.1, 1.4, 2.6], look: [0.6, 0.85, -0.4]},
    {at: 'end', pos: [1.6, 0.8, 1.2], look: [1.85, 0.3, -0.05]}]},
  // 6 teras (night, oil lamp): crane to the two of them seated at the table, push to the recipe board
  {shot: 6, loc: 'teras', move: 'crane down', keys: [
    {at: 'start', pos: [1.8, 2.5, 4.2], look: [0.2, 1.0, -2.0]},
    {at: 'end', pos: [0.5, 1.45, 2.1], look: [0.3, 1.05, -1.8]}]},
  {shot: 6, from: 'resep', loc: 'teras', lift: false, move: 'push to the RESEP LAMA board', keys: [
    {at: 'start', pos: [-0.8, 1.7, 0.9], look: [-1.6, 1.65, -2.9]},
    {at: 'end', pos: [-1.2, 1.72, 0.2], look: [-1.75, 1.7, -2.9]}]},
  // 7 teras: the bonggol on the board, then macro on the hands chopping
  {shot: 7, loc: 'teras', move: 'medium push on the table', keys: [
    {at: 'start', pos: [-0.1, 1.35, 1.2], look: [-0.3, 0.85, -1.4]},
    {at: 'end', pos: [-0.3, 1.25, 0.75], look: [-0.4, 0.85, -1.35]}]},
  {shot: 7, from: 'cacah', loc: 'teras', lift: false, move: 'macro: hands chopping on the board', keys: [
    {at: 'start', pos: [-0.1, 1.2, 0.25], look: [-0.5, 0.75, -1.3]},
    {at: 'end', pos: [-0.18, 1.15, 0.05], look: [-0.5, 0.75, -1.3]}]},
  // 8 teras: palm sugar, then macro on the bucket (sugar drops in, stirred)
  {shot: 8, loc: 'teras', move: 'medium on the sugar + Darto', keys: [
    {at: 'start', pos: [0.75, 1.3, 1.1], look: [0.55, 0.85, -1.4]},
    {at: 'end', pos: [0.62, 1.22, 0.7], look: [0.5, 0.85, -1.4]}]},
  {shot: 8, from: 'lima', loc: 'teras', lift: false, move: 'macro: bucket', keys: [
    {at: 'start', pos: [0.95, 1.15, -0.15], look: [0.84, 0.78, -1.2]},
    {at: 'end', pos: [0.9, 1.1, -0.35], look: [0.83, 0.78, -1.2]}]},
  // 9 teras: jerrycan, calendar days flip, macro on the cap + gas
  {shot: 9, loc: 'teras', move: 'medium two-shot, push', keys: [
    {at: 'start', pos: [0.4, 1.45, 2.0], look: [0.35, 0.95, -1.5]},
    {at: 'end', pos: [0.35, 1.35, 1.35], look: [0.35, 0.95, -1.5]}]},
  {shot: 9, from: 'keempat', loc: 'teras', move: 'track right to the calendar', keys: [
    {at: 'start', pos: [0.5, 1.3, 0.6], look: [0.6, 1.15, -2.2]},
    {at: 'end', pos: [1.1, 1.45, 0.4], look: [1.5, 1.4, -2.4]}]},
  {shot: 9, from: 'buka', loc: 'teras', lift: false, move: 'macro: cap + gas', keys: [
    {at: 'start', pos: [0.5, 1.2, -0.05], look: [0.15, 1.0, -1.38]},
    {at: 'end', pos: [0.45, 1.22, -0.25], look: [0.15, 1.02, -1.38]}]},
  // 10 teras: close-up of Kakek smiling with two fingers up, the circled 14, the tape, Darto excited
  {shot: 10, loc: 'teras', move: 'close-up Kakek with the V sign', keys: [
    {at: 'start', pos: [0.2, 1.35, -0.35], look: [0.1, 1.3, -1.9]},
    {at: 'end', pos: [0.17, 1.35, -0.55], look: [0.1, 1.3, -1.9]}]},
  {shot: 10, from: 'duaminggu', loc: 'teras', lift: false, move: 'push to the calendar', keys: [
    {at: 'start', pos: [1.6, 1.75, -1.15], look: [1.95, 1.65, -2.9]},
    {at: 'end', pos: [1.75, 1.72, -1.5], look: [1.95, 1.65, -2.9]}]},
  {shot: 10, from: 'bau', loc: 'teras', move: 'two-shot over the tape', keys: [
    {at: 'start', pos: [0.55, 1.25, 1.0], look: [0.45, 0.9, -1.4]},
    {at: 'end', pos: [0.6, 1.15, 0.55], look: [0.55, 0.85, -1.35]}]},
  {shot: 10, from: 'jadi', loc: 'teras', move: 'close-up Darto', keys: [
    {at: 'start', pos: [1.05, 1.25, -0.6], look: [0.98, 1.2, -1.9]},
    {at: 'end', pos: [1.08, 1.27, -0.75], look: [0.98, 1.2, -1.9]}]},
  // 11 pagi (dawn): establish with the calendar racing to 14, macro on the cap popping, close-up of the smell
  {shot: 11, loc: 'pagi', move: 'crane down to the calendar', keys: [
    {at: 'start', pos: [2.4, 2.6, 4.2], look: [0, 1.0, -1.6]},
    {at: 'end', pos: [1.1, 1.6, 1.4], look: [0.55, 1.25, -2.0]}]},
  {shot: 11, from: 'membuka', loc: 'pagi', lift: false, move: 'macro: the jerrycan opens', keys: [
    {at: 'start', pos: [0.95, 1.05, 0.45], look: [0.4, 0.8, -0.85]},
    {at: 'end', pos: [0.85, 1.0, 0.25], look: [0.35, 0.85, -0.85]}]},
  {shot: 11, from: 'asam', loc: 'pagi', move: 'close-up: eyes light up', keys: [
    {at: 'start', pos: [0.15, 1.4, 0.0], look: [-0.1, 1.3, -1.35]},
    {at: 'end', pos: [0.12, 1.42, -0.15], look: [-0.1, 1.3, -1.35]}]},
  // 12 kebun (morning, still pale): a glass of MOL into the bucket, then macro on the watering
  {shot: 12, loc: 'kebun', move: 'medium push: glass into the bucket', keys: [
    {at: 'start', pos: [0.95, 1.5, 1.2], look: [0.45, 0.95, -2.1]},
    {at: 'end', pos: [0.8, 1.38, 0.6], look: [0.45, 0.9, -2.1]}]},
  {shot: 12, from: 'menyiram', loc: 'kebun', lift: false, move: 'low on the watering', keys: [
    {at: 'start', pos: [1.6, 1.0, 0.3], look: [0.9, 0.6, -1.5]},
    {at: 'end', pos: [1.4, 0.85, 0.05], look: [0.9, 0.55, -1.5]}]},
  // 13 kebun: time-lapse crane up as the garden turns green, macro on the roots
  {shot: 13, loc: 'kebun', lift: false, move: 'crane up over the greening beds', keys: [
    {at: 'start', pos: [0.5, 0.65, 0.4], look: [1.2, 0.45, -2.8]},
    {at: 'end', pos: [0.4, 2.5, 2.6], look: [-0.3, 0.6, -3.0]}]},
  {shot: 13, from: 'akar', loc: 'kebun', lift: false, move: 'macro: roots in the jar', keys: [
    {at: 'start', pos: [-1.0, 0.78, 1.35], look: [-1.45, 0.62, 0.35]},
    {at: 'end', pos: [-1.1, 0.74, 1.1], look: [-1.45, 0.62, 0.35]}]},
  // 14 kebun (green): Darto pulls the DIJUAL sign out, smiling; then the MOL jerrycans + basket of bonggol
  {shot: 14, loc: 'kebun', move: 'medium: pulling the sign', keys: [
    {at: 'start', pos: [-0.6, 1.55, 2.4], look: [-0.75, 1.15, -0.6]},
    {at: 'end', pos: [-0.65, 1.5, 1.9], look: [-0.7, 1.1, -0.6]}]},
  {shot: 14, from: 'sejak', loc: 'kebun', move: 'medium: MOL jerrycans + basket', keys: [
    {at: 'start', pos: [1.0, 1.4, 2.0], look: [1.35, 0.9, -0.5]},
    {at: 'end', pos: [1.25, 1.3, 1.5], look: [1.4, 0.85, -0.5]}]},
  // 15 kebun (golden hour): the softly glowing bonggol, the two friends cheer, pull back + crane up for the icons
  {shot: 15, loc: 'kebun', lift: false, move: 'macro: glowing bonggol basket', keys: [
    {at: 'start', pos: [1.6, 0.8, 1.1], look: [1.15, 0.42, -0.05]},
    {at: 'end', pos: [1.48, 0.72, 0.82], look: [1.15, 0.42, -0.05]}]},
  {shot: 15, from: 'penyelamat', loc: 'kebun', move: 'low angle two-shot, basket in the foreground', keys: [
    {at: 'start', pos: [0.35, 0.75, 1.55], look: [0.05, 1.45, -0.5]},
    {at: 'end', pos: [0.3, 0.8, 1.35], look: [0.05, 1.5, -0.5]}]},
  {shot: 15, from: 'simpan', loc: 'kebun', move: 'pull back + crane up', keys: [
    {at: 'start', pos: [0.05, 1.55, 2.2], look: [0.05, 1.35, -0.7]},
    {at: 'end', pos: [0.6, 3.5, 5.2], look: [0, 1.0, -2.2]}]},
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
