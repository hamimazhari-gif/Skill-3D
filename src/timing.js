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

// Word events: [sentenceIndex, word, occurrence]. Story: "Kenapa laut asin" (Indonesian only; en mirrors id).
const EV_ID = {
  pernah: [0, 'pernah'], menelan: [0, 'menelan'], asin: [1, 'asin'], truk: [1, 'truk'],
  tawar: [2, 'tawar'], mengalir: [3, 'mengalir'], beda: [4, 'beda'],
  hujan: [5, 'hujan'], asam: [6, 'asam'], batuan: [6, 'batuan'], melarutkan: [6, 'melarutkan'], garam6: [6, 'garam'],
  kurir: [7, 'kurir'], membawa: [8, 'membawa'], menuju: [8, 'menuju'], paket: [9, 'paket'], tanda: [9, 'tanda'],
  kenapa: [10, 'kenapa'], diganti: [11, 'diganti'], sedikit: [12, 'sedikit'], lidah: [12, 'lidah'],
  tujuan: [13, 'tujuan'], matahari: [14, 'matahari'], awan: [14, 'awan'], garamnya: [15, 'garamnya'], tertinggal: [16, 'tertinggal'],
  kalian: [17, 'kalian'], disini: [17, 'sini'],
  menguap: [18, 'menguap'], turun: [18, 'turun'], jutaan: [18, 'jutaan'], gunung: [19, 'gunung'], akhirnya: [20, 'akhirnya'],
  jumlah: [21, 'jumlah'], dikeruk: [22, 'dikeruk'], disebar: [22, 'disebar'], seratus: [22, 'seratus'], setinggi: [23, 'setinggi'], lantai: [23, 'lantai'],
  nak: [24, 'nak'], secukupnya: [24, 'secukupnya'], jangan: [24, 'jangan'], fakta: [25, 'fakta'], komentar: [26, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {salty: 'ASIN!', fresh: 'TAWAR', acid: 'HUJAN SEDIKIT ASAM', mineral: 'MINERAL LARUT', box: 'GARAM', little: 'GARAM SANGAT SEDIKIT', evap: 'MENGUAP', stays: 'GARAM TERTINGGAL',
  years: 'JUTAAN TAHUN', volcano: 'GUNUNG BAWAH LAUT', m150: '±150 METER', floors: '50 LANTAI', question: 'FAKTA LAUT PALING BIKIN PENASARAN?', comment: 'TULIS DI KOMENTAR!'};
export const LABELS = {id: L_ID, en: L_ID};
