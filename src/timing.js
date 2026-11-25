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

// Word events: [sentenceIndex, word, occurrence]. Story: "Roy Sullivan, disambar petir 7 kali" (Indonesian only; en mirrors id).
const EV_ID = {
  pria: [0, 'pria'], petir0: [0, 'petir'], tujuh0: [0, 'tujuh'], selamat: [1, 'selamat'], semuanya: [1, 'semuanya'],
  roy0: [2, 'roy'], penjaga: [2, 'penjaga'], amerika: [2, 'amerika'], alam: [3, 'alam'], sepertinya: [3, 'sepertinya'], menyukai: [3, 'menyukainya'],
  s1: [4, 'sambaran'], kuku: [4, 'kuku'], copot: [4, 'copot'],
  s2: [5, 'sambaran'], mobil: [5, 'mobil'], alis: [6, 'alisnya'], hangus: [6, 'hangus'],
  s3: [7, 'sambaran'], bahu: [7, 'bahunya'], s4: [8, 'keempat'], rambut4: [8, 'rambutnya'],
  sejak: [9, 'sejak'], ember: [9, 'ember'], kemana: [9, 'mana'], jaga: [10, 'jaga'], kepala: [10, 'kepalanya'], lagi: [10, 'lagi'],
  s5: [11, 'sambaran'], bersumpah: [11, 'bersumpah'], awan: [11, 'awan'], mengikuti: [11, 'mengikutinya'],
  menyetir: [12, 'menyetir'], kabur: [12, 'kabur'], tapi5: [12, 'tapi'], mengejar: [12, 'mengejar'], pergi: [13, 'pergi'], cari: [13, 'cari'],
  lama: [14, 'lama'], takut: [14, 'takut'], mendung: [15, 'mendung'], menjauh: [15, 'menjauh'], maaf: [16, 'maaf'], telepon: [16, 'telepon'],
  s6: [17, 'sambaran'], terluka: [17, 'terluka'], s7: [18, 'sambaran'], memancing: [18, 'memancing'],
  menyambar: [19, 'menyambar'], rambut7: [19, 'rambutnya'], seolah: [19, 'seolah'], beruang: [19, 'beruang'], mencuri: [19, 'mencuri'],
  mengusir: [20, 'mengusirnya'], ranting: [20, 'ranting'], sial: [21, 'sial'],
  tercatat: [22, 'tercatat'], guinness: [22, 'guinness'], selamat2: [22, 'selamat'], topi: [23, 'topinya'], museum: [23, 'museum'],
  kalau: [24, 'kalau'], berani: [24, 'berani'], mendung2: [24, 'mendung'], komentar: [25, 'komentar'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {seven: '7 KALI!', alive: 'SELAMAT!', park: 'SHENANDOAH NATIONAL PARK', usa: 'AMERIKA SERIKAT', ranger: 'PENJAGA TAMAN',
  strike: (n) => `SAMBARAN ${n}/7`, toe: 'KUKU JEMPOL COPOT!', brows: 'ALIS HANGUS!', shoulder: 'BAHU TERBAKAR!', hair: 'RAMBUT TERBAKAR!', leg: 'KAKI TERLUKA!',
  water: 'AIR', go: 'PERGI!', phone: 'LEWAT TELEPON AJA...', record: 'GUINNESS WORLD RECORDS', recordSub: 'PALING SERING DISAMBAR PETIR: 7 KALI', hats: 'TOPI ROY SULLIVAN',
  question: 'BERANI BERDIRI DI DEKATNYA?', comment: 'TULIS DI KOMENTAR!', unlucky: 'HARI SIAL!'};
export const LABELS = {id: L_ID, en: L_ID};
