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

// Word events: [sentenceIndex, word, occurrence]. Story: "Permen karet tertelan" (Indonesian only; en mirrors id).
const EV_ID = {
  ma: [0, 'ma'], ketelan: [0, 'ketelan'], hah: [1, 'hah'], nempel: [1, 'nempel'], tujuhTahun: [1, 'tujuh'],
  kalimat: [2, 'kalimat'], ketakutan: [2, 'ketakutan'], bayangkan: [3, 'bayangkan'], menelan: [3, 'menelan'], sd: [3, 'sd'], keluar: [3, 'keluar'], smp: [3, 'smp'],
  tapi1: [4, 'tapi'], mitos: [4, 'mitos'], fakta: [4, 'fakta'],
  benar: [5, 'benar'], sulit: [5, 'sulit'], kenyal: [6, 'kenyal'], hancur: [6, 'hancur'], cairan: [6, 'cairan'], menguraikan: [6, 'menguraikannya'], biasa: [6, 'biasa'],
  tapi2: [7, 'tapi'], bukan: [7, 'bukan'], menempel: [7, 'menempel'],
  faktanya: [8, 'faktanya'], bergerak: [8, 'bergerak'], mendorong: [8, 'mendorong'], terdorong: [9, 'terdorong'], keluar2: [9, 'keluar'], hari: [9, 'hari'],
  numpang: [10, 'numpang'], turis: [10, 'turis'], pamit: [10, 'pamit'], dadah: [11, 'dadah'],
  hatiHati: [12, 'hati'], banyak: [13, 'banyak'], kebiasaan: [13, 'kebiasaan'], sumbatan: [13, 'sumbatan'], anak: [13, 'anak'], dikunyah: [14, 'dikunyah'], ditelan: [14, 'ditelan'],
  lega: [15, 'lega'], sampai: [15, 'sampai'], ancaman: [15, 'ancaman'], jangan: [16, 'jangan'], biji: [16, 'biji'], pohon: [16, 'pohon'],
  ancaman2: [17, 'ancaman'], percaya: [17, 'percaya'], komentar: [18, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {seven: '7 TAHUN?!', sd: 'KELAS 1 SD', smp: 'SMP', myth: 'MITOS', fact: 'FAKTA', hard: 'SULIT DICERNA', chewy: 'KENYAL', acid: 'CAIRAN LAMBUNG',
  noStick: 'NGGAK MENEMPEL', push: 'TERUS MENDORONG', days: 'BEBERAPA HARI', exit: 'PINTU KELUAR', tour: 'NUMPANG LEWAT', careful: 'HATI-HATI!', block: 'SUMBATAN!',
  chew: 'DIKUNYAH, BUKAN DITELAN', question: 'ANCAMAN EMAK PALING DIPERCAYA?', comment: 'TULIS DI KOMENTAR!'};
export const LABELS = {id: L_ID, en: L_ID};
