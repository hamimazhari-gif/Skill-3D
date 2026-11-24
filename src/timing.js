// Sentence timing -> shot cuts and word times, per language.
import EN from './data/sentence_times_en.json';
import ID from './data/sentence_times_id.json';

export const FPS = 30;
export const SHOTS = 12;
export const TAIL = 0.7; // hold after the last word

const DATA = {en: EN, id: ID};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// Map a fraction of a sentence's letters to a time, spreading the letters over its voiced segments only.
export function voicedAt(s, f) {
  const segs = s.voiced && s.voiced.length ? s.voiced : [[s.start, s.end]];
  const V = segs.reduce((a, [x, y]) => a + y - x, 0);
  let r = f * V;
  for (const [x, y] of segs) { if (r < y - x - 1e-6) return x + r; r -= y - x; }
  return segs[segs.length - 1][1];
}

// Time of the letter at offset `before` (letters only) inside sentence s. When the sentence has as many
// punctuation-separated phrases as voiced segments, each phrase is placed in its own segment; otherwise the
// letters are spread over the voiced parts.
export function letterTime(s, before) {
  const toks = s.text.split(/\s+/).filter(Boolean);
  const phrases = []; let cur = 0;
  toks.forEach((tk, i) => { cur += norm(tk).replace(/ /g, '').length; if (/[,.!?…:;]["”']?$/.test(tk) || i === toks.length - 1) { phrases.push(cur); cur = 0; } });
  const total = phrases.reduce((a, b) => a + b, 0) || 1;
  const segs = s.voiced && s.voiced.length ? s.voiced : [[s.start, s.end]];
  if (phrases.length === segs.length) {
    let acc = 0;
    for (let i = 0; i < phrases.length; i++) {
      if (before < acc + phrases[i] || i === phrases.length - 1) return segs[i][0] + (segs[i][1] - segs[i][0]) * Math.min(1, (before - acc) / phrases[i]);
      acc += phrases[i];
    }
  }
  return voicedAt(s, before / total);
}

export function makeTiming(lang) {
  const d = DATA[lang];
  const S = d.sentences;
  const total = d.duration + TAIL;
  const CUTS = [0];
  for (let k = 2; k <= SHOTS; k++) {
    const i = S.findIndex((s) => s.shot === k);
    CUTS.push((S[i - 1].end + S[i].start) / 2);
  }
  CUTS.push(total);
  // time of the start of a word inside sentence si (proportional by letters over the voiced parts, pauses skipped)
  function wt(si, word, occ = 0) {
    const s = S[si];
    const text = norm(s.text);
    const letters = text.replace(/ /g, '');
    let idx = -1, from = 0;
    const w = norm(word);
    for (let k = 0; k <= occ; k++) { idx = text.indexOf(w, from); from = idx + 1; }
    if (idx < 0) throw new Error(`word "${word}" not in sentence ${si} (${lang})`);
    const before = text.slice(0, idx).replace(/ /g, '').length;
    return letterTime(s, before);
  }
  function shotOf(t) { for (let k = SHOTS; k >= 1; k--) if (t >= CUTS[k - 1]) return k; return 1; }
  return {S, total, CUTS, wt, shotOf, frames: Math.ceil(total * FPS)};
}

// Word events: [sentenceIndex, word, occurrence]. Story: "Misi beli telur" (Indonesian only; en mirrors id).
const EV_ID = {
  misi: [0, 'misi'],
  telur: [0, 'telur'],
  modal: [1, 'modal'],
  lima: [1, 'lima'],
  sulit: [2, 'kesulitan'],
  mustahil: [2, 'mustahil'],
  ma1: [3, 'pa'],
  jangan: [3, 'jangan'],
  tenang: [4, 'tenang'],
  menit: [4, 'menit'],
  lv1: [5, 'level'],
  roti: [5, 'roti'],
  panggang: [6, 'memanggang'],
  pintu: [6, 'pintu'],
  wangi: [7, 'wanginya'],
  lapar: [7, 'lapar'],
  banyak: [7, 'banyak'],
  satuRoti: [8, 'satu'],
  tenaga: [8, 'tenaga'],
  lv2: [9, 'level'],
  snack: [9, 'snack'],
  ujung: [10, 'ujung'],
  lorong: [11, 'lorong'],
  tol: [11, 'tol'],
  lv3: [12, 'level'],
  ilusi: [12, 'ilusi'],
  label: [13, 'label'],
  sembilan: [13, 'sembilan'],
  otak: [14, 'otakmu'],
  ribuan: [14, 'ribuan'],
  padahal: [15, 'padahal'],
  hampir: [15, 'hampir'],
  lv4: [16, 'level'],
  spg: [16, 'spg'],
  tester: [17, 'tester'],
  senyum: [17, 'senyum'],
  nggakEnak: [17, 'enak'],
  yaudah: [18, 'ya'],
  dua: [18, 'dua'],
  final: [19, 'final'],
  kasir: [19, 'kasir'],
  permen: [20, 'permen'],
  antrean: [20, 'antrean'],
  anak: [21, 'anakmu'],
  coklat1: [22, 'cokelat'],
  coklat2: [22, 'cokelat', 1],
  nyawa: [23, 'nyawa'],
  pahlawan: [24, 'pahlawan'],
  kantong: [24, 'kantong'],
  mana: [25, 'mana'],
  gameover: [26, 'game'],
  tips: [27, 'tips'],
  daftar: [27, 'daftar'],
  lapar2: [27, 'lapar'],
  rak: [27, 'rak'],
  levelBerapa: [28, 'level'],
  komentar: [28, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {mission: 'MISI: BELI TELUR', money: 'MODAL Rp50.000', hard: 'KESULITAN: MUSTAHIL', bakery: 'ROTI HANGAT', tol: 'TOL SNACK', eggs: 'TELUR', km: 'TELUR 5 KM',
  brain: '40-AN?', real: 'HAMPIR 50 RIBU!', spg: 'GRATIS!', kasir: 'KASIR', list: 'DAFTAR BELANJA', listLines: ['1. Telur', '(cuma itu)'],
  tip1: 'TULIS DAFTAR', tip2: 'JANGAN LAPAR', tip3: 'LANGSUNG KE RAK', question: 'LEVEL BERAPA?', comment: 'KOMENTAR!'};
export const LABELS = {id: L_ID, en: L_ID};
