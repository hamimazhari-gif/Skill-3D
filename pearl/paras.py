"""Split the narration PDF into paragraphs (blank-line separated; '...' lines are pauses). Writes paras.json."""
import subprocess, json, re, sys
txt = subprocess.run(['pdftotext', '-layout', sys.argv[1], '-'], capture_output=True, text=True).stdout
txt = re.sub(r'([.!?"…])\s*\f', r'\1\n\n', txt).replace('\f', ' ')
out = []
for block in re.split(r'\n\s*\n', txt):
    s = ' '.join(l.strip() for l in block.splitlines()).strip()
    s = re.sub(r'(\w)- (\w)', r'\1-\2', s)
    if not s: continue
    if s == '...': out.append({'pause': True}); continue
    out.append({'text': s})
json.dump(out, open('paras.json', 'w'), ensure_ascii=False, indent=1)
for i, p in enumerate(out): print(i, p.get('text', '...')[:100])
