import re, json, sys, subprocess, math
wav, txt, out, db = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else '-35'
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); v = re.findall(r'[aeiouy]+', w); n = len(v)
    if w.endswith('e') and n > 1 and not w.endswith('le'): n -= 1
    if re.search(r'\d', w): n = 2
    return max(1, n)
dur = float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',wav],capture_output=True,text=True).stdout)
err = subprocess.run(['ffmpeg','-i',wav,'-af',f'silencedetect=n={db}dB:d=0.12','-f','null','-'],capture_output=True,text=True).stderr
ss = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', err)]; se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', err)]
segs = []; t = 0.0
ev = sorted([(s, 'S') for s in ss] + [(e, 'E') for e in se])
cur = 0.0; insil = False
for x, k in ev:
    if k == 'S' and not insil:
        if x - cur > 0.08: segs.append((cur, x))
        insil = True
    elif k == 'E': cur = x; insil = False
if not insil and dur - cur > 0.08: segs.append((cur, dur))
units = []  # phrases
for sent in re.findall(r'[^.?!,]+[.?!,]?', open(txt).read().replace('\n', ' ')):
    w = sent.split()
    if w: units.append(w)
U = [sum(syl(x) for x in u) for u in units]
S = [b - a for a, b in segs]
R0 = sum(U) / sum(S)
INF = 1e18; n, m = len(units), len(segs)
D = [[INF] * (m + 1) for _ in range(n + 1)]; P = {}
D[0][0] = 0
for i in range(n + 1):
    for j in range(m + 1):
        if D[i][j] >= INF: continue
        for a in range(1, 5):
            for b in range(1, 5):
                if i + a > n or j + b > m: continue
                sy = sum(U[i:i + a]); d = sum(S[j:j + b]); gaps = segs[j + b - 1][1] - segs[j][0] - d
                c = (math.log((sy / d) / R0)) ** 2 * sy + 0.15 * (a - 1) + 0.25 * (b - 1) + (0.8 * max(0, gaps - 0.6))
                if D[i][j] + c < D[i + a][j + b]: D[i + a][j + b] = D[i][j] + c; P[(i + a, j + b)] = (i, j)
i, j = n, m; blocks = []
while (i, j) != (0, 0):
    pi, pj = P[(i, j)]; blocks.append((pi, i, pj, j)); i, j = pi, pj
blocks.reverse()
words = []; phrases = []
for (i0, i1, j0, j1) in blocks:
    sy = sum(U[i0:i1]); sp = segs[j0:j1]; tot = sum(b - a for a, b in sp)
    def at(k):  # syllable position k -> time
        x = k / sy * tot
        for a, b in sp:
            if x <= b - a: return a + x
            x -= b - a
        return sp[-1][1]
    k = 0
    for u in units[i0:i1]:
        p0 = at(k)
        for w in u:
            s0 = at(k); k += syl(w); words.append({'w': w, 's': round(s0, 3), 'e': round(at(k), 3)})
        phrases.append({'t': ' '.join(u), 's': round(p0, 3), 'e': round(at(k), 3)})
import os; os.makedirs(out, exist_ok=True)
json.dump(words, open(f'{out}/words.json', 'w')); json.dump({'duration': dur, 'frames30': round(dur * 30), 'source': 'align2', 'segments': len(segs), 'phrases': phrases}, open(f'{out}/phrases.json', 'w'))
print('rate', round(R0, 2), 'cost', round(D[n][m], 2))
for p in phrases: print(f"{p['s']:6.2f}-{p['e']:6.2f}  {p['t']}")
