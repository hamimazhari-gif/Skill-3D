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

# ===== Knocker-upper story sounds =====
# knuckle/pole tap on a window pane: short woody knock + glassy ring
def tap_one():
    d = 0.22; n = int(d * SR); t = tl(d)
    knock = np.sin(2 * np.pi * (380 + 200 * np.exp(-t * 60)) * t) * env(n, 0.001, 0.018)
    glass = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(2350, 0.5), (3710, 0.3), (5230, 0.15)]) * env(n, 0.001, 0.05)
    return knock + 0.35 * glass + bp(noise(d), 1500, 6000) * env(n, 0.0005, 0.004) * 0.6
save('glass_tap.wav', tap_one())
# a quick volley of three taps
buf = np.zeros(int(1.0 * SR))
for k in range(3): place(buf, tap_one() * (1 - 0.1 * k), 0.02 + k * 0.28)
save('glass_tap3.wav', buf)
# dried pea hitting glass: tiny high tick
d = 0.12; n = int(d * SR); t = tl(d)
save('pea_tik.wav', (np.sin(2 * np.pi * 4200 * t) * 0.6 + np.sin(2 * np.pi * 6100 * t) * 0.3) * env(n, 0.0005, 0.02) + bp(noise(d), 3000, 9000) * env(n, 0.0002, 0.003))
# pea shooter puff: breathy burst
d = 0.25; n = int(d * SR)
save('puff.wav', bp(noise(d), 400, 2500) * env(n, 0.005, 0.05) + np.sin(2 * np.pi * 180 * tl(d)) * env(n, 0.002, 0.02) * 0.4)
# old twin-bell alarm clock: hammer hitting two bells very fast
d = 2.0; t = tl(d); buf = np.zeros(int(d * SR))
for k in range(int(d * 22)):
    f = 1850 if k % 2 else 2080; tt = tl(0.09)
    place(buf, (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt)) * env(len(tt), 0.0005, 0.03), k / 22)
save('alarm_bell.wav', buf * np.minimum(1, (d - t) / 0.08))
# phone alarm: repeating beep-beep pattern
d = 2.4; buf = np.zeros(int(d * SR))
for k in range(8):
    for j in range(2): tt = tl(0.07); place(buf, np.sign(np.sin(2 * np.pi * 1320 * tt)) * 0.5 * np.minimum(1, (0.07 - tt) / 0.01), k * 0.3 + j * 0.1)
save('phone_alarm.wav', lp(buf, 5000))
# soft UI tap for pressing snooze
d = 0.08; n = int(d * SR)
save('snooze_tap.wav', np.sin(2 * np.pi * (900 - 300 * tl(d) / d) * tl(d)) * env(n, 0.001, 0.02))
# factory steam whistle: a chord with breath noise, swell and fall
d = 2.2; t = tl(d)
ch = sum(np.sin(2 * np.pi * f * (1 + 0.004 * np.sin(2 * np.pi * 5 * t)) * t) * a for f, a in [(392, 1.0), (494, 0.8), (587, 0.6), (784, 0.25)])
save('steam_whistle.wav', (ch + bp(noise(d), 500, 3000) * 0.5) * np.minimum(1, t / 0.15) * np.minimum(1, (d - t) / 0.5))
# snore: low rasp on the in-breath, whistle on the out-breath
d = 3.2; t = tl(d); buf = np.zeros(int(d * SR))
for k in range(2):
    tt = tl(0.9); e = np.sin(np.pi * tt / 0.9) ** 2
    rasp = lp(noise(0.9), 300) * (1 + np.sin(2 * np.pi * 28 * tt)) * e * 2.5
    place(buf, rasp, 0.05 + k * 1.6)
    tt2 = tl(0.6); place(buf, np.sin(2 * np.pi * np.cumsum(900 + 300 * tt2) / SR) * np.sin(np.pi * tt2 / 0.6) ** 2 * 0.15, 1.0 + k * 1.6)
save('snore.wav', buf)
# few coins dropped into a palm
d = 0.9; buf = np.zeros(int(d * SR))
for k, at in enumerate([0.02, 0.2, 0.36]):
    tt = tl(0.25); place(buf, sum(np.sin(2 * np.pi * f * tt) * a for f, a in [(3100 + 200 * k, 0.6), (4700 + 150 * k, 0.35), (6900, 0.15)]) * env(len(tt), 0.0005, 0.06), at)
save('coin_drop.wav', buf)
# rubber stamp "TRUE STORY!"
d = 0.3; n = int(d * SR); t = tl(d)
save('stamp.wav', np.sin(2 * np.pi * (140 + 120 * np.exp(-t * 50)) * t) * env(n, 0.001, 0.05) + bp(noise(d), 300, 3000) * env(n, 0.0005, 0.02) * 0.8)

# ===== Uang seratus ribu (a banknote's day) =====
# ATM keypad: three short dual-tone beeps
d = 0.9; buf = np.zeros(int(d * SR))
for k, (f1, f2) in enumerate([(770, 1336), (852, 1209), (697, 1477)]):
    tt = tl(0.11); place(buf, (np.sin(2 * np.pi * f1 * tt) + np.sin(2 * np.pi * f2 * tt)) * np.minimum(1, tt / 0.005) * np.minimum(1, (0.11 - tt) / 0.01), 0.02 + k * 0.24)
save('atm_beep.wav', buf * 0.6)
# cash dispenser: motor whirr rising, rollers, paper riffle, a clunk
d = 1.1; t = tl(d)
f = 70 + 50 * np.minimum(1, t / 0.3)
motor = lp(2 * ((np.cumsum(f) / SR) % 1) - 1, 900) * np.minimum(1, t / 0.05) * np.minimum(1, (0.85 - t) / 0.05).clip(0)
riffle = np.zeros(len(t))
for k in range(14): place(riffle, bp(noise(0.03), 1500, 7000) * env(int(0.03 * SR), 0.001, 0.008), 0.35 + k * 0.03)
clunk = np.zeros(len(t)); tt = tl(0.2); place(clunk, np.sin(2 * np.pi * (160 + 80 * np.exp(-tt * 40)) * tt) * env(len(tt), 0.001, 0.04), 0.88)
save('cash_dispense.wav', motor * 0.5 + riffle * 0.6 + clunk)
# kiss "mwah": lip smack + short vowel
d = 0.45; n = int(d * SR); t = tl(d)
smack = bp(noise(d), 800, 5000) * env(n, 0.0005, 0.008) + np.sin(2 * np.pi * (500 - 300 * t) * t) * env(n, 0.001, 0.02)
vow = np.zeros(n); tt = tl(0.28)
v = sum(np.sin(2 * np.pi * h * 220 * (1 - 0.15 * tt / 0.28) * tt) * a for h, a in [(1, 0.5), (3, 0.3), (4, 0.25), (6, 0.1)]) * np.sin(np.pi * tt / 0.28) ** 2
place(vow, v * 0.35, 0.06)
save('kiss.wav', smack + vow)
# parking attendant whistle: "prit! prit!" (trilled pea whistle)
d = 0.8; buf = np.zeros(int(d * SR))
for k in range(2):
    tt = tl(0.22); trill = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 32 * tt))
    w = np.sin(2 * np.pi * np.cumsum(2900 + 120 * np.sin(2 * np.pi * 32 * tt)) / SR) * trill * np.minimum(1, tt / 0.01) * np.minimum(1, (0.22 - tt) / 0.03)
    place(buf, w + bp(noise(0.22), 2000, 6000) * 0.15, 0.02 + k * 0.32)
save('whistle_prit.wav', buf)
# scooter engine: putter idling then a rev
d = 2.0; t = tl(d)
rate = 22 + 18 * np.clip((t - 0.9) / 0.5, 0, 1)
ph = np.cumsum(rate) / SR
pulses = np.exp(-((ph % 1) * 9)) * (1 + 0.3 * rng.standard_normal(len(t)) * 0.2)
saw = lp(2 * ((np.cumsum(rate * 3) / SR) % 1) - 1, 600)
save('scooter.wav', (lp(pulses, 900) * 1.2 + saw * 0.35) * np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.3))
# espresso machine: pump buzz + steam hiss swell
d = 1.6; t = tl(d)
pump = lp(np.sign(np.sin(2 * np.pi * 100 * t)), 500) * 0.25 * np.minimum(1, t / 0.05)
hiss = hp(noise(d), 3000) * np.sin(np.pi * np.clip((t - 0.3) / 1.2, 0, 1)) ** 2
save('espresso.wav', (pump + hiss * 0.5) * np.minimum(1, (d - t) / 0.1))
# paper bill fluttering through the air
d = 0.7; buf = np.zeros(int(d * SR))
for k in range(16): place(buf, bp(noise(0.035), 600, 4500) * env(int(0.035 * SR), 0.002, 0.012) * (0.6 + 0.4 * np.sin(k)), 0.02 + k * 0.04)
save('paper_flutter.wav', buf)
# wallet velcro rip
d = 0.5; t = tl(d); buf = np.zeros(int(d * SR))
for k in range(60): place(buf, bp(noise(0.006), 1000, 7000) * env(int(0.006 * SR), 0.0003, 0.002) * rng.uniform(0.4, 1.0), 0.02 + k * 0.0065 + rng.uniform(0, 0.002))
save('velcro.wav', buf)
# a fly buzzing out of the empty wallet
d = 1.6; t = tl(d)
f = 210 + 25 * np.sin(2 * np.pi * 3.1 * t) + 15 * np.sin(2 * np.pi * 7.3 * t)
save('fly_buzz.wav', lp(2 * ((np.cumsum(f) / SR) % 1) - 1, 2500) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.7 * t) ** 2) * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.3))
# minibus horn "tin tin"
d = 0.7; buf = np.zeros(int(d * SR))
for k in range(2):
    tt = tl(0.16); place(buf, lp(np.sign(np.sin(2 * np.pi * 420 * tt)) + np.sign(np.sin(2 * np.pi * 525 * tt)), 3000) * np.minimum(1, tt / 0.005) * np.minimum(1, (0.16 - tt) / 0.01), 0.02 + k * 0.24)
save('horn.wav', buf * 0.5)
# a bill slipping into a clay piggy bank: paper swish + hollow clay knock
d = 0.6; n = int(d * SR); t = tl(d); buf = np.zeros(n)
place(buf, bp(noise(0.2), 900, 5000) * np.sin(np.pi * tl(0.2) / 0.2) * 0.5, 0.0)
tt = tl(0.3); place(buf, sum(np.sin(2 * np.pi * f * tt) * a for f, a in [(310, 0.8), (720, 0.3), (1450, 0.1)]) * env(len(tt), 0.001, 0.05), 0.22)
save('slot_drop.wav', buf)

# ===== Retro game (chiptune) sounds — "Misi beli telur" =====
def chip(notes, dur=0.09, duty=0.5, gap=0.0, vib=0.0):
    out = []
    for f in notes:
        t = tl(dur); ph = (np.cumsum(f * (1 + vib * np.sin(2 * np.pi * 9 * t))) / SR) % 1
        w = np.where(ph < duty, 1.0, -1.0) * np.minimum(1, t / 0.004) * np.minimum(1, (dur - t) / 0.01)
        out.append(w); out.append(np.zeros(int(gap * SR)))
    return lp(np.concatenate(out), 7000) * 0.5
# level up: rising arpeggio C-E-G-C plus a sparkle
save('chip_levelup.wav', np.concatenate([chip([523, 659, 784, 1047, 1319], 0.075, 0.25), chip([1568], 0.22, 0.25, vib=0.02)]))
# game over: slow falling melody
save('chip_gameover.wav', np.concatenate([chip([784, 740, 698], 0.22, 0.5, gap=0.03), chip([659], 0.7, 0.5, vib=0.03)]))
# coin: two quick high notes
save('chip_coin.wav', chip([988, 1319], 0.07, 0.25))
# hurt / life lost: fast falling blips
save('chip_hurt.wav', chip([660, 520, 400, 300], 0.05, 0.5))
# start jingle
save('chip_start.wav', chip([392, 523, 659, 784, 659, 784], 0.08, 0.25))
# error blip (brain error)
save('chip_error.wav', chip([220, 180, 220, 180], 0.06, 0.5))

# ===== "Menjual Menara Eiffel" =====
# tape rewind: motor whirr with a rising squeal and chattering garble
d = 1.4; t = tl(d)
whirr = np.sin(2 * np.pi * np.cumsum(120 + 80 * t / d) / SR) * 0.4 + bp(noise(d), 300, 2500) * 0.25
squeal = sweep(900, 3200, d) * 0.25 * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t))
garble = bp(noise(d), 600, 3000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 17 * t))) * 0.3
x = (whirr + squeal + garble) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.15)
save('tape_rewind.wav', x)
# suitcase latches: two metal clicks
buf = np.zeros(int(0.5 * SR))
for at in (0.02, 0.2):
    tt = tl(0.12); place(buf, (bp(noise(0.12), 2000, 8000) * 0.6 + np.sin(2 * np.pi * 2400 * tt) * 0.4) * env(len(tt), 0.0005, 0.012), at)
save('latch.wav', buf)
# steam train chuffs (4 s)
buf = np.zeros(int(4.0 * SR)); at = 0.0; k = 0
while at < 3.7:
    place(buf, bp(noise(0.25), 200, 2500) * env(int(0.25 * SR), 0.005, 0.07) * (1.0 if k % 2 else 0.7), at); at += 0.32 - min(0.12, k * 0.01); k += 1
save('train_chuff.wav', buf)
