"""Shorten long pauses in narasi_full.wav -> narasi_tight.wav, and remap timing.json -> timing_tight.json.

Each silence (< -40 dB, >= 0.3 s) of length L keeps L' = 0.32 + 0.25*(L - 0.32) (a pause between paragraphs keeps
at least 0.6 s); the cut is taken from the middle of the silence so word onsets and tails stay intact."""
import json, re, subprocess
import numpy as np

SR = 24000
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'narasi_full.wav', '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32)
log = subprocess.run(['ffmpeg', '-i', 'narasi_full.wav', '-af', 'silencedetect=n=-40dB:d=0.3', '-f', 'null', '-'],
                     capture_output=True, text=True).stderr
st = [float(v) for v in re.findall(r'silence_start: ([\d.]+)', log)]
en = [float(v) for v in re.findall(r'silence_end: ([\d.]+)', log)]
T = json.load(open('timing.json', encoding='utf-8'))
pstarts = [p['start'] for p in T['paras']]

cuts = []  # removed old-time intervals [a, b)
for a, b in zip(st, en):
    L = b - a
    keep = .32 + .25 * (L - .32)
    if any(a - .3 <= s <= b + .3 for s in pstarts): keep = max(keep, min(L, .6))
    if L - keep < .05: continue
    m = (a + b) / 2
    cuts.append((m - (L - keep) / 2, m + (L - keep) / 2))

def f(t):
    s = 0.0
    for a, b in cuts:
        if t >= b: s += b - a
        elif t > a: s += t - a
    return t - s

keep_mask = np.ones(len(x), bool)
for a, b in cuts: keep_mask[int(a * SR):int(b * SR)] = False
y = x[keep_mask]
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s16le', 'narasi_tight.wav'],
               input=y.tobytes(), check=True)
for p in T['paras']:
    p['start'] = round(f(p['start']), 3); p['end'] = round(f(p['end']), 3)
    p['w'] = [[c, round(f(t), 3)] for c, t in p.get('w', [])]
T['duration'] = round(len(y) / SR, 3)
json.dump(T, open('timing_tight.json', 'w'), ensure_ascii=False, indent=1)
print(f'{len(cuts)} pauses shortened, {sum(b - a for a, b in cuts):.1f} s removed, {len(x)/SR:.1f} s -> {len(y)/SR:.1f} s')
