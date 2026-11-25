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

// Word events: [sentenceIndex, word, occurrence]. Story: "Kalau HP bisa ngomong jujur" (Indonesian only; en mirrors id).
const EV_ID = {
  bayangkan: [0, 'bayangkan'], jujur: [0, 'jujur'], halo: [1, 'halo'], protes: [1, 'protes'],
  hariIni: [2, 'hari'], aplikasi: [2, 'aplikasi'], empat: [2, 'empat'], isinya: [3, 'isinya'], cari: [4, 'cari'],
  sembilan: [5, 'sembilan'], kantoran: [6, 'kantoran'], digaji: [7, 'digaji'],
  galeri: [8, 'galeriku'], selfie: [8, 'selfie'], derajat: [9, 'derajat'], penuh: [10, 'penuh'], hapus: [11, 'hapus'],
  keranjang: [12, 'keranjang'], saldo: [13, 'saldo'], ribu: [13, 'ribu'], doa: [14, 'doa'],
  baterai: [15, 'baterai'], persen: [15, 'persen'], sekarat: [16, 'sekarat'], game: [17, 'game'], sayang: [18, 'sayang'],
  terdiam: [19, 'terdiam'], lagi: [20, 'lagi'], pelan: [21, 'pelan'], satuLagi: [22, 'satu'], ibumu: [23, 'ibumu'], tigaKali: [23, 'tiga'], geser: [24, 'geser'],
  waktu: [25, 'waktu'], tigaMenit: [25, 'tiga'], dia: [25, 'dia'], meletakkan: [26, 'meletakkan'], menelepon: [27, 'menelepon'], haloBu: [28, 'halo'], maaf: [28, 'maaf'],
  kadang: [29, 'kadang'], aplikasinya: [29, 'aplikasinya'], orang: [30, 'orang'], kalau: [31, 'kalau'], protes2: [31, 'protes'], komentar: [32, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {opened: 'DIBUKA 47x', hours: '9 JAM / HARI', office: 'JAM KANTOR: 8 JAM', unpaid: 'GAJI: Rp0', gallery: 'GALERI: 300 SELFIE', full: 'MEMORI PENUH!',
  cart: 'KERANJANG: 27 BARANG', balance: 'SALDO: Rp12.000', battery: '1%', missed: 'IBU — 3 PANGGILAN TAK TERJAWAB', nine: '9 JAM', three: '3 MENIT',
  question: 'HP-MU BAKAL PROTES SOAL APA?', comment: 'TULIS DI KOMENTAR!'};
export const LABELS = {id: L_ID, en: L_ID};
