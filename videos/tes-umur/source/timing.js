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

// Word events: [sentenceIndex, word, occurrence]. Story: "Tes umur" (Indonesian 90s nostalgia; en mirrors id).
const EV_ID = {
  tes: [0, 'tes'], hitung: [1, 'hitung'], tiga0: [2, 'tiga'], maaf0: [2, 'maaf'], tua: [2, 'tua'],
  suatu: [3, 'suatu'], kardus: [3, 'kardus'], gudang: [3, 'gudang'], tulisannya: [4, 'tulisannya'], harta: [4, 'harta'],
  yah: [5, 'yah'], powerbank: [5, 'powerbank'], tersedak: [6, 'tersedak'], kaset: [7, 'kaset'], pensil: [8, 'pensil'], canggih: [8, 'canggih'], kusut: [8, 'kusut'],
  no2: [9, 'nomor'], semut: [10, 'semut'], kakek: [10, 'kakek'], atap: [10, 'atap'], antena: [10, 'antena'], operator: [11, 'operatornya'],
  jelas: [12, 'jelas'], kiri: [13, 'kiri'], kebanyakan: [13, 'kebanyakan'],
  no3: [14, 'nomor'], gebetan: [15, 'gebetan'], teleponRumah: [15, 'telepon'], jantung: [16, 'jantung'], bapaknya: [16, 'bapaknya'],
  halo: [17, 'halo'], siapa: [17, 'siapa'], ditutup: [18, 'ditutup'],
  no4: [19, 'nomor'], wartel: [20, 'wartel'], argo: [20, 'argo'], cepat: [21, 'cepat'], detik: [21, 'detik'], jajan: [21, 'jajan'],
  no5: [22, 'nomor'], main: [23, 'main'], alarm: [24, 'alarm'], azan: [24, 'azan'], telat: [25, 'telat'], emak: [25, 'emak'], namaLengkap: [25, 'lengkap'],
  no6: [26, 'nomor'], limaRatus: [27, 'lima'], sultan: [27, 'sultan'],
  bertanya: [28, 'bertanya'], hp: [28, 'hp'], bosan: [28, 'bosan'], tersenyum: [29, 'tersenyum'], layangan: [30, 'layangan'], tunjukkan: [31, 'tunjukkan'],
  sore: [32, 'sore'], bersama: [32, 'bersama'], dulu: [33, 'dulu'], segalanya: [33, 'segalanya'], skor: [34, 'skor'], komentar: [35, 'komentar'], tag: [35, 'tag'],
};
export const EV = Object.fromEntries(Object.entries(EV_ID).map(([k, v]) => [k, {id: v, en: v}]));

const L_ID = {test: 'TES UMUR', rule: 'LEBIH DARI 3 = TUA', box: 'HARTA KARUN AYAH', powerbank: 'POWERBANK?', cassette: 'KASET',
  ch: (n) => `${n}/6`, clear: 'UDAH JELAS?', left: 'KIRI DIKIT!', hello: '"HALO. INI SIAPA?!"', wartel: 'WARTEL', argo: (v) => `Rp${v}`, magrib: 'MAGRIB',
  fullName: '"MUHAMMAD RIZKY SAPUTRA!"', coin: 'Rp500', sultan: 'SULTAN!', question: 'SKOR KAMU BERAPA DARI 6?', comment: 'TAG TEMAN MASA KECILMU!'};
export const LABELS = {id: L_ID, en: L_ID};
