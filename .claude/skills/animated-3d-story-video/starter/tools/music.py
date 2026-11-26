"""Procedural background score for a story video (no samples, no licences).
Moods follow the narration: sad (A minor), hope (C major), warm (F-G-C); always ends on a held C chord.
usage: python3 -I tools/music.py src/data/sentence_times_id.json "1:sad,6:hope,11:warm" out.wav
  plan: comma-separated "<narration shot>:<mood>" — each section starts at that shot's cut."""
import sys, json, wave
import numpy as np

src, plan, out = sys.argv[1], sys.argv[2], sys.argv[3]
PLAN = [(int(a), b) for a, b in (x.split(':') for x in plan.split(','))]
d = json.load(open(src)); S = d['sentences']
def cut(k):
    i = next(j for j, s in enumerate(S) if s['shot'] == k)
    return (S[i - 1]['end'] + S[i]['start']) / 2
total = d['duration'] + 0.7 + 1.5
STARTS = [0.0 if k == 1 else cut(k) for k, _ in PLAN]
SR = 44100
N = int(total * SR)
L = np.zeros(N); R = np.zeros(N)
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
def hz(name, octv): return 440.0 * 2 ** ((NOTE[name] + 12 * (octv + 1) - 69) / 12)
CH = {'Am': ['A', 'C', 'E'], 'F': ['F', 'A', 'C'], 'C': ['C', 'E', 'G'], 'G': ['G', 'B', 'D'], 'Em': ['E', 'G', 'B'], 'Dm': ['D', 'F', 'A']}

def add(sig, t0, pan=0.0, gain=1.0):
    i0 = int(t0 * SR); i1 = min(N, i0 + len(sig))
    if i0 >= N or i1 <= i0: return
    s = sig[:i1 - i0] * gain
    L[i0:i1] += s * (1 - pan) * 0.5 ** 0.5 * 1.2; R[i0:i1] += s * (1 + pan) * 0.5 ** 0.5 * 1.2

def piano(f, dur=2.2, vel=0.3):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 2.6) * (1 - np.exp(-t * 400))
    sig = sum(a * np.sin(2 * np.pi * f * k * t + k) * np.exp(-t * (k - 1) * 1.5) for k, a in [(1, 1.0), (2, 0.45), (3, 0.18), (4, 0.08)])
    return sig * env * vel

def bell(f, dur=1.6, vel=0.12):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 3.2) * (1 - np.exp(-t * 600))
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4)) * env * vel

def pad(freqs, dur, vel=0.05):
    t = np.arange(int(dur * SR)) / SR
    env = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.0).clip(0)
    sig = np.zeros_like(t)
    for f in freqs:
        for det in (-0.6, 0.6):
            ff = f + det
            sig += np.sin(2 * np.pi * ff * t) + 0.3 * np.sin(2 * np.pi * 2 * ff * t) + 0.12 * np.sin(2 * np.pi * 3 * ff * t)
    lfo = 1 + 0.08 * np.sin(2 * np.pi * 0.25 * t)
    return sig * env * lfo * vel / len(freqs)

def bass(f, dur, vel=0.22):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 1.4) * (1 - np.exp(-t * 200)) * np.minimum(1, (dur - t) / 0.08).clip(0)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)) * env * vel

def section(t0, t1, prog, bpm, mood):
    beat = 60 / bpm; bar = 4 * beat
    nb = int(np.ceil((t1 - t0) / bar))
    for b in range(nb):
        tb = t0 + b * bar
        if tb >= t1: break
        name = prog[b % len(prog)]; notes = CH[name]
        root = hz(notes[0], 3)
        cf = [hz(n, 3 if n in ('A', 'B', 'G') else 4) for n in notes]
        add(pad(cf + [root / 2], min(bar + 1.0, t1 - tb + 1.0), 0.05 if mood == 'sad' else 0.045), tb, 0.0)
        arp = [hz(notes[0], 4), hz(notes[1], 4), hz(notes[2], 4), hz(notes[1], 5 if mood == 'warm' else 4)]
        if mood == 'sad':
            for k, f in enumerate([arp[0], arp[2], arp[1], arp[2]]):
                if b == 0 and k == 0: continue
                add(piano(f, 2.4, 0.16 + 0.03 * (k == 0)), tb + k * beat, -0.2 + 0.13 * k)
            if b >= 2: add(bass(root / 2, bar * 0.95, 0.12), tb, 0)
        else:
            steps = 8
            seq = [0, 1, 2, 3, 2, 1, 2, 3] if mood == 'hope' else [0, 2, 1, 3, 0, 2, 3, 2]
            for k in range(steps):
                f = arp[seq[k]] * (2 if (mood == 'warm' and k % 4 == 3) else 1)
                add(piano(f, 1.6, 0.13 if k % 2 else 0.17), tb + k * beat / 2, -0.35 + 0.1 * k)
            add(bass(root / 2, beat * 2 * 0.95, 0.2), tb, 0); add(bass(root / 2, beat * 2 * 0.95, 0.16), tb + 2 * beat, 0)
            if mood == 'warm':
                mel = [notes[2], notes[1], notes[0], notes[1]]
                add(bell(hz(mel[b % 4], 5), 1.8, 0.1), tb, 0.3); add(bell(hz(notes[0], 6), 1.4, 0.06), tb + 2.5 * beat, -0.3)

MOODS = {'sad': (['Am', 'F', 'C', 'G'], 66), 'hope': (['C', 'G', 'Am', 'F'], 76), 'warm': (['F', 'G', 'Em', 'Am', 'F', 'G', 'C', 'C'], 80)}
tEnd = d['duration'] - 1.2
for i, (k, mood) in enumerate(PLAN):
    t0 = STARTS[i]; t1 = STARTS[i + 1] if i + 1 < len(PLAN) else tEnd
    prog, bpm = MOODS[mood]; section(t0, t1, prog, bpm, mood)
# closing chord + soft bell on the last line
add(pad([hz('C', 4), hz('E', 4), hz('G', 4), hz('C', 3)], total - tEnd, 0.06), tEnd, 0)
for k, n in enumerate(['C', 'E', 'G', 'C']): add(piano(hz(n, 4 + (k == 3)), 3.5, 0.15), tEnd + k * 0.12, -0.3 + 0.2 * k)
add(bell(hz('C', 6), 2.5, 0.08), tEnd + 0.5, 0.2)
# short swells into each new section
for ts in STARTS[1:]:
    t = np.arange(int(1.6 * SR)) / SR
    add(np.sin(2 * np.pi * hz('C', 5) * t) * (t / 1.6) ** 2 * 0.04 * np.exp(-np.maximum(0, t - 1.5) * 20), ts - 1.5, 0)
# simple room reverb (a few feedback delays), fade in/out, normalise
for buf in (L, R):
    wet = np.zeros(N)
    for dly, g in ((0.031, 0.35), (0.047, 0.3), (0.073, 0.25), (0.113, 0.2), (0.167, 0.15)):
        k = int(dly * SR); wet[k:] += buf[:-k] * g
    buf += wet * 0.6
fade = np.ones(N); fi = int(0.6 * SR); fo = int(1.8 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
L *= fade; R *= fade
peak = max(np.abs(L).max(), np.abs(R).max()); L /= peak / 0.7; R /= peak / 0.7
pcm = (np.stack([L, R], 1) * 32767).astype('<i2')
w = wave.open(out, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
print(f'wrote {out}: {total:.1f}s, sections ' + ', '.join(f'{m}@{t:.2f}s' for (k, m), t in zip(PLAN, STARTS)))
