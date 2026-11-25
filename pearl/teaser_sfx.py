"""War sound design for the cold-open teaser, synthesized (no downloads). Stereo 48 kHz.
Layers: wind and sea, radial-engine fly-bys with Doppler, Morse "TORA TORA TORA" over radio static, air-raid siren,
anti-aircraft machine guns and flak, torpedo splashes, falling-bomb whistle, explosions with debris and reverb,
ear ringing on the intertitle, projector clatter and a dark drone underneath.
  python3 pearl/teaser_sfx.py out.wav"""
import os, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import teaser as T

SR = 48000; D = T.DUR; N = int(SR*D); t = np.arange(N)/SR
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)            # dry bus
RL = np.zeros(N); RR = np.zeros(N)          # reverb ("distant") bus

def filt(x, kind, f, order=4):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output='sos'), x)
def add(sig, at, g=1.0, pan=0.0, wet=0.0):
    """Place a mono signal at time `at`, constant-power pan (-1 left .. 1 right), `wet` = share sent to the reverb bus."""
    i = int(at*SR)
    if i >= N: return
    s = sig[:N - i] * g; a = (pan + 1) * np.pi/4; gl, gr = np.cos(a), np.sin(a)
    L[i:i+len(s)] += s*gl*(1-wet); R[i:i+len(s)] += s*gr*(1-wet)
    RL[i:i+len(s)] += s*gl*wet; RR[i:i+len(s)] += s*gr*wet
def env(n, a, r):
    e = np.ones(n); ka, kr = int(a*SR), int(r*SR)
    if ka: e[:ka] = np.linspace(0, 1, ka)
    if kr: e[-kr:] *= np.linspace(1, 0, kr)
    return e

# ---- ambience: wind + sea swells (stronger on the open sea, under everything at the harbour)
wind = filt(rng.normal(0, 1, N), 'low', 500) * (.6 + .4*np.sin(2*np.pi*t/5.3)**2)
waves = filt(rng.normal(0, 1, N), 'band', [180, 1400]) * (.35 + .65*np.sin(2*np.pi*t/3.1)**4)
amb = (wind*.5 + waves*.35) * np.where(t < T.S2, 1.0, np.where(t < T.S4, .45, .15))
add(amb / np.abs(amb).max(), 0, .22, 0)

# ---- dark drone with a swell into the big explosion
drone = sum(a*np.sin(2*np.pi*f*t + np.sin(2*np.pi*.07*t)*2) for f, a in [(55, 1), (65.4, .6), (82.4, .45), (110, .3)])
drone *= np.clip(t/2, 0, 1) * (1 + .9*np.exp(-((t - (T.S3 + T.BOOM))/2.5)**2)) * np.clip((D - t)/1.5, 0, 1)
add(drone / np.abs(drone).max(), 0, .13, 0)

# ---- radial engines: fly-by with Doppler, rumble from the firing rate, pan follows the plane
def flyby(dur, f0=78, depth=.14, pan0=-1, pan1=1, closest=.5):
    n = int(dur*SR); u = np.arange(n)/SR; tc = dur*closest
    f = f0 * (1 + depth*np.tanh((tc - u)/(dur*.18)))
    ph = 2*np.pi*np.cumsum(f)/SR
    tone = sum(np.sin(k*ph)/k**.8 for k in range(1, 9))
    fire = .55 + .45*(np.sin(ph*2.25) > 0)                       # 9-cylinder radial: uneven firing
    noise = filt(rng.normal(0, 1, n), 'band', [120, 2500]) * .9
    amp = 1/(1 + ((u - tc)/(dur*.16))**2)
    s = (tone*.5*fire + noise*fire) * amp * env(n, .2, .3)
    return filt(s, 'low', 3200), np.linspace(pan0, pan1, n)
def place_flyby(at, dur, g, pan0, pan1, **kw):
    s, pans = flyby(dur, pan0=pan0, pan1=pan1, **kw)
    seg = 4
    for j in range(seg):                                          # coarse moving pan
        a, b = len(s)*j//seg, len(s)*(j+1)//seg
        w = np.zeros(len(s)); w[a:b] = 1; w = np.convolve(w, np.ones(2400)/2400, 'same')
        add(s*w, at, g, float(pans[(a+b)//2]), .25)
for i, st in enumerate((0.2, 1.0, 1.8)):                         # carrier take-offs: roar then away to the right
    place_flyby(st, 3.0, .3, -.3, 1, closest=.55, f0=74 + i*5)
for i in range(2):                                                # torpedo bombers, low and left to right
    place_flyby(T.S3 + .6 + i*.2, 4.0, .5, -1, 1, closest=.5, f0=82 + i*6)
for i in range(3):                                                # dive bombers, from the right, screaming down
    place_flyby(T.S3 + 2.6 + i*.35, 3.6, .42, 1, -.6, closest=.45, f0=96 + i*7, depth=.22)
distant = sum(flyby(D, f0=70 + k*9, closest=.5)[0] for k in range(3))   # far-off formation hum over the map/harbour
add(distant * np.clip((t - T.S2)/1.0, 0, 1) * np.clip((T.S4 - t)/.5, 0, 1), 0, .18, 0, .5)

# ---- Morse "TORA TORA TORA" over radio static (map scene)
MORSE = {'T': '-', 'O': '---', 'R': '.-.', 'A': '.-'}
unit = .026; seq = []
for w in range(3):
    for ci, ch in enumerate('TORA'):
        for si, sym in enumerate(MORSE[ch]):
            seq.append((1 if sym == '.' else 3, True)); seq.append((1, False))
        seq.append((2, False))
    seq.append((4, False))
pos = T.S2 + .15; beep = np.zeros(N)
for ln, on in seq:
    a, b = int(pos*SR), int((pos + ln*unit)*SR)
    if on and b < N: beep[a:b] = np.sin(2*np.pi*760*t[a:b]) * env(b - a, .004, .004)
    pos += ln*unit
static = filt(rng.normal(0, 1, N), 'band', [900, 4000]) * (.5 + .5*(rng.random(N) < .002).astype(float))
radio = filt(beep*.8 + static*.12*((t > T.S2) & (t < T.S3)), 'band', [400, 3000])
add(radio, 0, .32, .15)

# ---- air-raid siren, wailing far away over the harbour
u = t - (T.S3 + .3); on = (u > 0) & (t < T.S4 + .5)
fs = 330 + 230*(.5 - .5*np.cos(2*np.pi*np.clip(u, 0, None)/4.5))
ph = 2*np.pi*np.cumsum(fs)/SR
siren = (np.sin(ph) + .35*np.sin(2*ph) + .15*np.sin(3*ph)) * on * np.clip(u/1.2, 0, 1) * np.clip((T.S4 + .5 - t)/.6, 0, 1)
add(filt(siren, 'low', 1800), 0, .16, -.5, .7)

# ---- anti-aircraft: machine-gun bursts and flak bursts, scattered in stereo
def mg_burst(n_shots, rate):
    n = int((n_shots/rate + .3)*SR); s = np.zeros(n); tt = np.arange(int(.06*SR))/SR
    pop = filt(rng.normal(0, 1, len(tt)), 'band', [700, 5000])*np.exp(-tt*90) + .8*np.sin(2*np.pi*110*tt)*np.exp(-tt*60)
    for k in range(n_shots):
        i = int((k/rate + rng.uniform(0, .01))*SR); s[i:i+len(pop)] += pop*rng.uniform(.7, 1)
    return s
def boom(size=1.0, dur=2.5):
    n = int(dur*SR); u = np.arange(n)/SR
    sub = np.sin(2*np.pi*np.cumsum(30 + 50*np.exp(-u*7))/SR) * np.exp(-u*(3.5/size))
    body = filt(rng.normal(0, 1, n), 'low', 900*size**.3) * np.exp(-u*(4/size)) * 1.4
    crack = filt(rng.normal(0, 1, n), 'high', 2500) * np.exp(-u*30) * .6
    debris = filt((rng.random(n) < .0015*np.exp(-u*1.5)).astype(float)*rng.normal(0, 1, n), 'band', [1500, 6000]) * 3
    s = (sub*1.2 + body + crack + debris) * env(n, .003, .4)
    return s / np.abs(s).max()
for k in range(14):
    at = T.S3 + 3.2 + rng.uniform(0, 6.8); add(mg_burst(int(rng.integers(5, 12)), rng.uniform(9, 13)), at, rng.uniform(.25, .45), rng.uniform(-1, 1), .45)
for k in range(9):
    at = T.S3 + 3.6 + rng.uniform(0, 6.0); add(filt(boom(.5, 1.6), 'low', 1400), at, rng.uniform(.2, .35), rng.uniform(-1, 1), .7)

# ---- torpedo hits: muffled underwater boom + rising water column
def splash():
    n = int(1.6*SR); u = np.arange(n)/SR
    s = filt(rng.normal(0, 1, n), 'band', [300, 3500]) * (np.clip(u/.15, 0, 1) * np.exp(-u*2.2))
    return s / np.abs(s).max()
for h, pan in zip(T.HITS[:2], (-.45, .0)):
    add(filt(boom(1.2, 2.6), 'low', 500), T.S3 + h, .9, pan, .35)
    add(splash(), T.S3 + h + .05, .5, pan, .3)

# ---- falling-bomb whistle, then the big explosion (USS Arizona)
w0, w1 = T.S3 + 4.6, T.S3 + T.BOOM
n = int((w1 - w0)*SR); u = np.arange(n)/SR
fw = 1700 - 1000*(u/u[-1])**1.3
whistle = np.sin(2*np.pi*np.cumsum(fw + 12*np.sin(2*np.pi*7*u))/SR) * (u/u[-1])**1.5
add(whistle, w0, .22, .5, .15)
big = boom(2.4, 5.5); add(big, T.S3 + T.BOOM, 2.0, .5, .3); add(big, T.S3 + T.BOOM + .08, .5, -.4, .9)
for k in range(10):                                               # secondary explosions / ammunition cooking off
    add(boom(.4, 1.0), T.S3 + T.BOOM + .7 + rng.uniform(0, 3.0), rng.uniform(.15, .3), rng.uniform(-.2, .9), .6)
fire = filt(rng.normal(0, 1, N), 'band', [80, 1600]) * (1 + .6*(rng.random(N) < .003)) * np.clip((t - T.S3 - T.BOOM)/.5, 0, 1) * np.clip((T.S4 + .3 - t)/.4, 0, 1)
add(fire, 0, .12, .5, .4)

# ---- intertitle: low impact, then ringing ears over muffled silence
add(boom(1.6, 3.5), T.S4 + .02, .55, 0, .6)
n = int(3.6*SR); u = np.arange(n)/SR
ring = np.sin(2*np.pi*3600*u) * np.exp(-u*.9) * env(n, .05, 1.2)
add(ring, T.S4 + .1, .05, 0, 0)

# ---- projector clatter throughout (vintage film)
clat = np.zeros(N)
for k in range(int(D*24)):
    i = int(k*SR/24); m = int(.01*SR)
    if i + m < N: clat[i:i+m] += rng.normal(0, 1, m)*np.exp(-np.arange(m)/SR*450)
add(filt(clat, 'band', [1500, 7000]) + filt(rng.normal(0, 1, N), 'high', 3000)*.08, 0, .05, 0)

# ---- reverb on the distant bus, master and write
ir_n = int(2.2*SR); ir = rng.normal(0, 1, ir_n) * np.exp(-np.arange(ir_n)/SR*2.6); ir = filt(ir, 'low', 4000); ir /= np.abs(ir).sum()/40
L += fftconvolve(RL, ir)[:N]; R += fftconvolve(RR, ir)[:N]
mix = np.stack([L, R], 1); mix *= np.clip(t/.4, 0, 1)[:, None] * np.clip((D - t)/1.2, 0, 1)[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.6) / np.tanh(1.6) * .95                 # gentle saturation
out = sys.argv[1] if len(sys.argv) > 1 else 'teaser_sfx.wav'
w = wave.open(out, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix*32767).astype(np.int16).tobytes()); w.close()
print('wrote', out)
