"""Find pauses (low-energy runs) in a mono/stereo 16-bit WAV. Usage: python3 gaps.py voice.wav"""
import wave, struct, math, sys

def gaps(path, thr=-44, mind=0.12, hopms=20):
    w = wave.open(path); sr = w.getframerate(); ch = w.getnchannels()
    d = w.readframes(w.getnframes()); s = struct.unpack(f'<{len(d)//2}h', d)
    if ch > 1: s = s[::ch]
    hop = int(sr * hopms / 1000); db = []
    for i in range(0, len(s) - hop, hop):
        seg = s[i:i + hop]; r = math.sqrt(sum(x * x for x in seg) / hop)
        db.append(20 * math.log10(r / 32768 + 1e-9))
    out = []; st = None
    for k, v in enumerate(db + [0]):
        if v < thr and st is None: st = k
        if v >= thr and st is not None:
            if (k - st) * hop / sr >= mind: out.append((round(st * hop / sr, 2), round(k * hop / sr, 2)))
            st = None
    return out, len(s) / sr

if __name__ == '__main__':
    g, dur = gaps(sys.argv[1]); print(dur); print(' '.join(f'{a}-{b}' for a, b in g))
