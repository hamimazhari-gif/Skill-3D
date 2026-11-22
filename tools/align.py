"""Align a known narration script to a voice-over WAV without speech recognition.

Sentence ends are snapped to detected pauses with dynamic programming; each sentence's expected length
is proportional to its letter count. Usage:

  python3 -I tools/align.py voice.wav narration.txt out/sentence_times_<lang>.json

narration.txt: one sentence per line, prefixed by its shot number:  "3 | Our farmer wants fish."
Write numbers as words where the narrator says them ("2,600" -> "two thousand six hundred") for better timing.
Convert mp3/m4a first: ffmpeg -i in.mp3 -ac 1 -ar 24000 voice.wav
"""
import sys, json, re, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gaps import gaps

wav, txt, out = sys.argv[1], sys.argv[2], sys.argv[3]
S, SH = [], []
for line in open(txt, encoding='utf-8'):
    line = line.strip()
    if not line or line.startswith('#'): continue
    shot, text = line.split('|', 1)
    SH.append(int(shot)); S.append(text.strip())
g, dur = gaps(wav)
start = g[0][1] if g and g[0][0] == 0 else 0.0
end = g[-1][0] if g and g[-1][1] >= dur - 0.05 else dur
inner = [x for x in g if x[0] > start + 0.3 and x[1] < end - 0.3]
W = [len(re.sub(r'[^\w]', '', s)) + 6 * s.count(',') for s in S]
n = len(S); rate = (end - start) / sum(W); INF = 1e18
cand = [(start, start)] + inner; m = len(cand)
if m - 1 < n - 1: sys.exit(f'only {m-1} pauses for {n} sentences: lower the threshold in gaps.py or merge sentences')
dp = [[INF] * m for _ in range(n)]; bk = [[None] * m for _ in range(n)]
cost = lambda i, a, b: ((b - a - W[i] * rate) / (W[i] * rate)) ** 2
for j in range(1, m): dp[0][j] = cost(0, start, cand[j][0]) - 0.8 * (cand[j][1] - cand[j][0])
for i in range(1, n - 1):
    for j in range(1, m):
        for k in range(1, j):
            if dp[i - 1][k] < INF:
                c = dp[i - 1][k] + cost(i, cand[k][1], cand[j][0]) - 0.8 * (cand[j][1] - cand[j][0])
                if c < dp[i][j]: dp[i][j] = c; bk[i][j] = k
best, bj = INF, None
for k in range(1, m):
    c = dp[n - 2][k] + cost(n - 1, cand[k][1], end)
    if c < best: best, bj = c, k
idx = [bj]
for i in range(n - 2, 0, -1): idx.append(bk[i][idx[-1]])
idx = idx[::-1]
res, a = [], start
for i in range(n):
    b = cand[idx[i]][0] if i < n - 1 else end
    res.append({'shot': SH[i], 'text': S[i], 'start': round(a, 2), 'end': round(b, 2), 'pred': round(W[i] * rate, 2)})
    if i < n - 1: a = cand[idx[i]][1]
json.dump({'duration': dur, 'sentences': res}, open(out, 'w'), indent=1, ensure_ascii=False)
for o in res: print(f"{o['shot']:2} {o['start']:6.2f}-{o['end']:6.2f} ({o['end']-o['start']:.2f} vs {o['pred']:.2f}) {o['text'][:60]}")
