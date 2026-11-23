"""Add 'voiced' segments (speech without pauses) to each sentence of a timing file, for lip-sync.
usage: python3 -I tools/voiced.py public/vo/voiceover_<lang>.wav src/data/sentence_times_<lang>.json"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gaps import gaps
wav, path = sys.argv[1], sys.argv[2]
d = json.load(open(path)); g, _ = gaps(wav, thr=-40, mind=0.08)
for s in d['sentences']:
    a, b = s['start'], s['end']; segs = []; cur = a
    for x, y in g:
        if y <= a or x >= b: continue
        if x > cur + 0.05: segs.append([round(cur, 2), round(x, 2)])
        cur = max(cur, y)
    if b > cur + 0.05: segs.append([round(cur, 2), round(b, 2)])
    s['voiced'] = segs
json.dump(d, open(path, 'w'), ensure_ascii=False, indent=1)
print('voiced segments per sentence:', [len(s['voiced']) for s in d['sentences']])
