"""Insert a GAP-second pause before every Bagian: writes narration_gap.wav and timing_gap.json (shifted times + chapter info)."""
import json, glob, re, zipfile, subprocess, sys, os
U = sys.argv[1]; GAP = float(sys.argv[2]) if len(sys.argv) > 2 else 2.0
LEAD, HOLD = .6, 2.2   # card shows LEAD s before the voice starts and stays HOLD s into it
# Bagian 2-8 and 10 open with the spoken words "Bagian N" (Bagian 1 and 9 go straight into the text).
# TRIM: end of that pause in the source file (the spoken "Bagian N" before it is cut out);
# BODY: where the narration proper starts after the spoken title (the card stays up until then).
TRIM = {2: 1.232, 3: 1.418, 4: 1.821, 5: 1.515, 6: 1.438, 7: 1.743, 8: 1.587, 10: 1.537}
BODY = {2: 3.67, 3: 5.07, 4: 5.26, 5: 5.34, 6: 5.39, 7: 5.44, 8: 4.22, 10: 5.20}
TRIM = {k: v - .1 for k, v in TRIM.items()}
HERE = os.path.dirname(os.path.abspath(__file__))
xml = zipfile.ZipFile(glob.glob(U + '*Narasi_30_tahun.docx')[0]).read('word/document.xml').decode()
heads = [''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', p)) for p in re.findall(r'<w:p[ >].*?</w:p>', xml, re.S)]
titles = [re.sub(r'^BAGIAN\s+\d+\s*[—-]\s*', '', h).strip() for h in heads if h.startswith('BAGIAN')]
paras = json.load(open(os.path.join(HERE, 'timing.json'), encoding='utf-8'))
files = [glob.glob(U + f'*-Bagian_{i}.wav')[0] for i in range(1, 11)]
durs = [float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout) for f in files]
orig0 = [sum(durs[:i]) for i in range(10)]
tr = [TRIM.get(i+1, 0.0) for i in range(10)]
dur2 = [durs[i] - tr[i] for i in range(10)]
new0 = [sum(dur2[:i]) + (i+1)*GAP for i in range(10)]          # where each Bagian's (trimmed) audio starts
bag = []
for i in range(10):
    st = new0[i]; n = i + 1
    hold = st + (BODY[n] - tr[i] + .2 if n in BODY else HOLD)
    bag.append(dict(n=n, title=titles[i], card=(st - LEAD) if i else 0.0, start=st, hold=hold, end=st + dur2[i]))
for b in range(10):
    ps = [p for p in paras if p['bagian'] == b + 1]
    rel = [p['start'] - orig0[b] for p in ps]
    if b + 1 in BODY:
        B = BODY[b+1]; j = next(k for k in range(1, len(ps)) if rel[k] > B + 1.0)
        r0, rj = rel[0], rel[j]
        for k in range(j): rel[k] = B + (rel[k] - r0) * (rj - B) / (rj - r0)
    for p, r in zip(ps, rel): p['start'] = round(new0[b] + max(0.0, r - tr[b]), 3)
json.dump(dict(gap=GAP, duration=round(bag[-1]['end'], 3), bagian=bag, paras=paras), open(os.path.join(HERE, 'timing_gap.json'), 'w'), ensure_ascii=False, indent=1)
inp, fc, pre = [], '', ''
for i, f in enumerate(files):
    inp += ['-f', 'lavfi', '-t', str(GAP), '-i', 'anullsrc=r=24000:cl=mono', '-i', f]
    pre += f'[{2*i+1}:a]atrim=start={tr[i]:.3f},asetpts=PTS-STARTPTS[t{i}];'
    fc += f'[{2*i}:a][t{i}]'
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + inp + ['-filter_complex', pre + fc + 'concat=n=20:v=0:a=1[a]', '-map', '[a]', '-c:a', 'pcm_s16le',
                os.path.join(HERE, 'narration_gap.wav')], check=True)
print(json.dumps(bag, ensure_ascii=False, indent=0)[:900])
