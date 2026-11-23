"""Match script words to Whisper words (difflib on normalised tokens); writes word anchors per paragraph into
timing.json as 'w': [[char_index, time], ...] (times on narasi_full.wav). Numbers spelled out in the script vs digits
in the transcript simply stay unmatched and are interpolated."""
import json, re, difflib
T = json.load(open('timing.json', encoding='utf-8')); W = json.load(open('words.json', encoding='utf-8'))
norm = lambda s: re.sub(r'[^0-9a-z]', '', s.lower())
sw = []                                     # (para idx, char idx, token)
for pi, p in enumerate(T['paras']):
    for m in re.finditer(r'\S+', p['text']):
        tok = norm(m.group())
        if tok: sw.append((pi, m.start(), tok))
ww = [(norm(w[0]), w[1]) for w in W if norm(w[0])]
sm = difflib.SequenceMatcher(None, [s[2] for s in sw], [w[0] for w in ww], autojunk=False)
for p in T['paras']: p['w'] = []
n = 0
for a, b, size in sm.get_matching_blocks():
    for k in range(size):
        pi, ci, _ = sw[a+k]; t = ww[b+k][1]
        T['paras'][pi]['w'].append([ci, t]); n += 1
bad = 0
for p in T['paras']:                        # drop anchors that break monotonic time or leave the paragraph span
    keep, last = [], -1
    for ci, t in p['w']:
        if t >= last and p['start'] - 1.0 <= t <= p['end'] + 1.0: keep.append([ci, t]); last = t
        else: bad += 1
    p['w'] = keep
json.dump(T, open('timing.json', 'w'), ensure_ascii=False, indent=1)
print(f'{n} matched of {len(sw)} script words ({len(ww)} transcript words), {bad} dropped')
for p in T['paras']:
    if not p['w'] or p['w'][0][1] - p['start'] > 1.0: print('para', p['i'], 'start', p['start'], 'first anchor', p['w'][:1])
