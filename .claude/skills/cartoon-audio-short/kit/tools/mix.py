#!/usr/bin/env python3
"""Level-locked mix:  python3 mix.py voice.mp3 music.wav sfx.wav [out=mix_raw.wav]

Music  -> exactly 50 % of the voice's gated RMS (-6.0 dB).
SFX    -> 50 % of the voice's gated RMS, then lowered if needed so its peak <= 0.7 x the voice peak.
Voice is untouched. No ducking, no compression: only static linear gains. Output is 32-bit float
(no clipping here); finish.sh applies one linear loudness gain plus a -1 dBFS peak limiter.
"""
import subprocess, sys
import numpy as np

SR = 48000

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)

def gated_rms(x, block=0.4, abs_gate=-70.0, rel_gate=-10.0):
    """RMS over 400 ms blocks, ignoring silent blocks (absolute gate) and quiet ones (relative gate)."""
    n = int(block * SR); hop = n // 4
    if len(x) < n: x = np.pad(x, (0, n - len(x)))
    ms = np.array([np.mean(x[i:i + n] ** 2) for i in range(0, len(x) - n + 1, hop)])
    ms = ms[ms > 10 ** (abs_gate / 10)]
    if not len(ms): return 0.0
    ms = ms[ms > np.mean(ms) * 10 ** (rel_gate / 10)]
    return float(np.sqrt(np.mean(ms)))

db = lambda r: 20 * np.log10(max(r, 1e-12))

def main():
    if len(sys.argv) < 4: sys.exit(__doc__)
    voice, music, sfx = (load(p) for p in sys.argv[1:4]); out = sys.argv[4] if len(sys.argv) > 4 else "mix_raw.wav"
    N = len(voice)  # the picture and the mix are exactly as long as the voice
    fit = lambda x: np.pad(x[:N], (0, max(0, N - len(x))))
    music, sfx = fit(music), fit(sfx)
    v = gated_rms(voice); vpk = np.abs(voice).max()
    if v == 0: sys.exit("voice is silent")
    m = gated_rms(music); s = gated_rms(sfx)
    gm = 0.5 * v / m if m else 0.0
    gs = 0.5 * v / s if s else 0.0
    if gs and np.abs(sfx).max() * gs > 0.7 * vpk: gs = 0.7 * vpk / np.abs(sfx).max()
    mix = voice + music * gm + sfx * gs
    fade = int(0.04 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-c:a", "pcm_f32le", out], input=mix.astype(np.float32).tobytes(), check=True)
    print(f"voice  gated RMS {db(v):6.1f} dBFS, peak {db(vpk):6.1f} dBFS")
    if m: print(f"music  {db(m * gm) - db(v):+5.1f} dB vs voice (target -6.0)")
    if s: print(f"sfx    {db(s * gs) - db(v):+5.1f} dB vs voice (target <= -6.0), peak {np.abs(sfx).max() * gs / vpk:.2f} x voice peak")
    print(f"mix peak {db(np.abs(mix).max()):.1f} dBFS (float, limiter in finish.sh) -> {out}")

if __name__ == "__main__": main()
