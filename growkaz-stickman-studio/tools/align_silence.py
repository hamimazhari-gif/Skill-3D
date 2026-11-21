# tools/align_silence.py — offline script alignment (no Whisper): python3 tools/align_silence.py projects/<slug> tools
"""Align a plain script to a voiceover without ASR: map punctuation boundaries onto detected pauses (DP),
then spread words inside each chunk by character length over the speech (non-silent) time."""
import json, re, subprocess, sys, os
sys.path.insert(0, sys.argv[2])  # studio tools dir
from common import write_timeline, sentences_from_words, probe_duration

proj = sys.argv[1]
cfg = json.load(open(os.path.join(proj, "config.json")))
audio = os.path.join(proj, cfg["voiceover"]); dur = probe_duration(audio)
txt = open(os.path.join(proj, cfg["script"]), encoding="utf-8").read()
words = txt.split()
log = subprocess.run(["ffmpeg", "-i", audio, "-af", "silencedetect=noise=-38dB:d=0.18", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
sil = [(a, b) for a, b in zip(st, en)]
# merge touching silences
m = []
for a, b in sil:
    if m and a - m[-1][1] < 0.05: m[-1] = (m[-1][0], b)
    else: m.append((a, b))
sil = m
speech_start = sil[0][1] if sil and sil[0][0] < 0.05 else 0.0
speech_end = sil[-1][0] if sil and sil[-1][1] > dur - 0.05 else dur
gaps = [(a, b) for a, b in sil if a > speech_start + 0.05 and b < speech_end - 0.05]

# speech-time axis
def speech_between(t0, t1):
    tot = t1 - t0
    for a, b in gaps: tot -= max(0.0, min(b, t1) - max(a, t0))
    return tot
S = speech_between(speech_start, speech_end)
wl = [len(re.sub(r"\W", "", w)) + 1.5 for w in words]
C = sum(wl); cum = [0.0]
for x in wl: cum.append(cum[-1] + x)
# candidate boundaries: after word i with punctuation
strength = {}
for i, w in enumerate(words[:-1]):
    if re.search(r"[.!?…]['\"”’]*$", w): strength[i + 1] = 1.0
    elif re.search(r"[,:;]['\"”’]*$", w): strength[i + 1] = 0.5
B = sorted(strength)
bf = [cum[b] / C for b in B]
gf = [speech_between(speech_start, (a + b) / 2) / S for a, b in gaps]
gd = [b - a for a, b in gaps]
import math
rate = S / C  # seconds of speech per char unit
nB, nG = len(B), len(gaps)
# states: (bi, gi) where bi in -1..nB-1 (boundary idx, -1=start), gi in -1..nG-1 ; final state (nB, nG)
bw = [0] + [B[i] for i in range(nB)] + [len(words)]   # word idx for state bi+1
gt0 = [speech_start] + [g[1] for g in gaps]           # chunk start time after gap state
gt1 = [g[0] for g in gaps] + [speech_end]             # chunk end time at gap state
def chunk_cost(b0, g0, b1, g1):
    # b0,g0: previous state indices in extended arrays (0=start); b1,g1: next state (index into extended; nB+1/nG means end)
    w0, w1 = bw[b0], bw[b1]
    t0 = gt0[g0]; t1 = gt1[g1 - 1] if g1 > 0 else speech_start
    if t1 <= t0: return math.inf
    chars = cum[w1] - cum[w0]
    sp = speech_between(t0, t1)
    exp = chars * rate
    c = 6 * (math.log(max(sp, 0.05) / exp)) ** 2 * (0.5 + chars / 20)
    for k in range(g0, g1 - 1): c += 0.4 + 1.5 * gd[k]          # pauses swallowed inside the chunk
    for k in range(b0, b1 - 1): c += 0.5 if strength[B[k]] == 1.0 else 0.08  # punctuation without a pause
    return c
INF = math.inf
best = {(0, 0): (0.0, None)}
order = sorted([(bi, gi) for bi in range(1, nB + 1) for gi in range(1, nG + 1)]) + [(nB + 1, nG + 1)]
for (b1, g1) in order:
    cand = (INF, None)
    for b0 in range(max(0, b1 - 14), b1):
        for g0 in range(max(0, g1 - 6), g1):
            if (b0, g0) not in best: continue
            v = best[(b0, g0)][0] + chunk_cost(b0, g0, b1, g1)
            if v < cand[0]: cand = (v, (b0, g0))
    if cand[1] is not None: best[(b1, g1)] = cand
state = (nB + 1, nG + 1); pairs = []
total = best[state][0]
while state != (0, 0):
    prev = best[state][1]
    if state != (nB + 1, nG + 1): pairs.append((state[0] - 1, state[1] - 1))
    state = prev
pairs.reverse()
anchors = [(0, speech_start)] + [(B[a], gaps[g]) for a, g in pairs] + [(len(words), speech_end)]
out = []
for k in range(len(anchors) - 1):
    w0, s0 = anchors[k]; w1, s1 = anchors[k + 1]
    t0 = s0 if isinstance(s0, float) else s0[1]
    t1 = s1 if isinstance(s1, float) else s1[0]
    inner = [(a, b) for a, b in gaps if a > t0 and b < t1]
    # map speech-fraction to real time within chunk
    tot = speech_between(t0, t1); cc = sum(wl[w0:w1]); acc = 0.0
    def real(f):
        target = f * tot; t = t0
        for a, b in inner:
            if a - t >= target: return t + target
            target -= (a - t); t = b
        return t + target
    for w in range(w0, w1):
        a = real(acc / cc); acc += wl[w]; b = real(acc / cc)
        out.append({"word": words[w], "start": round(a, 3), "end": round(b - 0.02, 3)})
print(f"aligned {len(words)} words; {len(pairs)}/{nG} pauses matched to punctuation; DP cost {total:.2f}")
write_timeline(os.path.join(proj, "timeline"), out, sentences_from_words(out), "silence-align")
