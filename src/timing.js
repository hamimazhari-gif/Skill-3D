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

// Word events: [sentenceIndex, word, occurrence]. Story: "Gaji lima juta di lima tempat" (Indonesian only; en mirrors id).
const EV_ID = {
  lima: [0, 'lima'],
  gaji: [1, 'gajinya'],
  juta: [1, 'juta'],
  tempat: [2, 'tempat'],
  beda: [3, 'beda'],
  jakarta: [4, 'jakarta'],
  kos: [5, 'kos'],
  ojol: [5, 'ojol'],
  makan: [5, 'makan'],
  kopi: [5, 'kopi'],
  lembur: [5, 'lembur'],
  tgl15: [6, 'tanggal'],
  kurus: [6, 'kurus'],
  tgl20: [7, 'tanggal'],
  mi: [8, 'mi'],
  ayam: [8, 'ayam'],
  sabar: [8, 'kesabaran'],
  bali: [9, 'bali'],
  insta: [10, 'instagram'],
  sunset: [10, 'sunset'],
  mewah: [11, 'mewah'],
  balik: [12, 'balik'],
  nasi: [13, 'nasi'],
  estetik: [13, 'estetik'],
  jogja: [14, 'jogja'],
  angkringan: [15, 'angkringan'],
  ngopi: [15, 'ngopi'],
  malam: [15, 'malam'],
  nabung: [15, 'menabung'],
  hidup: [16, 'hidup'],
  mantan: [16, 'mantan'],
  kota: [17, 'kota'],
  dipanggil: [18, 'dipanggil'],
  bos: [18, 'bos'],
  tetangga: [18, 'tetangga'],
  traktir: [19, 'traktir'],
  desa: [20, 'desa'],
  kebun: [21, 'kebun'],
  biayakos: [21, 'kos'],
  tabungan: [21, 'tabungannya'],
  sultan: [22, 'sultan'],
  masalah: [23, 'masalahnya'],
  halo: [24, 'halo'],
  sinyal: [24, 'sinyalnya'],
  kelapa: [24, 'kelapa'],
  jadi: [25, 'jadi'],
  gajibesar: [25, 'gaji'],
  biaya: [26, 'biaya'],
  gaya: [26, 'gaya'],
  menurut: [27, 'menurut'],
  kotamana: [27, 'kota'],
  komentar: [28, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {salary: 'GAJI Rp5 JUTA', salarySub: 'PER BULAN', jakarta: 'JAKARTA', bali: 'BALI', jogja: 'JOGJA', town: 'KOTA KECIL', desa: 'DESA',
  kos: 'KOS', ojol: 'OJOL', makan: 'MAKAN SIANG', kopi: 'KOPI', tgl15: 'TGL 15', tgl20: 'TGL 20', like: 'LIKE 999+', angkringan: 'ANGKRINGAN',
  nabung: 'TABUNGAN', bos: 'BOS!', sultan: 'SULTAN', signal: 'TIDAK ADA SINYAL', biaya: 'BIAYA HIDUP', gaya: 'GAYA HIDUP', question: 'KOTA MANA?', comment: 'KOMENTAR!'};
export const LABELS = {id: L_ID, en: L_ID};
