# Procedural cartoon sound effects (numpy only, deterministic). Writes public/sfx/synth/*.wav (44.1 kHz mono 16-bit).
# usage: python3 -I tools/synth_sfx.py [out_dir]
import sys, os, wave
import numpy as np

SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx', 'synth')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def tl(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))


def lp(x, fc):  # one-pole low-pass
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y


def hp(x, fc): return x - lp(x, fc)
def bp(x, lo, hi): return hp(lp(x, hi), lo)
def env(n, a, d, sus=0.0):  # attack (s), exponential decay time constant (s)
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
    return e if not sus else np.maximum(e, 0)


def sweep(f0, f1, d, shape='exp'):
    t = tl(d); f = f0 * (f1 / f0) ** (t / d) if shape == 'exp' else f0 + (f1 - f0) * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def place(buf, x, at):
    i = int(at * SR); j = min(len(buf), i + len(x)); buf[i:j] += x[:j - i]; return buf


def save(name, x, peak=0.85):
    x = np.asarray(x, float); m = np.max(np.abs(x)) or 1; x = x / m * peak
    fade = min(len(x), int(0.01 * SR)); x[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())
    print(name, f'{len(x) / SR:.2f}s')


def step(kind='soft'):
    d = 0.14; n = int(d * SR); t = tl(d)
    thump = np.sin(2 * np.pi * (90 + 60 * np.exp(-t * 40)) * t) * env(n, 0.002, 0.03)
    click = bp(noise(d), 800, 4000) * env(n, 0.001, 0.012) * (0.5 if kind == 'soft' else 0.8)
    return thump + click


def steps(dur, every, kind='soft', jitter=0.02):
    buf = np.zeros(int(dur * SR)); k = 0; t = 0.02
    while t < dur - 0.15:
        s = step(kind) * (1.0 if k % 2 else 0.8); place(buf, s, t + rng.uniform(-jitter, jitter)); t += every; k += 1
    return buf


# --- footsteps ---------------------------------------------------------------------------------------------------
save('footsteps_walk.wav', steps(3.0, 0.36))
save('footsteps_run.wav', steps(2.0, 0.19, 'hard', 0.01))
# grandpa: slow scuffing steps with a wooden cane tap
buf = np.zeros(int(3.2 * SR)); t = 0.05
while t < 3.0:
    sc = bp(noise(0.22), 300, 2500) * env(int(0.22 * SR), 0.05, 0.08) * 0.6
    place(buf, sc + np.pad(step()[:int(0.14 * SR)], (0, len(sc) - int(0.14 * SR))) * 0.6, t)
    tap = bp(noise(0.05), 1500, 6000) * env(int(0.05 * SR), 0.0005, 0.006) + np.sin(2 * np.pi * 950 * tl(0.05)) * env(int(0.05 * SR), 0.0005, 0.01) * 0.6
    place(buf, tap, t + 0.28); t += 0.62
save('cane_shuffle.wav', buf)

# --- cartoon accents ---------------------------------------------------------------------------------------------
d = 0.7; t = tl(d); f = 180 * (1 + 0.35 * np.sin(2 * np.pi * 16 * t) * np.exp(-t * 4)) * (1 + 0.6 * np.exp(-t * 10))
save('boing.wav', np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.005, 0.25))
d = 0.6; t = tl(d); f = 500 * (1 + 0.02 * np.sin(2 * np.pi * 6 * t)) * (2.6 ** (t / d))
save('slide_whistle_up.wav', (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.1 * noise(d) * 0.2) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.08))
f = 1300 * (1 + 0.02 * np.sin(2 * np.pi * 6 * t)) * (0.38 ** (t / d))
save('slide_whistle_down.wav', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.08))
d = 0.5; t = tl(d)
save('thud.wav', np.sin(2 * np.pi * (55 + 90 * np.exp(-t * 25)) * t) * env(len(t), 0.002, 0.12) + lp(noise(d), 600) * env(len(t), 0.001, 0.04) * 0.8)
# quick whip-pan swish
d = 0.35; t = tl(d); x = noise(d); y = np.zeros_like(x)
for k, (lo, hi) in enumerate([(400, 1200), (900, 2600), (1800, 5000)]): y += bp(x, lo, hi) * np.exp(-((t - 0.08 - k * 0.06) / 0.05) ** 2)
save('swish.wav', y)
# heart / happy pop
d = 0.25; save('heart_pop.wav', sweep(520, 1250, d) * env(int(d * SR), 0.003, 0.07))
# sparkle twinkle
buf = np.zeros(int(1.2 * SR))
for k, fr in enumerate([2093, 2637, 3136, 3951, 3136, 4186]): place(buf, np.sin(2 * np.pi * fr * tl(0.4)) * env(int(0.4 * SR), 0.002, 0.12) * (0.9 - k * 0.08), 0.03 + k * 0.09)
save('sparkle.wav', buf)
# cash register: drawer clunk + bell
d = 1.3; t = tl(d); n = len(t)
bell = sum(a * np.sin(2 * np.pi * fr * t) * np.exp(-t / dd) for fr, a, dd in [(2093, 1, 0.5), (2637, 0.7, 0.4), (4186, 0.4, 0.25), (5274, 0.25, 0.18)])
clunk = (lp(noise(d), 900) * env(n, 0.001, 0.03) + np.sin(2 * np.pi * 140 * t) * env(n, 0.001, 0.05)) * 0.9
save('ka_ching.wav', clunk + np.concatenate([np.zeros(int(0.09 * SR)), bell[:n - int(0.09 * SR)]]) * 0.6)
# party horn: buzzy sawtooth that unrolls up
d = 0.75; t = tl(d); f = 380 + 140 * np.minimum(1, t / 0.25)
ph = np.cumsum(f) / SR; saw = 2 * (ph % 1) - 1
save('party_horn.wav', lp(saw + 0.3 * np.sign(np.sin(2 * np.pi * ph * 2)), 3500) * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.1) * (1 + 0.15 * np.sin(2 * np.pi * 28 * t)))
# punch clock: mechanical ka-chunk
d = 0.45; t = tl(d); n = len(t)
k1 = bp(noise(d), 600, 5000) * env(n, 0.0005, 0.01) + np.sin(2 * np.pi * 320 * t) * env(n, 0.001, 0.03)
save('punch_clock.wav', k1 + np.concatenate([np.zeros(int(0.12 * SR)), (lp(noise(d), 1500) * env(n, 0.0005, 0.04) + np.sin(2 * np.pi * 110 * t) * env(n, 0.001, 0.06))[:n - int(0.12 * SR)]]) * 1.2)
# clock ticking (2 ticks per second)
buf = np.zeros(int(4.0 * SR))
for k in range(8): place(buf, (bp(noise(0.03), 2000, 8000) * env(int(0.03 * SR), 0.0003, 0.004) + np.sin(2 * np.pi * (2400 if k % 2 else 1900) * tl(0.03)) * env(int(0.03 * SR), 0.0003, 0.006) * 0.5), 0.05 + k * 0.5)
save('clock_tick.wav', buf)
# page flips (book pile growing)
buf = np.zeros(int(1.0 * SR))
for k in range(4):
    dd = 0.16; tt = tl(dd); place(buf, bp(noise(dd), 1500, 7000) * np.sin(np.pi * tt / dd) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 40 * tt)), 0.02 + k * 0.2)
save('page_flips.wav', buf)
# knee creak: low jittery sawtooth
d = 0.9; t = tl(d); f = 95 + 25 * np.sin(2 * np.pi * 1.3 * t) + rng.standard_normal(len(t)).cumsum() * 0.02
ph = np.cumsum(f) / SR; pulse = (ph % 1 < 0.08).astype(float)
save('creak.wav', bp(pulse + 0.05 * noise(d), 200, 2500) * np.sin(np.pi * t / d) ** 0.5)

# --- crowds and ambience -----------------------------------------------------------------------------------------
def babble(d, voices=14, lo=250, hi=1600, rate=4.0):
    t = tl(d); y = np.zeros(len(t))
    for v in range(voices):
        f0 = rng.uniform(110, 260); f = f0 * (1 + 0.12 * np.sin(2 * np.pi * rng.uniform(1, 3) * t + rng.uniform(0, 6)))
        ph = np.cumsum(f) / SR; src = 2 * (ph % 1) - 1
        syl = np.clip(np.sin(2 * np.pi * rng.uniform(rate * 0.7, rate * 1.3) * t + rng.uniform(0, 6)), 0, 1) ** 2
        y += src * syl * rng.uniform(0.5, 1)
    y = bp(y, lo, hi) + bp(noise(d), lo, hi) * 0.15
    return y * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.4)
save('crowd_murmur.wav', babble(5.0))
save('crowd_angry.wav', babble(4.0, voices=18, lo=300, hi=2200, rate=6.5) * (1 + 0.4 * np.sin(2 * np.pi * 0.9 * tl(4.0))))
# cheer: noisy "yay" swell + babble
d = 2.2; t = tl(d); sw = np.sin(np.pi * np.minimum(1, t / d)) ** 0.7
save('crowd_cheer.wav', (bp(noise(d), 500, 3500) * 0.7 + babble(d, 20, 300, 2500, 3)) * sw)
# applause: many hand claps
buf = np.zeros(int(2.6 * SR))
for k in range(260):
    at = rng.uniform(0, 2.4) * (0.6 + 0.4 * rng.uniform()); place(buf, bp(noise(0.03), 900, 6000) * env(int(0.03 * SR), 0.0005, 0.007) * rng.uniform(0.4, 1), at)
save('applause.wav', buf * np.minimum(1, (2.6 - tl(2.6)) / 0.8))
# birds (park)
buf = np.zeros(int(4.0 * SR))
for k in range(9):
    at = 0.1 + k * 0.42 + rng.uniform(-0.1, 0.1); f0 = rng.uniform(2800, 4200)
    for j in range(rng.integers(2, 4)): place(buf, sweep(f0, f0 * rng.uniform(1.2, 1.5), 0.07) * env(int(0.07 * SR), 0.005, 0.03), at + j * 0.09)
save('birds.wav', buf)
# frying (warung gorengan): crackle + hiss
d = 4.0; buf = bp(noise(d), 3000, 9000) * 0.25
for k in range(500): place(buf, bp(noise(0.01), 2000, 9000) * env(int(0.01 * SR), 0.0002, 0.002) * rng.uniform(0.3, 1.3), rng.uniform(0, d - 0.02))
save('frying.wav', buf * np.minimum(1, tl(d) / 0.3) * np.minimum(1, (d - tl(d)) / 0.5))
# space rumble (Earth overcrowding)
d = 4.0; t = tl(d)
save('rumble.wav', (lp(noise(d), 120) * 3 + np.sin(2 * np.pi * 42 * t) * 0.3) * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 0.6))
# birthday: kazoo-like "ta-da" (two notes)
buf = np.zeros(int(1.0 * SR))
for k, (fr, dd) in enumerate([(523, 0.16), (784, 0.55)]):
    tt = tl(dd); ph = np.cumsum(fr * (1 + 0.01 * np.sin(2 * np.pi * 6 * tt))) / SR
    place(buf, lp(2 * (ph % 1) - 1, 2500) * np.minimum(1, tt / 0.01) * np.minimum(1, (dd - tt) / 0.05), 0.02 + k * 0.18)
save('tada.wav', buf)
# wobble "uh-oh" (two falling notes)
buf = np.zeros(int(0.9 * SR))
for k, (f0, f1) in enumerate([(520, 470), (400, 300)]):
    dd = 0.3; place(buf, sweep(f0, f1, dd) * np.minimum(1, tl(dd) / 0.01) * np.minimum(1, (dd - tl(dd)) / 0.08), 0.02 + k * 0.33)
save('uh_oh.wav', buf)
