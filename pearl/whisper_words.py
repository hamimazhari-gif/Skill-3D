"""Word timestamps of narasi_full.wav with faster-whisper -> words.json [[word, start, end], ...]."""
import json, os
os.environ.setdefault('HF_HUB_DISABLE_XET', '1')
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4)
import subprocess, numpy as np
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'narasi_full.wav', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
audio = np.frombuffer(raw, np.float32)
segs, _ = m.transcribe(audio, language='id', word_timestamps=True, vad_filter=False, beam_size=5)
out = []
for s in segs:
    for w in s.words: out.append([w.word.strip(), round(w.start, 3), round(w.end, 3)])
json.dump(out, open('words.json', 'w'), ensure_ascii=False)
print(len(out), out[:12], out[-5:])
