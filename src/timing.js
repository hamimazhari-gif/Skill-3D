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

// Word events: [sentenceIndex, word, occurrence]. Story: "Tidak bisa bohong 24 jam" (Indonesian only; en mirrors id).
const EV_ID = {
  bagaimana: [0, 'bagaimana'], semua0: [0, 'semua'], dunia0: [0, 'dunia'], bohong0: [0, 'berbohong'], duaPuluh0: [0, 'dua'], jam0: [0, 'jam'],
  pagi: [1, 'tujuh'], istri: [2, 'istri'], baju: [2, 'baju'], bertanya: [2, 'bertanya'], bahaya: [2, 'berbahaya'],
  pa: [3, 'pa'], cantik: [3, 'cantik'], bajuIni: [3, 'baju'],
  suami: [4, 'suami'], diam: [4, 'diam'], tapi1: [4, 'tapi'], mulut: [4, 'mulutnya'], sendiri: [4, 'sendiri'],
  bagus: [5, 'bagus'], tapi2: [5, 'tapi'], taplak: [5, 'taplak'], nenek: [5, 'nenek'],
  hariPertama: [6, 'hari'], langsung: [6, 'langsung'], sofa: [6, 'sofa'],
  sembilan: [7, 'sembilan'], rapat: [7, 'rapat'], bos: [8, 'bos'], adaQ: [8, 'ada'],
  adaPak: [9, 'ada'], rapatIni: [9, 'rapat'], diganti: [9, 'diganti'], whatsapp: [9, 'whatsapp'],
  seisi: [10, 'seisi'], menahan: [10, 'menahan'],
  duaBelas: [11, 'dua'], pasar: [11, 'pasar'], bang: [12, 'bang'], semangka: [12, 'semangkanya'], manisQ: [12, 'manis'],
  jujur: [13, 'jujur'], mbak: [13, 'mbak'], manis: [13, 'manis'], saya: [13, 'saya'],
  tigaSore: [14, 'tiga'], teman: [14, 'teman'], utang: [14, 'utang'], kapan: [15, 'kapan'],
  sebenarnya: [16, 'sebenarnya'], tapi3: [16, 'tapi'], sayang: [16, 'sayang'], kamu: [16, 'kamu'],
  enam: [17, 'enam'], arisan: [17, 'arisan'], ramai: [17, 'ramai'], maaf: [18, 'maaf'], baca: [18, 'baca'], malas: [18, 'malas'],
  malam: [19, 'tujuh'], kondangan: [19, 'kondangan'], gimana: [20, 'gimana'],
  rendang: [21, 'rendangnya'], enak: [21, 'enak'], tapi4: [21, 'tapi'], makan: [21, 'makan'], nggakKenal: [21, 'nggak'], pengantin: [21, 'pengantinnya'],
  akhirnya: [22, 'akhirnya'], berlalu: [22, 'berlalu'], semua: [23, 'semua'], lega: [23, 'lega'], kembali: [23, 'kembali'], berbohong: [23, 'berbohong'],
  pa2: [24, 'pa'], cantik2: [24, 'cantik'], banget: [25, 'banget'], sedunia: [25, 'sedunia'],
  kalau: [26, 'kalau'], siapa: [26, 'siapa'], bahaya2: [26, 'bahaya'], tulis: [27, 'tulis'], komentar: [27, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {news: 'BERITA DARURAT', live: 'LIVE', ticker: 'MULAI HARI INI, SEMUA ORANG TIDAK BISA BERBOHONG SELAMA 24 JAM!', tv1: 'MULAI HARI INI: SEMUA ORANG', tv2: 'TIDAK BISA BERBOHONG 24 JAM!',
  t7: '07.00', t9: '09.00', t12: '12.00', t15: '15.00', t18: '18.00', t19: '19.00', start: '24:00:00', end: '00:00:00',
  noLie: '24 JAM TANPA BOHONG', danger: 'PERTANYAAN BERBAHAYA', nenek: 'TAPLAK MEJA NENEK', day1: 'HARI PERTAMA', meeting: 'RAPAT MINGGUAN',
  slide: ['RAPAT', 'MINGGUAN', '(2 JAM)'], wa: '1 PESAN WHATSAPP', melon: 'SEMANGKA', sweet: 'MANIS?', debt: 'UTANG: Rp500.000',
  group: 'ARISAN RT 05', chat: [['Bu, sudah dibaca?', false], ['Kok nggak dibalas?', false], ['Halo??', false], ['Maaf ya, Bu...', true], ['cuma malas balas', true], ['Saya juga baca kok, Bu', false], ['Sama, malas balas juga', false]],
  wedding: 'SELAMAT MENEMPUH HIDUP BARU', rendang: 'RENDANG', who: 'SIAPA?', relief: 'FIUUUH...', back: 'BOHONG LAGI!',
  question: 'SIAPA PALING BAHAYA?', comment: 'TULIS DI KOMENTAR!'};
export const LABELS = {id: L_ID, en: L_ID};
