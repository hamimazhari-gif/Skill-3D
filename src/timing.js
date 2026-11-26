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

// Word events: [sentenceIndex, word, occurrence]. Story: "Mata kedutan" (Indonesian only; en mirrors id).
const EV_ID = {
  tiba: [0, 'tiba'], kelopak: [0, 'kelopak'], dug: [1, 'dug'], peramal: [2, 'peramal'],
  wah: [3, 'wah'], rezeki: [3, 'rezeki'], bukan: [4, 'bukan'], jauh: [4, 'jauh'], kiri: [5, 'kiri'], sedih: [5, 'sedih'],
  kepercayaan: [6, 'kepercayaan'], tapi: [7, 'tapi'], ilmu: [7, 'ilmu'],
  otot: [8, 'otot'], tanpa: [8, 'tanpa'], korsleting: [9, 'korsleting'], saraf: [9, 'saraf'],
  penyebab: [10, 'penyebab'], dekat: [10, 'dekat'], stres: [11, 'stres'], kurang: [12, 'kurang'], kopi: [13, 'kopi'], layar: [14, 'layar'], laptop: [14, 'laptop'],
  kabar: [15, 'kabar'], berbahaya: [15, 'berbahaya'], hilang: [15, 'hilang'], caranya: [16, 'caranya'], tidur2: [16, 'tidur'], kurangi: [16, 'kurangi'], istirahatkan: [16, 'istirahatkan'],
  tapi2: [17, 'tapi'], minggu: [17, 'minggu'], tertutup: [17, 'tertutup'], menjalar: [17, 'menjalar'], dokter: [17, 'dokter'],
  jadi: [18, 'jadi'], menunggu: [18, 'menunggu'], datang: [18, 'datang'], eh: [19, 'eh'], kerjaan: [19, 'kerjaan'], malam: [19, 'malam'],
  ternyata: [20, 'ternyata'], lemburan: [20, 'lemburan'], kalau: [21, 'kalau'], komentar: [22, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {rezeki: 'REZEKI?', jauh: 'KETEMU ORANG JAUH?', sedih: 'MAU SEDIH?', otot: 'OTOT KELOPAK MATA', short: 'KORSLETING SARAF',
  stres: 'STRES', tidur: 'KURANG TIDUR', kopi: 'KOPI', layar: 'LAYAR', safe: 'BIASANYA AMAN', fix1: 'TIDUR CUKUP', fix2: 'KURANGI KOPI', fix3: 'ISTIRAHATKAN MATA',
  w1: '> BEBERAPA MINGGU', w2: 'KELOPAK TERTUTUP', w3: 'MENJALAR KE WAJAH', doctor: 'PERIKSA KE DOKTER', lembur: 'LEMBUR!', question: 'KEDUTAN = PERTANDA APA?', comment: 'TULIS DI KOMENTAR!'};
export const LABELS = {id: L_ID, en: L_ID};
