"""Paragraph start times on the merged narration: choose paragraph boundaries among detected pauses with a DP that
keeps the speech rate steady and prefers long pauses (extra pull after a '...' pause marker). Writes timing.json."""
import json, re, subprocess, math
P = json.load(open('paras.json', encoding='utf-8'))
paras, after_pause = [], []
for i, p in enumerate(P):
    if 'text' in p: paras.append(p['text']); after_pause.append(i > 0 and 'pause' in P[i-1])
f = 'narasi_full.wav'
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)
err = subprocess.run(['ffmpeg', '-i', f, '-af', 'silencedetect=n=-35dB:d=0.18', '-f', 'null', '-'], capture_output=True, text=True).stderr
ss = [float(v) for v in re.findall(r'silence_start: ([\d.]+)', err)]
se = [float(v) for v in re.findall(r'silence_end: ([\d.]+)', err)] + [dur]
sil = list(zip(ss, se))
lead = sil[0][1] if sil and sil[0][0] < .05 else 0.0
tail = sil[-1][0] if sil and sil[-1][1] >= dur - .05 else dur
cand = [(s, e) for s, e in sil if lead < s and e < tail]
nodes = [(lead, lead)] + cand + [(tail, tail)]
L = [len(p) for p in paras]; N = len(paras); Pn = len(nodes)
speech = sum(nodes[i+1][0] - nodes[i][1] for i in range(Pn - 1))
r = speech / sum(L)
INF = 1e18
best = [[INF]*Pn for _ in range(N+1)]; prev = [[-1]*Pn for _ in range(N+1)]
best[0][0] = 0
for k in range(1, N+1):
    for b in range(1, Pn):
        if (k == N) != (b == Pn - 1): continue
        gap = nodes[b][1] - nodes[b][0]
        bonus = 0 if k == N else (0.35*min(gap, 1.2) + (0.9*min(gap, 3.0) if after_pause[k] else 0))
        for a in range(max(0, b - 60), b):
            if best[k-1][a] >= INF: continue
            d = nodes[b][0] - nodes[a][1]
            if d <= 0.3: continue
            c = math.log(d / (L[k-1]*r))**2 - bonus
            if best[k-1][a] + c < best[k][b]: best[k][b], prev[k][b] = best[k-1][a] + c, a
b = Pn - 1; idx = []
for k in range(N, 0, -1): idx.append(b); b = prev[k][b]
idx = idx[::-1]
starts = [lead] + [nodes[j][1] for j in idx[:-1]]
ends = [nodes[j][0] for j in idx]
out = [dict(i=i+1, start=round(s, 3), end=round(e, 3), rate=round((e-s)/len(t), 4), text=t) for i, (t, s, e) in enumerate(zip(paras, starts, ends))]
json.dump(dict(duration=dur, paras=out), open('timing.json', 'w'), ensure_ascii=False, indent=1)
rs = sorted(o['rate'] for o in out); med = rs[len(rs)//2]
for o in out:
    flag = '  <<' if not (.7*med < o['rate'] < 1.4*med) else ''
    print(o['i'], o['start'], o['end'], round(o['rate']/med, 2), o['text'][:50], flag)
