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

// Word events: [sentenceIndex, word, occurrence]. Story: "Kalau emak-emak jadi presiden" (Indonesian only; en mirrors id).
const EV_ID = {
  bayangkan: [0, 'bayangkan'], emak0: [0, 'emak'], presiden0: [0, 'presiden'], berubah: [1, 'berubah'], total: [1, 'total'],
  pertama: [2, 'pertama'], rapat: [2, 'rapat'], lima: [2, 'lima'], menit: [2, 'menit'],
  pakMenteri: [3, 'menteri'], muter: [3, 'muter'], intinya: [4, 'intinya'], mau: [5, 'mau'], enggak: [5, 'enggak'],
  kedua: [6, 'kedua'], cabai: [6, 'cabai'], stabil: [6, 'stabil'], pedagang: [7, 'pedagang'], menang: [7, 'menang'], ditawar: [7, 'ditawar'],
  limaBelas: [8, 'lima'], bang: [8, 'bang'], kalauNggak: [9, 'kalau'], pindah: [9, 'pindah'], sebelah: [9, 'sebelah'],
  ketiga: [10, 'ketiga'], telat: [10, 'telat'], namaLengkap: [10, 'nama'], bambang: [11, 'bambang'], jam: [12, 'jam'],
  seluruh: [13, 'seluruh'], tegak: [13, 'tegak'],
  keempat: [14, 'keempat'], anggaran: [14, 'anggaran'], buku: [14, 'buku'], kartun: [14, 'kartun'], sisanya: [15, 'sisanya'], kaleng: [16, 'kaleng'], bukan: [17, 'bukan'], uang: [17, 'uang'],
  lalu: [18, 'lalu'], kebijakan: [18, 'kebijakan'], lampu: [19, 'lampu'], dimatikan: [19, 'dimatikan'], kantong: [20, 'kantong'], segitiga: [20, 'segitiga'], siapa: [20, 'siapa'],
  hilang: [21, 'hilang'], ketemu: [21, 'ketemu'], nyari: [21, 'nyari'],
  makanya: [22, 'makanya'], mata: [22, 'mata'], mulut: [22, 'mulut'],
  tapi: [23, 'tapi'], sebenarnya: [23, 'sebenarnya'], sudah: [23, 'sudah'], rumah: [24, 'rumah'],
  keuangan: [25, 'keuangan'], makanan: [25, 'makanan'], kesehatan: [25, 'kesehatan'], semua: [25, 'semua'], setiap: [26, 'setiap'], cuti: [26, 'cuti'],
  emakmu: [27, 'emakmu'], kebijakan2: [27, 'kebijakan'], komentar: [28, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {banner: 'PRESIDEN: EMAK', podium: 'PRESIDEN', change: 'BERUBAH TOTAL!', screen: 'RENCANA STRATEGIS', timer: 'MAKS. 5 MENIT',
  cabinet: 'RAPAT KABINET', price0: 'Rp80.000', price1: 'Rp15.000', stable: 'HARGA CABAI: STABIL', neighbor: 'SEBELAH',
  bambang: 'BAMBANG SUTRISNO WIJAYA', book: 'ANGGARAN\nNEGARA', tin: 'BISKUIT', policy: 'KEBIJAKAN BARU', rule1: '1. MATIKAN LAMPU', rule2: '2. LIPAT KANTONG',
  found: 'KETEMU!', home: 'PRESIDEN DI RUMAH', money: 'KEUANGAN', food: 'MAKANAN', health: 'KESEHATAN', all: 'SEMUA ORANG', noLeave: 'TANPA CUTI',
  question: 'KEBIJAKAN PERTAMANYA?', comment: 'TULIS DI KOMENTAR!'};
export const LABELS = {id: L_ID, en: L_ID};
