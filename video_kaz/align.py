"""Paragraph timing for each Bagian: pick paragraph boundaries among detected pauses with a DP that keeps the
speech rate steady and prefers long pauses. Writes timing.json (absolute starts on the merged audio)."""
import re, subprocess, zipfile, json, glob, sys, math
U, OUT = sys.argv[1], sys.argv[2]
xml = zipfile.ZipFile(glob.glob(U + '*Narasi_30_tahun.docx')[0]).read('word/document.xml').decode()
paras = [''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', p)) for p in re.findall(r'<w:p[ >].*?</w:p>', xml, re.S)]
parts = []
for p in (p for p in paras if p.strip()):
    if p.startswith('BAGIAN'): parts.append([])
    else: parts[-1].append(p)
out, offset = [], 0.0
for i, ps in enumerate(parts, 1):
    f = glob.glob(U + f'*-Bagian_{i}.wav')[0]
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)
    err = subprocess.run(['ffmpeg', '-i', f, '-af', 'silencedetect=n=-35dB:d=0.18', '-f', 'null', '-'], capture_output=True, text=True).stderr
    ss = [float(v) for v in re.findall(r'silence_start: ([\d.]+)', err)]
    se = [float(v) for v in re.findall(r'silence_end: ([\d.]+)', err)] + [dur]
    sil = list(zip(ss, se))
    lead = sil[0][1] if sil and sil[0][0] < .05 else 0.0
    tail = sil[-1][0] if sil and sil[-1][1] >= dur - .05 else dur
    cand = [(s, e) for s, e in sil if lead < s and e < tail]          # interior pauses
    L = [len(p) for p in ps]; N = len(ps)
    speech = tail - lead - 0  # rate estimated per bagian
    r = speech / sum(L)
    # nodes: 0 = lead, 1..P = pauses, P+1 = tail ; a paragraph spans node a end -> node b start
    nodes = [(lead, lead)] + cand + [(tail, tail)]
    P = len(nodes)
    INF = 1e18
    best = [[INF] * P for _ in range(N + 1)]; prev = [[-1] * P for _ in range(N + 1)]
    best[0][0] = 0
    for k in range(1, N + 1):
        for b in range(1, P):
            if k == N and b != P - 1: continue
            if k < N and b == P - 1: continue
            gap = nodes[b][1] - nodes[b][0]
            for a in range(0, b):
                if best[k - 1][a] >= INF: continue
                d = nodes[b][0] - nodes[a][1]
                if d <= 0.3: continue
                c = math.log(d / (L[k - 1] * r)) ** 2 - (0.35 * min(gap, 1.2) if k < N else 0)
                if best[k - 1][a] + c < best[k][b]: best[k][b], prev[k][b] = best[k - 1][a] + c, a
    b = P - 1; idx = []
    for k in range(N, 0, -1): idx.append(b); b = prev[k][b]
    idx = idx[::-1]
    starts = [lead] + [nodes[j][1] for j in idx[:-1]]
    for j, (p, s) in enumerate(zip(ps, starts)):
        out.append(dict(bagian=i, para=j + 1, start=round(offset + s, 2), text=p))
    offset += dur
json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)
