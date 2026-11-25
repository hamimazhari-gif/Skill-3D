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

// Word events: [sentenceIndex, word, occurrence]. Story: "Tubuhmu bukan tubuh yang sama" (Indonesian only; en mirrors id).
const EV_ID = {
  tahukah: [0, 'tahukah'], sekarang: [0, 'sekarang'], bukan0: [0, 'bukan'], tahunLalu: [0, 'tahun'],
  setiap: [1, 'setiap'], pabrik: [1, 'pabrik'], ilmuwan: [2, 'ilmuwan'], tigaRatus: [2, 'tiga'], miliar: [2, 'miliar'], diganti: [2, 'diganti'], setiapHari: [2, 'setiap'],
  paling: [3, 'paling'], usus: [3, 'ususmu'], keras: [4, 'keras'], mencerna: [4, 'mencerna'], beberapa: [4, 'beberapa'], digantiU: [4, 'diganti'],
  kulit: [5, 'kulitmu'], sebulan: [6, 'sebulan'], rontok: [7, 'rontok'], debu: [8, 'debu'], kamu8: [8, 'kamu'],
  ma: [9, 'ma'], disapu: [9, 'disapu'], diriku: [9, 'diriku'],
  darah: [10, 'darah'], empat: [10, 'empat'], pensiun: [10, 'pensiun'], tulang: [11, 'tulangmu'], renovasi: [11, 'direnovasi'], sepuluh: [12, 'sepuluh'], kerangka: [12, 'kerangkamu'],
  tapi: [13, 'tapi'], twist: [13, 'twist'], banyak: [14, 'banyak'], tujuh: [14, 'tujuh'], mitos: [15, 'mitos'],
  otak: [16, 'otakmu'], berpikir: [16, 'berpikir'], kecil: [16, 'kecil'], tua: [16, 'tua'], lensa: [17, 'lensa'],
  berganti: [18, 'berganti'], kenangan: [18, 'kenangan'], tetap: [18, 'tetap'],
  alasan: [19, 'alasan'], bilang: [19, 'bilang'], berubah: [20, 'berubah'], iya: [21, 'iya'], ilmiah: [21, 'ilmiah'],
  fakta: [22, 'fakta'], kaget: [22, 'kaget'], komentar: [23, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {lastYear: '2025', now: '2026', factory: 'PABRIK SEL', count: '330 MILIAR SEL / HARI', gut: 'USUS: BEBERAPA HARI', skin: 'KULIT: ±1 BULAN',
  dust: 'DEBU = KAMU', blood: 'SEL DARAH MERAH: ±4 BULAN', retire: 'PENSIUN!', bone: 'TULANG: ±10 TAHUN', reno: 'SEDANG DIRENOVASI', seven: 'SEMUA SEL GANTI TIAP 7 TAHUN?', myth: 'MITOS!',
  brain: 'SEL OTAK: SEUMUR HIDUP', lens: 'LENSA MATA: SEUMUR HIDUP', question: 'FAKTA TUBUH PALING MENGEJUTKAN?', comment: 'TULIS DI KOMENTAR!'};
export const LABELS = {id: L_ID, en: L_ID};
