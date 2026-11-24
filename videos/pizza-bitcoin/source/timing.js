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

// Word events: [sentenceIndex, word, occurrence]. Story: "Pizza Bitcoin" (Indonesian only; en mirrors id).
const EV_ID = {
  termahal: [0, 'termahal'], harganya1: [1, 'harganya'], triliun0: [1, 'triliun'], bukan: [2, 'bukan'], emas: [2, 'emas'], keju: [2, 'keju'], sosis: [2, 'sosis'],
  tahun: [3, 'tahun'], laszlo0: [3, 'laszlo'], lapar: [3, 'kelaparan'], bitcoin0: [4, 'bitcoin'], digital: [4, 'digital'], harganya: [4, 'harganya'],
  forum: [5, 'forum'], siapa: [6, 'siapa'], duaPizza: [6, 'pizza'], bayar: [7, 'bayar'], sepuluhRibu: [7, 'sepuluh'],
  pemuda: [8, 'pemuda'], menerima: [8, 'menerima'], datang: [9, 'datang'], makan: [9, 'makan'], bahagia: [9, 'bahagia'], empat: [10, 'empat'], dolar: [10, 'dolar'],
  enak: [11, 'enak'], worth: [12, 'worth'],
  tahunDemi: [13, 'tahun'], meroket: [13, 'meroket'], sekarang: [14, 'sekarang'], triliun: [14, 'triliun'],
  rumah: [15, 'rumah'], jet: [15, 'jet'], gorengan: [15, 'gorengan'], awan: [15, 'awan'],
  tunggu: [16, 'tunggu'], twist: [17, 'twist'], ternyata: [18, 'ternyata'], sekali: [18, 'sekali'], seratus: [19, 'seratus'], berkali: [19, 'berkali'],
  pak: [20, 'pak'], cicilan: [20, 'cicilan'],
  geleng: [21, 'geleng'], menyesal: [21, 'menyesal'], dunia: [22, 'dunia'], bayar2: [22, 'bayar'],
  sejak: [23, 'sejak'], mei: [23, 'mei'], pizzaDay: [23, 'pizza'], ingat: [24, 'ingat'], naik: [24, 'naik'], anjlok: [24, 'anjlok'], jangan: [25, 'jangan'], risiko: [25, 'risikonya'],
  nangis: [26, 'nangis'], santai: [26, 'santai'], komentar: [27, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {price: 'Rp10 TRILIUN+', notGold: 'BUKAN EMAS', cheese: 'KEJU', sausage: 'SOSIS', year: '2010', hungry: 'KRUUUK...', cheap: '1 BTC = Rp40',
  post: ['Siapa yang mau', 'kirimin saya 2 pizza?', 'Saya bayar', '10.000 BTC!'], deal: '±$41', yum: 'WORTH IT!', years: '2010 → 2026',
  houses: 'RIBUAN RUMAH', jets: 'PESAWAT JET', gor: 'GORENGAN', wait: 'TUNGGU DULU...', total: '±100.000 BTC', noRegret: 'NGGAK MENYESAL',
  world: 'BITCOIN BISA BUAT BAYAR!', day: 'BITCOIN PIZZA DAY', may: '22 MEI', up: 'NAIK', down: 'ANJLOK', risk: 'PAHAMI RISIKONYA!',
  question: 'NANGIS ATAU SANTAI?', comment: 'TULIS DI KOMENTAR!', museum: 'MUSEUM PIZZA'};
export const LABELS = {id: L_ID, en: L_ID};

export const RECEIPT = 'Rp10.000.000.000.000';
