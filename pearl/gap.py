"""Insert a GAP-second pause before each chapter (babak) and write narration_gap.wav + timing_gap.json."""
import json, subprocess
GAP, LEAD, HOLD = 2.0, .6, 2.2
CH = [  # first paragraph (1-based), title
    (1, 'PENDAHULUAN'), (8, 'MATAHARI YANG TERBIT'), (18, 'DARAH HITAM BERNAMA MINYAK'), (30, 'PERJUDIAN SANG LAKSAMANA'),
    (40, 'ARMADA HANTU'), (54, 'TANDA-TANDA YANG TERABAIKAN'), (68, 'TORA! TORA! TORA!'), (85, 'SETELAH ASAP REDA'),
    (97, 'HARI YANG AKAN DIKENANG')]
T = json.load(open('timing.json', encoding='utf-8')); paras, dur = T['paras'], T['duration']
cuts = [0.0] + [paras[p-1]['start'] - .15 for p, _ in CH[1:]] + [dur]
shift = lambda t: t + GAP * sum(1 for c in cuts[1:-1] if t >= c)
bab = []
for i, (p, title) in enumerate(CH):
    st = shift(paras[p-1]['start'])
    bab.append(dict(n=i, title=title, card=(st - LEAD) if i else None, start=st, hold=(st + HOLD) if i else None,
                    end=shift(cuts[i+1] - 1e-6) if i + 1 < len(CH) else shift(dur)))
out = []
for q in paras:
    b = max(i for i, (p, _) in enumerate(CH) if q['i'] >= p)
    out.append(dict(i=q['i'], bab=b, start=round(shift(q['start']), 3), end=round(shift(q['end']), 3), text=q['text']))
total = dur + GAP * (len(CH) - 1)
json.dump(dict(gap=GAP, duration=round(total, 3), bab=bab, paras=out), open('timing_gap.json', 'w'), ensure_ascii=False, indent=1)
fc, n = '', 0
for i in range(len(CH)):
    if i: fc += f'aevalsrc=0:d={GAP}:s=24000[g{i}];'
    fc += f'[0:a]atrim=start={cuts[i]:.3f}:end={cuts[i+1]:.3f},asetpts=PTS-STARTPTS[s{i}];'
fc += ''.join((f'[g{i}]' if i else '') + f'[s{i}]' for i in range(len(CH))) + f'concat=n={2*len(CH)-1}:v=0:a=1[a]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'narasi_full.wav', '-filter_complex', fc, '-map', '[a]', '-c:a', 'pcm_s16le', 'narration_gap.wav'], check=True)
for b in bab: print(b)
