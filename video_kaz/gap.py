"""Insert a GAP-second pause before every Bagian: writes narration_gap.wav and timing_gap.json (shifted times + chapter info)."""
import json, glob, re, zipfile, subprocess, sys, os
U = sys.argv[1]; GAP = float(sys.argv[2]) if len(sys.argv) > 2 else 2.0
LEAD, HOLD = .8, 2.2   # card shows LEAD s before the voice starts and stays HOLD s into it
HERE = os.path.dirname(os.path.abspath(__file__))
xml = zipfile.ZipFile(glob.glob(U + '*Narasi_30_tahun.docx')[0]).read('word/document.xml').decode()
heads = [''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', p)) for p in re.findall(r'<w:p[ >].*?</w:p>', xml, re.S)]
titles = [re.sub(r'^BAGIAN\s+\d+\s*[—-]\s*', '', h).strip() for h in heads if h.startswith('BAGIAN')]
paras = json.load(open(os.path.join(HERE, 'timing.json'), encoding='utf-8'))
files = [glob.glob(U + f'*-Bagian_{i}.wav')[0] for i in range(1, 11)]
durs = [float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout) for f in files]
orig0 = [sum(durs[:i]) for i in range(10)]
bag = [dict(n=i+1, title=titles[i], card=(orig0[i] + (i+1)*GAP - LEAD) if i else 0.0, start=orig0[i] + (i+1)*GAP, hold=orig0[i] + (i+1)*GAP + HOLD, end=orig0[i] + (i+1)*GAP + durs[i]) for i in range(10)]
for p in paras: p['start'] = round(p['start'] + p['bagian']*GAP, 3)
json.dump(dict(gap=GAP, duration=round(bag[-1]['end'], 3), bagian=bag, paras=paras), open(os.path.join(HERE, 'timing_gap.json'), 'w'), ensure_ascii=False, indent=1)
inp, fc = [], ''
for i, f in enumerate(files):
    inp += ['-f', 'lavfi', '-t', str(GAP), '-i', 'anullsrc=r=24000:cl=mono', '-i', f]
    fc += f'[{2*i}:a][{2*i+1}:a]'
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + inp + ['-filter_complex', fc + 'concat=n=20:v=0:a=1[a]', '-map', '[a]', '-c:a', 'pcm_s16le',
                os.path.join(HERE, 'narration_gap.wav')], check=True)
print(json.dumps(bag, ensure_ascii=False, indent=0)[:900])
