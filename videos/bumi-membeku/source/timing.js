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

// Word events: [sentenceIndex, word, occurrence]. Story: "Kalau suhu Bumi turun 30 derajat" (Indonesian only; en mirrors id).
const EV_ID = {
  bagaimana: [0, 'bagaimana'], suhu0: [0, 'suhu'], bumi0: [0, 'bumi'], turun0: [0, 'turun'], tigaPuluh0: [0, 'tiga'],
  indonesia: [1, 'indonesia'], panasnya: [1, 'panasnya'], anjlok: [1, 'anjlok'], nol: [1, 'nol'],
  pertama: [2, 'pertama'], salju: [2, 'salju'], monas: [2, 'monas'], wah: [3, 'wah'], luarNegeri: [3, 'luar'],
  tapi: [4, 'tapi'], sebentar: [4, 'sebentar'], masalah1: [5, 'masalah'], siap: [5, 'siap'], sejuk: [6, 'sejuk'], hangat: [6, 'hangat'],
  pemanas: [7, 'pemanas'], jaket: [7, 'jaket'], keluarga: [8, 'keluarga'], berebut: [8, 'berebut'], magicCom: [8, 'magic'],
  minggir: [9, 'minggir'], giliran: [9, 'giliran'], meluk: [9, 'meluk'],
  masalah2: [10, 'masalah'], padi: [10, 'padi'], gagal: [10, 'gagal'], butuh: [11, 'butuh'], sawah: [12, 'sawah'], membeku: [12, 'membeku'], beras: [12, 'beras'], langka: [12, 'langka'], uduk: [12, 'uduk'], melambung: [12, 'melambung'],
  masalah3: [13, 'masalah'], berbahaya: [13, 'berbahaya'], putih: [14, 'putih'], memantulkan: [14, 'memantulkan'], angkasa: [14, 'angkasa'],
  banyakEs: [15, 'banyak'], diserap: [15, 'diserap'], dingin: [16, 'dingin'], luas: [16, 'luas'], siklus: [17, 'siklus'], berulang: [17, 'berulang'],
  khayalan: [18, 'khayalan'], ilmuwan: [19, 'ilmuwan'], tujuhRatus: [19, 'tujuh'], tertutup: [19, 'tertutup'], bolaSalju: [20, 'bola'],
  perbandingan: [21, 'perbandingan'], zamanEs: [21, 'zaman'], enam: [21, 'enam'], tigaPuluh2: [22, 'tiga'], bencana: [22, 'bencana'],
  lainKali: [23, 'lain'], panas: [23, 'panas'], ingat: [23, 'ingat'], magic2: [23, 'magic'], kalau: [24, 'kalau'], lakukan: [24, 'lakukan'], komentar: [25, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {minus30: '−30°C', temp30: '30°C', temp0: '0°C', m1: 'MASALAH 1', m2: 'MASALAH 2', m3: 'MASALAH 3', notReady: 'RUMAH NGGAK SIAP', noHeater: 'NGGAK ADA PEMANAS',
  noJacket: 'NGGAK ADA JAKET TEBAL', price1: 'NASI UDUK Rp10.000', price2: 'NASI UDUK Rp100.000!', frozen: 'SAWAH MEMBEKU', scarce: 'BERAS LANGKA',
  reflect: 'MEMANTUL', moreIce: 'ES BERTAMBAH', colder: 'MAKIN DINGIN', cycle: 'SIKLUS BERULANG', ago: '±700 JUTA TAHUN LALU', snowball: 'BUMI BOLA SALJU',
  iceAge: 'ZAMAN ES TERAKHIR', now: 'SEKARANG', d6: '−6°C', d30: '−30°C', disaster: 'BENCANA BESAR!', abroad: 'KAYAK DI LUAR NEGERI!',
  question: 'HAL PERTAMA YANG KAMU LAKUKAN?', comment: 'TULIS DI KOMENTAR!', warung: 'WARUNG NASI UDUK'};
export const LABELS = {id: L_ID, en: L_ID};
