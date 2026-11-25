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

// Word events: [sentenceIndex, word, occurrence]. Story: "Kalau semua serangga punah" (Indonesian only; en mirrors id).
const EV_ID = {
  bagaimana: [0, 'bagaimana'], serangga0: [0, 'serangga'], bumi: [0, 'bumi'], punah: [0, 'punah'],
  akhirnya: [1, 'akhirnya'], nyamuk1: [1, 'nyamuk'], tidur: [1, 'tidur'], obat: [1, 'obat'],
  hariPertama: [2, 'hari'], surga: [2, 'surga'], tapi: [3, 'tapi'], bertahan: [3, 'bertahan'],
  masalah1: [4, 'masalah'], tanaman: [4, 'tanaman'], berbuah: [4, 'berbuah'],
  lebah: [5, 'lebah'], kupu: [5, 'kupu'], seranggaLain: [5, 'serangga'], menyerbuki: [5, 'menyerbuki'], bunga: [5, 'bunga'],
  tanpa1: [6, 'tanpa'], langka: [6, 'langka'], apel: [7, 'apel'], mangga: [7, 'mangga'], semangka: [7, 'semangka'], tomat: [7, 'tomat'],
  masalah2: [8, 'masalah'], menyakitkan: [8, 'menyakitkan'], cokelat: [8, 'cokelat'], hilang: [8, 'hilang'],
  kakao: [9, 'kakao'], agas: [9, 'agas'], kopi: [10, 'kopi'], berkurang: [10, 'berkurang'],
  apa: [11, 'apa'], nggakAda: [11, 'nggak'], kembalilah: [11, 'kembalilah'],
  masalah3: [12, 'masalah'], runtuh: [12, 'runtuh'], burung: [13, 'burung'], katak: [13, 'katak'], kadal: [13, 'kadal'], ikan: [13, 'ikan'], makanS: [13, 'makan'],
  kelaparan: [14, 'kelaparan'], lalu: [15, 'lalu'], terancam: [15, 'terancam'],
  masalah4: [16, 'masalah'], menumpuk: [16, 'menumpuk'], semut: [17, 'semut'], rayap: [17, 'rayap'], kumbang: [17, 'kumbang'], mengurai: [17, 'mengurai'], daun: [17, 'daun'], bangkai: [17, 'bangkai'],
  tanpa4: [18, 'tanpa'], bau: [18, 'bau'],
  ternyata: [19, 'ternyata'], usir: [19, 'usir'], pahlawan: [19, 'pahlawan'], hidup: [19, 'hidup'],
  yaSudah: [20, 'sudah'], boleh: [20, 'boleh'], jangan: [20, 'jangan'], gigit: [20, 'gigit'],
  seranggaApa: [21, 'serangga'], berjasa: [21, 'berjasa'], tulis: [22, 'tulis'], komentar: [22, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {gone: 'SERANGGA PUNAH!', heaven: 'SURGA!', zzz: 'Zzz...', m1: 'MASALAH 1', m2: 'MASALAH 2', m3: 'MASALAH 3', m4: 'MASALAH 4',
  noFruit: 'NGGAK BERBUAH', scarce: 'LANGKA', apel: 'APEL', mangga: 'MANGGA', semangka: 'SEMANGKA', tomat: 'TOMAT', empty: 'HABIS',
  choco: 'COKELAT', chocoGone: 'COKELAT HAMPIR HILANG', midge: 'AGAS', coffee: 'PANEN KOPI BERKURANG', chain: ['SERANGGA', 'KATAK', 'ULAR', 'ELANG'],
  hungry: 'LAPAR...', threat: 'IKUT TERANCAM', pile: 'SAMPAH ALAM MENUMPUK', smell: 'BAU!', hero: 'PAHLAWAN TERSEMBUNYI', ok: 'BOLEH KEMBALI', noBite: 'JANGAN GIGIT!',
  question: 'SERANGGA PALING BERJASA?', comment: 'TULIS DI KOMENTAR!', shop: 'TOKO COKELAT'};
export const LABELS = {id: L_ID, en: L_ID};
