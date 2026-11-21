#!/usr/bin/env python3
"""Forced alignment: align.py audio.wav script.txt out.json  -> [{word,start,end}] seconds (10ms resolution).
Script words are used as-is (so captions match the script exactly), timestamps come from the audio.
Spoken overrides (placeholders like X/Y/Z) are in spoken.json next to script.txt: {"X":"x","Y":"why"}"""
import sys, os, re, json, wave, subprocess
from pocketsphinx import Decoder, get_model_path
wav, scr, out = sys.argv[1:4]
mp = get_model_path()
d = Decoder(hmm=os.path.join(mp,'en-us/en-us'), lm=os.path.join(mp,'en-us/en-us.lm.bin'),
            dict=os.path.join(mp,'en-us/cmudict-en-us.dict'), samprate=16000, loglevel='FATAL', beam=1e-100, wbeam=1e-80, pbeam=1e-100, lpbeam=1e-80, lponlybeam=1e-80)
over = {}
p = os.path.join(os.path.dirname(scr),'spoken.json')
if os.path.exists(p): over = json.load(open(p))
text = open(scr).read()
disp = re.findall(r"[A-Za-z0-9][A-Za-z0-9'’.-]*", text.replace('(', ' ').replace(')', ' '))
disp = [w.rstrip('.-') for w in disp]
toks, owner = [], []
for i, w in enumerate(disp):
    s = over.get(w, w).lower().replace('’', "'")
    for t in s.split():
        toks.append(t); owner.append(i)
LANG = over.pop('_lang', os.environ.get('ALIGN_LANG', 'en'))
def g2p_id(w):
    """Rule-based Indonesian/Malay grapheme->CMU phones (very regular spelling)."""
    w = re.sub(r"[^a-z]", "", w.lower()); ph = []; i = 0
    V = {'a':'AA','i':'IY','u':'UW','e':'EH','o':'OW'}
    C = {'b':'B','c':'CH','d':'D','f':'F','g':'G','h':'HH','j':'JH','k':'K','l':'L','m':'M','n':'N','p':'P','q':'K','r':'R','s':'S','t':'T','v':'F','w':'W','y':'Y','z':'Z'}
    while i < len(w):
        two = w[i:i+2]
        if two in ('ai','au','oi') and (i+2 == len(w) or w[i+2] not in V): ph.append({'ai':'AY','au':'AW','oi':'OY'}[two]); i += 2; continue
        if two == 'ng': ph.append('NG'); i += 2; continue
        if two == 'ny': ph += ['N','Y']; i += 2; continue
        if two == 'sy': ph.append('SH'); i += 2; continue
        if two == 'kh': ph.append('HH'); i += 2; continue
        ch = w[i]
        if ch in V: ph.append(V[ch])
        elif ch == 'x': ph += ['K','S']
        elif ch in C:
            if ph and ph[-1] == C[ch] and ch not in V: pass  # doubled consonant
            else: ph.append(C[ch])
        i += 1
    return ' '.join(ph)
unk = [t for t in set(toks) if d.lookup_word(t) is None]
if unk and LANG == 'id':
    for t in unk:
        ph = g2p_id(t)
        if ph: d.add_word(t, ph, True)
    unk = [t for t in set(toks) if d.lookup_word(t) is None]
if unk: print('UNKNOWN WORDS (add to spoken.json):', unk); sys.exit(1)
tmp = '/tmp/_al16.wav'
subprocess.run(['ffmpeg','-y','-v','error','-i',wav,'-ar','16000','-ac','1',tmp], check=True)
raw = wave.open(tmp).readframes(10**9)
d.set_align_text(' '.join(toks))
d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
segs = [(s.word, s.start_frame, s.end_frame) for s in d.seg() if s.word not in ('<s>','</s>','<sil>','[NOISE]','[SPEECH]') ]
segs = [s for s in segs]
if len(segs) != len(toks):
    print('MISMATCH', len(segs), len(toks)); print([s[0] for s in segs]); sys.exit(2)
words = {}
for (w, a, b), o in zip(segs, owner):
    st, en = a/100, (b+1)/100
    if o in words: words[o][2] = en
    else: words[o] = [disp[o], st, en]
res = [{'word': v[0], 'start': round(v[1],3), 'end': round(v[2],3)} for k, v in sorted(words.items())]
json.dump(res, open(out,'w'), indent=1)
print(f'{len(res)} words aligned, last end {res[-1]["end"]}s')
