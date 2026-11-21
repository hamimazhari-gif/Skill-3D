"""Music bed + SFX stems for the game short:  python3 audio.py <id|en>  -> music_<lang>.wav, sfx_<lang>.wav"""
import numpy as np, subprocess, wave, json, re, sys
LANG = sys.argv[1] if len(sys.argv) > 1 else "id"
B = json.loads(re.search(r"=\s*(\{.*\})", open("web/beats.js").read()).group(1))[LANG]

SR = 48000
DUR = B["end"] / 30
N = int(DUR * SR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def load_voice():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "voice.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    v = np.frombuffer(raw, np.float32).copy()
    out = np.zeros(N, np.float32); out[:min(N, len(v))] = v[:N]; return out

def env(n, a=0.005, r=0.2, sus=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
    return e

def lp(x, k):  # one-pole low-pass, k in (0,1)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += k * (x[i] - acc); y[i] = acc
    return y

def lp_fast(x, cutoff):
    # FFT brick-ish low-pass (fast, fine for beds)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)

def hp_fast(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)

def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i < N and j > i: buf[i:j] += sig[: j - i] * gain

midi = lambda m: 440 * 2 ** ((m - 69) / 12)


def midi(m): return 440 * 2 ** ((m - 69) / 12)
F = lambda f: f / 30
# ---------------- music: bouncy 1940s swing-march ----------------
music = np.zeros(N, np.float32)
BPM = 118; beat = 60 / BPM
prog = [(60, [60, 64, 67]), (57, [57, 60, 64]), (53, [53, 57, 60]), (55, [55, 59, 62])]  # C Am F G
def pluck(f, dur=0.35, bright=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum((bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(6))
    return (s * env(n, 0.003, dur * 0.35)).astype(np.float32)
def brass(fs, dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in fs:
        ph = 2 * np.pi * f * t + 0.003 * np.sin(2 * np.pi * 5 * t)
        s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.3 for k in range(8))
    a = np.minimum(1, t / 0.06) * np.minimum(1, (dur - t) / 0.12).clip(0)
    return lp_fast((s * a).astype(np.float32), 1900) / len(fs)
def drum(kind):
    if kind == "kick":
        n = int(0.3 * SR); t = np.arange(n) / SR; f = 55 + 90 * np.exp(-t * 30)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)).astype(np.float32)
    if kind == "hat":
        n = int(0.06 * SR); t = np.arange(n) / SR
        return hp_fast((rng.standard_normal(n) * np.exp(-t * 60)).astype(np.float32), 6000)
    n = int(0.16 * SR); t = np.arange(n) / SR
    s = rng.standard_normal(n) * np.exp(-t * 30) * 0.6 + np.sin(2 * np.pi * 200 * t) * np.exp(-t * 22) * 0.5
    return hp_fast(s.astype(np.float32), 300)
def march(t0, t1, gain=1.0, bar0=0):
    bar = bar0; tt = t0
    while tt < t1:
        root, ch = prog[bar % 4]
        place(music, brass([midi(m) for m in ch], min(beat * 4 * 0.97, t1 - tt)), tt, 0.08 * gain)
        for b in range(4):
            tb = tt + b * beat
            if tb >= t1: break
            place(music, drum("kick" if b % 2 == 0 else "snare"), tb, (0.5 if b % 2 == 0 else 0.28) * gain)
            place(music, drum("hat"), tb + beat * 0.66, 0.12 * gain)
            place(music, pluck(midi(root - 12 + (7 if b % 2 else 0)), 0.38, 0.4), tb, 0.33 * gain)   # oom-pah bass
            place(music, pluck(midi(ch[(b + bar) % 3] + 12), 0.2, 0.6), tb + beat * 0.66, 0.12 * gain)   # swung off-beat
        if bar % 2 == 1:
            for k, m in enumerate([ch[2] + 12, ch[1] + 12, ch[0] + 12, ch[1] + 12]):
                place(music, pluck(midi(m + 12), 0.18, 0.7), tt + 2 * beat + k * beat * 0.5, 0.09 * gain)
        bar += 1; tt += beat * 4
    i0 = int(max(0, t1 - 0.06) * SR); i1 = min(N, int((t1 + 0.6) * SR))
    seg = music[i0:i1].copy(); music[i0:i1] = seg * np.linspace(1, 0, len(seg)) ** 6  # clean stop
    music[i1:int((t1 + 2.0) * SR)] *= 0
    return bar
def pad(t0, t1, notes, gain):
    d = t1 - t0; n = int(d * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * midi(m) * t + 0.4 * np.sin(2 * np.pi * 0.3 * t)) for m in notes) / len(notes)
    s = s * (0.75 + 0.25 * np.sin(2 * np.pi * 2.2 * t)) * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.4).clip(0)
    place(music, lp_fast(s.astype(np.float32), 1200), t0, gain)

# ---- synthwave for the city ----
def saw(f, dur, bright=0.6):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(((-1) ** k) * (bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(10))
    return s.astype(np.float32)
def synthwave(t0, t1, gain=1.0):
    bpm = 108; bt = 60 / bpm; prg = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]
    tt = t0; bar = 0
    while tt < t1 - 0.05:
        root, ch = prg[bar % 4]
        d = min(bt * 4, t1 - tt); n = int(d * SR); tpad = np.arange(n) / SR
        padsig = sum(saw(midi(m), d, 0.5) for m in ch) / 3 * np.minimum(1, tpad / 0.3) * np.minimum(1, (d - tpad) / 0.2).clip(0)
        place(music, lp_fast(padsig.astype(np.float32), 1400), tt, 0.07 * gain)
        for k in range(16):  # 16th arpeggio
            ts = tt + k * bt / 4
            if ts >= t1 - 0.02: break
            nt = ch[k % 3] + 12 + (12 if k % 8 == 7 else 0)
            place(music, (saw(midi(nt), 0.14, 0.5) * env(int(0.14 * SR), 0.002, 0.05)).astype(np.float32), ts, 0.05 * gain)
        for b4 in range(4):
            tb = tt + b4 * bt
            if tb >= t1 - 0.02: break
            place(music, drum("kick"), tb, 0.5 * gain)
            if b4 % 2: place(music, drum("snare"), tb, 0.3 * gain)
            place(music, drum("hat"), tb + bt / 2, 0.14 * gain)
            place(music, pluck(midi(root - 12), 0.3, 0.3), tb, 0.3 * gain); place(music, pluck(midi(root - 12), 0.2, 0.3), tb + bt / 2, 0.18 * gain)
        bar += 1; tt += bt * 4
    i0 = int(max(0, t1 - 0.05) * SR); i1 = min(N, int((t1 + 0.5) * SR)); seg = music[i0:i1].copy(); music[i0:i1] = seg * np.linspace(1, 0, len(seg)) ** 4
b = {k: F(v) for k, v in B.items()}
synthwave(0.0, b['first'] - 0.05)
march(b['first'], b['argue'] - 0.05, 0.8)
synthwave(b['argue'], b['ny'] - 0.05, 0.8)
march(b['ny'], b['thisone'] - 0.1, 0.9)
pad(b['thisone'] + 0.3, b['later'] + 0.2, [45, 52, 57], 0.07)
synthwave(b['later'] + 0.6, DUR - 0.6, 1.0)
place(music, brass([midi(69), midi(72), midi(76)], 1.4), b['question'] + 0.1, 0.1)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def thunk(f0=90, d=0.3):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t * (1 + 0.6 * np.exp(-t * 40))) * np.exp(-t * 14) + lp_fast(noise(d), 1200) * np.exp(-t * 30) * 0.5).astype(np.float32)
def rumble(d):
    n = int(d * SR); t = np.arange(n) / SR
    s = lp_fast(noise(d), 160) * 3 * np.minimum(1, t / 0.15) * np.exp(-t / (d * 0.45))
    return s.astype(np.float32)
def crash(d=1.2):
    n = int(d * SR); t = np.arange(n) / SR; s = np.zeros(n, np.float32)
    for k in range(14):
        tk = rng.uniform(0, d * 0.6); i = int(tk * SR); g = thunk(rng.uniform(60, 160), 0.35) * rng.uniform(0.3, 0.9)
        s[i:i + len(g)] += g[: n - i]
    s += lp_fast(noise(d), 2500) * np.exp(-t * 3) * 0.25
    return s
def cuckoo():
    out = []
    for f, d in [(740, 0.16), (587, 0.24)]:
        n = int(d * SR); t = np.arange(n) / SR
        out.append(np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.01) * np.exp(-t * 6)); out.append(np.zeros(int(0.06 * SR)))
    return np.concatenate(out).astype(np.float32)
def scrape(d=0.8):
    n = int(d * SR); t = np.arange(n) / SR
    s = noise(d) * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * t)) * np.sin(np.pi * t / d)
    s = hp_fast(lp_fast(s, 5000), 1500)
    ring = np.sin(2 * np.pi * 1870 * t) * np.exp(-t * 3) * 0.2
    return (s * 0.6 + ring).astype(np.float32)
def ting():
    n = int(1.2 * SR); t = np.arange(n) / SR
    return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2093, 4), (3136, 6), (4186, 8)]) * 0.3).astype(np.float32)
def sting():
    n = int(2.0 * SR); t = np.arange(n) / SR
    low = np.sin(2 * np.pi * 41 * t) * np.exp(-t * 1.5) * 1.2
    hit = lp_fast(noise(2.0), 900) * np.exp(-t * 6) * 0.8
    stab = brass([midi(45), midi(48), midi(51)], 1.4); s = low + hit; s[: len(stab)] += stab * 2.2 * np.exp(-np.arange(len(stab)) / SR * 2)
    return s.astype(np.float32)
def creak(d=0.6, f0=140):
    n = int(d * SR); t = np.arange(n) / SR
    rate = f0 * (1 + 0.35 * np.sin(2 * np.pi * 1.3 * t / d))
    ph = np.cumsum(rate) / SR; pulses = (np.mod(ph, 1) < 0.08).astype(np.float32)
    s = lp_fast(pulses * (0.6 + 0.4 * rng.random(n).astype(np.float32)), 2200) * np.sin(np.pi * t / d)
    return hp_fast(s, 200) * 2.5
def snap():
    d = 0.5; n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(noise(d), 800) * np.exp(-t * 18) * 1.4 + np.pad(thunk(120, 0.4), (0, n - int(0.4 * SR))) * 0.6).astype(np.float32)
def splash(d=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    s = lp_fast(noise(d), 4000) * (np.exp(-t * 4) * np.minimum(1, t / 0.01)) + lp_fast(noise(d), 400) * np.exp(-t * 7) * 1.5
    return s.astype(np.float32)
def whoosh(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 1500) * np.sin(np.pi * t / d) ** 2 * 0.6).astype(np.float32)
def snore(d=1.1):
    n = int(d * SR); t = np.arange(n) / SR
    buzz = (np.mod(np.cumsum(60 + 25 * np.sin(np.pi * t / d)) / SR, 1) < 0.3).astype(np.float32)
    return (lp_fast(buzz * 0.5 + noise(d) * 0.15, 700) * np.sin(np.pi * t / d) ** 2).astype(np.float32)
def leaves(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(lp_fast(noise(d), 6000), 2500) * (0.3 + 0.3 * np.sin(2 * np.pi * 0.7 * t) ** 2) * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4)).astype(np.float32)
def water(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 900) * 0.5 + hp_fast(lp_fast(noise(d), 3000), 1200) * 0.15 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.4 * t))).astype(np.float32)


def ting(): 
    n = int(1.2 * SR); t = np.arange(n) / SR
    return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2093, 4), (3136, 6), (4186, 8)]) * 0.3).astype(np.float32)
def hum(d, f0=118):
    n = int(d * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f0 * t) + 0.4 * np.sin(2 * np.pi * 2 * f0 * t) + 0.2 * np.sign(np.sin(2 * np.pi * f0 * t)) * 0.3
    return lp_fast((s * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3).clip(0)).astype(np.float32), 700) * 0.5
def pop():
    d = 0.08; n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 3500) * np.exp(-t * 70) * 1.2 + np.sin(2 * np.pi * rng.uniform(300, 600) * t) * np.exp(-t * 60) * 0.6).astype(np.float32)
def pops(d, density=16):
    n = int(d * SR); s = np.zeros(n, np.float32)
    for k in range(int(d * density)):
        t0 = rng.uniform(0, d - 0.1) ** 1.3 / (d - 0.1) ** 0.3; g = pop() * rng.uniform(0.4, 1.0); i = int(t0 * SR); s[i:i + len(g)] += g[: n - i]
    return s
def spark(d=0.35):
    n = int(d * SR); t = np.arange(n) / SR
    crack = (rng.random(n) < 0.02).astype(np.float32) * rng.uniform(-1, 1, n).astype(np.float32)
    return (hp_fast(lp_fast(crack * 3 + noise(d) * 0.2, 7000), 1500) * np.exp(-t * 8)).astype(np.float32)
def boing(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR; f = 180 + 140 * np.sin(2 * np.pi * 7 * t) * np.exp(-t * 4)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)).astype(np.float32)
def squish(d=0.45):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 500) * np.sin(np.pi * t / d) * 1.4 + np.sin(2 * np.pi * (90 - 60 * t / d) * t) * np.sin(np.pi * t / d) * 0.5).astype(np.float32)
def splat():
    return (np.pad(squish(0.3), (0, int(0.2 * SR))) * 1.2 + np.pad(thunk(160, 0.3), (0, int(0.2 * SR))) * 0.8)
def warble(d):
    n = int(d * SR); t = np.arange(n) / SR; f = 520 + 120 * np.sin(2 * np.pi * 6 * t) * np.minimum(1, t / 1.0)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3).clip(0)).astype(np.float32)
def fallwhistle(d):
    n = int(d * SR); t = np.arange(n) / SR; f = 1400 * np.exp(-t / d * 1.3)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3 * np.minimum(1, t / 0.1)).astype(np.float32)
def pianoclunk():
    d = 1.6; n = int(d * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * midi(m) * t) * np.exp(-t * 2.5) for m in [36, 37, 43, 48, 49, 54]) / 3
    return s.astype(np.float32)
def beep(k=3):
    out = []
    for i in range(k):
        n = int(0.11 * SR); t = np.arange(n) / SR; out.append(np.sin(2 * np.pi * 1760 * t) * np.minimum(1, t / 0.005) * np.minimum(1, (0.11 - t) / 0.01) * 0.5); out.append(np.zeros(int(0.07 * SR)))
    return np.concatenate(out).astype(np.float32)
def click():
    d = 0.06; n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(noise(d), 2000) * np.exp(-t * 90)).astype(np.float32)


def ting():
    n = int(1.2 * SR); t = np.arange(n) / SR
    return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2093, 4), (3136, 6), (4186, 8)]) * 0.3).astype(np.float32)
def blip(f0=880, d=0.07):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sign(np.sin(2 * np.pi * f0 * t)) * 0.5 * np.exp(-t * 25)).astype(np.float32)
def click():
    d = 0.05; n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(noise(d), 2000) * np.exp(-t * 90)).astype(np.float32)
def crowd(d):
    n = int(d * SR); t = np.arange(n) / SR
    s = lp_fast(noise(d), 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t) ** 2) + hp_fast(lp_fast(noise(d), 2500), 700) * 0.3
    return (s * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4).clip(0)).astype(np.float32)
def cheer(d=1.4):
    n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(lp_fast(noise(d), 3500), 500) * np.exp(-t * 1.6) * np.minimum(1, t / 0.08) * 1.2).astype(np.float32)
def kaching():
    a = np.pad(thunk(300, 0.12), (0, int(0.05 * SR))); b_ = ting()
    out = np.zeros(len(b_) + len(a), np.float32); out[:len(a)] += a; out[int(0.08 * SR):int(0.08 * SR) + len(b_)] += b_ * 1.3; return out
def coinclink():
    n = int(0.35 * SR); t = np.arange(n) / SR; f = rng.uniform(2500, 4200)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 18) * 0.5 + np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t * 25) * 0.3).astype(np.float32)
def hum(d, f0=100):
    n = int(d * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f0 * t) + 0.4 * np.sin(2 * np.pi * 2 * f0 * t)
    return lp_fast((s * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3).clip(0)).astype(np.float32), 600) * 0.5
def boing(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR; f = 180 + 140 * np.sin(2 * np.pi * 7 * t) * np.exp(-t * 4)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5)).astype(np.float32)
def shimmer(d=0.9):
    n = int(d * SR); t = np.arange(n) / SR
    return (sum(np.sin(2 * np.pi * f * t) for f in (1568, 2093, 2637, 3136)) / 4 * np.sin(np.pi * t / d) * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * t)) * 0.4).astype(np.float32)
def paper():
    d = 0.12; n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(lp_fast(noise(d), 5000), 1500) * np.sin(np.pi * t / d) * 0.6).astype(np.float32)
def yawn(d=0.9):
    n = int(d * SR); t = np.arange(n) / SR; f = 220 - 90 * t / d
    return (lp_fast((np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + noise(d) * 0.15).astype(np.float32), 900) * np.sin(np.pi * t / d) ** 2).astype(np.float32)

fr = {k: v for k, v in B.items()}
# --- city opening
for k in range(int((b['gta'] - 0.9) / 0.06)): place(sfx, click(), 0.2 + k * 0.06, 0.25)   # counter rolling
place(sfx, kaching(), b['gta'] - 0.6, 0.55)
place(sfx, crowd(b['first'] - 0.2), 0.0, 0.25)
place(sfx, whoosh(1.2), b['superhero'] + 0.2, 0.4); place(sfx, kaching(), b['cost'] - 0.5, 0.45)
for k in range(10): place(sfx, coinclink(), b['cost'] + 0.15 + k * 0.11, 0.35)
# --- 1958
place(sfx, whoosh(0.5), b['first'] - 0.25, 0.45); place(sfx, blip(660, 0.15), b['first'] + 0.1, 0.4)
for k in range(13): place(sfx, paper(), b['weeks'] + 0.15 + k * (b['scientist'] - b['weeks'] - 0.3) / 13, 0.4)
place(sfx, yawn(), b['bored'] - 0.2, 0.5)
place(sfx, whoosh(0.45), b['argue'] - 0.15, 0.4); place(sfx, crowd(b['ny'] - b['argue']), b['argue'], 0.2); place(sfx, boing(), b['argue'] + 0.45, 0.45)
place(sfx, whoosh(0.5), b['ny'] - 0.2, 0.4); place(sfx, crowd(2.2), b['ny'] + 0.3, 0.15)
place(sfx, yawn(), b['dull'] + 0.2, 0.45); place(sfx, hum(b['grab'] - b['machines'], 92), b['machines'], 0.35)
place(sfx, thunk(160, 0.3), F(B['grab'] + round((B['tennis'] - B['grab']) * 0.45) + 14), 0.6)
place(sfx, blip(440, 0.25), b['tennis'] - 0.03, 0.4)
# --- ball blips while the game is on screen
def blips(t0, t1, per_f, f0=880):
    t = t0
    while t < t1: place(sfx, blip(f0), t, 0.32); t += per_f / 2 / 30
blips(b['first'] + 0.4, b['weeks'] - 0.2, 46)
blips(b['ball'], b['boxes'] - 0.1, 46)
place(sfx, click(), b['knob'], 0.5); place(sfx, click(), b['knob'] + 0.15, 0.4)
place(sfx, click(), b['button'] - 0.03, 0.55); place(sfx, blip(990, 0.1), b['button'] + 0.05, 0.4)
place(sfx, cheer(1.8), b['hundreds'] + 0.3, 0.45); place(sfx, crowd(b['nextyear'] - b['hundreds']), b['hundreds'], 0.2)
blips(b['nextyear'] + 0.3, b['moon'] - 0.1, 46); blips(b['moon'], b['jupiter'] - 0.1, 70, 620); blips(b['jupiter'], b['apart'] - 0.1, 34, 1200)
place(sfx, creak(0.6, 140), b['apart'] + 0.15, 0.5); place(sfx, thunk(120, 0.35), F(B['apart'] + 26), 0.6)
for k in range(20): place(sfx, paper(), b['patents'] + 0.07 + k * 0.045, 0.3)
place(sfx, sting(), b['thisone'] - 0.05, 0.6)
place(sfx, ting(), b['simple'] + 0.1, 0.25)
# --- back to now
blips(b['later'], b['later'] + 1.2, 46)
place(sfx, whoosh(1.0), F(round((B['later'] + B['city']) / 2)) - 0.3, 0.55)
place(sfx, crowd(DUR - b['city']), b['city'], 0.2)
place(sfx, shimmer(), b['buttons'] + 0.1, 0.5)
place(sfx, whoosh(0.45), b['line'] - 0.15, 0.35); place(sfx, cheer(1.2), b['line'] + 0.3, 0.3)
place(sfx, kaching(), b['preorders'] + 0.4, 0.45)
place(sfx, blip(880, 0.12), b['question'] + 0.25, 0.35); place(sfx, blip(1320, 0.18), b['question'] + 0.4, 0.35)

# stems only: levels are set by mix.py (music and SFX at 50 % of the voice's gated RMS)
def write(name, x):
    x = x / max(1e-9, np.abs(x).max()) * 0.9   # absolute scale is irrelevant, mix.py re-levels
    with wave.open(name, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
write(f"music_{LANG}.wav", music); write(f"sfx_{LANG}.wav", sfx)
print("stems ok", N / SR)
