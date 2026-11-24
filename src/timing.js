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

// Word events: [sentenceIndex, word, occurrence]. Story: "Menjual Menara Eiffel" (Indonesian only; en mirrors id).
const EV_ID = {
  koper: [0, 'koper'], tangan: [0, 'tangan'], pria: [1, 'pria'], menjual: [1, 'menjual'], eiffel1: [1, 'eiffel'],
  bagaimana: [2, 'bagaimana'], mundur: [3, 'mundur'], minggu: [3, 'minggu'],
  paris: [4, 'paris'], tahun: [4, 'tahun'], victor: [5, 'victor'], penipu: [5, 'penipu'], koran: [5, 'koran'], berkarat: [5, 'berkarat'], biaya: [5, 'biaya'], mahal: [5, 'mahal'],
  berbinar: [6, 'berbinar'], kalau: [7, 'kalau'], kujual: [7, 'kujual'],
  palsu: [8, 'memalsukan'], menyamar: [8, 'menyamar'], mengundang: [8, 'mengundang'], lima: [8, 'lima'], hotel: [8, 'hotel'],
  tuan: [9, 'tuan'], dibongkar: [9, 'dibongkar'], besi: [9, 'besi'], ingat: [10, 'ingat'], rahasia: [10, 'rahasia'], jangan: [11, 'jangan'],
  termakan: [12, 'termakan'], poisson: [13, 'poisson'], istri: [14, 'istrinya'], curiga: [14, 'curiga'],
  kalauIni: [15, 'kalau'], kenapa: [15, 'kenapa'], rencana: [16, 'rencana'], hancur: [16, 'hancur'],
  jenius: [17, 'jenius'], diam: [17, 'diam'], sogokan: [17, 'sogokan'], lega: [18, 'lega'], oh: [19, 'oh'], asli: [19, 'asli'],
  dibayar: [20, 'dibayar'], kabur: [21, 'kabur'], luar: [21, 'luar'], danPoisson: [22, 'poisson'], malu: [23, 'malu'], polisi1: [23, 'polisi'],
  belum: [24, 'belum'], kembali: [25, 'kembali'], lagi: [25, 'lagi'], korban: [26, 'korbannya'], polisi2: [26, 'polisi'], nyaris: [26, 'nyaris'], tertangkap: [26, 'tertangkap'],
  target: [27, 'target'], komentar: [28, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {sold: 'TERJUAL!', paris: 'PARIS 1925', name: 'VICTOR LUSTIG', conman: 'PENIPU PALING LICIN DI EROPA', kiosk: 'KORAN',
  head: 'MENARA EIFFEL BERKARAT!', sub: 'BIAYA PERAWATAN SANGAT MAHAL', letter: 'SURAT RESMI', seal: 'SAH', hotel: 'GRAND HOTEL PARIS',
  plan: 'BESI TUA', planSub: 'DIJUAL KE PEDAGANG', secret: 'RAHASIA NEGARA', poisson: 'ANDRÉ POISSON', contract: 'KONTRAK', bribe: 'SOGOKAN?',
  train: 'KE LUAR NEGERI', police: 'POLISI', again: 'LAGI?!', question: 'TARGET BERIKUTNYA?', comment: 'TULIS DI KOMENTAR!'};
export const LABELS = {id: L_ID, en: L_ID};
