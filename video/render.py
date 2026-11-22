"""Render the Thirty Years' War documentary from the image map + narration.

Usage:
  python3 video/render.py stills 10,130,400        # preview frames (PNG) at given seconds
  python3 video/render.py full                       # render the whole video (parallel), mux audio

Inputs (relative to repo root):
  PETA_GAMBAR_NARASI.md   timing table: | mm:ss.ss–mm:ss.ss | narasi | `NN` | arahan |
  gambar_tritone/NN_*.jpg graded images
  audio/Narasi_30_tahun_full.wav
"""
import os, re, sys, math, subprocess
from multiprocessing import Pool
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, FPS = 1920, 1080, 24
XFADE = 0.7                      # crossfade length between shots (s)
AUDIO = os.path.join(ROOT, 'audio/Narasi_30_tahun_full.wav')
IMGDIR = os.path.join(ROOT, 'gambar_tritone')
OUT = os.path.join(ROOT, 'video')
PARCH = (198, 226, 238)          # BGR parchment
DARK = (20, 30, 46)              # BGR dark brown

SECTIONS = ['PROLOG: EROPA DALAM API', 'BENIH KEBENCIAN DI EROPA', 'DEFENESTRASI PRAHA: AWAL PEPERANGAN',
            'RAJA MUSIM DINGIN DAN KEJATUHAN BOHEMIA', 'MAGDEBURG: KOTA YANG BERUBAH MENJADI NERAKA',
            'GUSTAVUS ADOLPHUS: RAJA YANG MENGUBAH ARAH PERANG', 'PRANCIS MELAWAN SESAMA KEKUATAN KATOLIK',
            'TIGA PULUH TAHUN KEHANCURAN', 'PERDAMAIAN WESTPHALIA: AKHIR DARI PERANG PANJANG',
            'EPILOG: HARGA SEBUAH KEKUASAAN']

# Where a zoom-in should drift to (fraction of image width, height). Default: centre.
FOCUS = {'03': (.42, .22), '12': (.46, .32), '20': (.66, .30), '25': (.45, .30), '22': (.48, .42),
         '17': (.45, .40), '09': (.50, .55), '07': (.52, .35), '35': (.50, .55), '39': (.50, .40),
         '19': (.62, .45), '14': (.50, .40), '33': (.50, .45), '01': (.62, .50), '36': (.50, .45)}
# Optional source crop (x0, y0, x1, y1 as fractions) applied before framing.
CROP = {'13': (.17, 0, .85, 1),            # drop the printed French text on both sides
        '06': (0, .12, 1, .86),            # keep the town, not the title / legend scroll
        '16': (0, .10, 1, 1)}              # keep the bpk watermark out of frame


def tsec(s):
    m, x = s.split(':'); return int(m) * 60 + float(x)


def load_rows():
    rows, sec = [], 0
    for line in open(os.path.join(ROOT, 'PETA_GAMBAR_NARASI.md'), encoding='utf-8'):
        m = re.match(r'## Bagian (\d+)', line)
        if m: sec = int(m.group(1))
        m = re.match(r'\| (\d\d:\d\d\.\d\d)–(\d\d:\d\d\.\d\d) \| .* \| `(\d\d)` \| (.*) \|$', line.strip())
        if m: rows.append(dict(a=tsec(m.group(1)), b=tsec(m.group(2)), img=m.group(3), cue=m.group(4), sec=sec))
    return rows


def build_shots(rows):
    """Merge consecutive rows that use the same image into one continuous shot."""
    shots = []
    for r in rows:
        cut = re.search(r'potong ke `(\d\d)`', r['cue'])
        parts = [(r['a'], r['a'] + .72 * (r['b'] - r['a']), r['img']), (r['a'] + .72 * (r['b'] - r['a']), r['b'], cut.group(1))] if cut \
            else [(r['a'], r['b'], r['img'])]
        for a, b, img in parts:
            if shots and shots[-1]['img'] == img:
                shots[-1]['b'] = b; shots[-1]['cues'].append(r['cue'])
            else:
                shots.append(dict(a=a, b=b, img=img, cues=[r['cue']], sec=r['sec']))
    for i, s in enumerate(shots):
        cue = s['cues'][0].lower()
        s['mode'] = 'pan' if cue.startswith('pan') else 'out' if ('zoom out' in cue or 'fade' in cue and 'in' not in cue) else 'in'
        s['dir'] = -1 if (i % 2) else 1
    return shots


_cache = {}
def image(code):
    if code not in _cache:
        f = next(x for x in os.listdir(IMGDIR) if x.startswith(code + '_'))
        im = cv2.imread(os.path.join(IMGDIR, f))
        if code in CROP:
            h, w = im.shape[:2]; x0, y0, x1, y1 = CROP[code]
            im = im[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)]
        h, w = im.shape[:2]
        k = min(1.0, 2600 / max(w, h))
        if k < 1: im = cv2.resize(im, (int(w * k), int(h * k)), interpolation=cv2.INTER_AREA)
        h, w = im.shape[:2]
        cover = max(W / w, H / h)
        bg = cv2.resize(im, (int(w * cover) + 2, int(h * cover) + 2))
        y0, x0 = (bg.shape[0] - H) // 2, (bg.shape[1] - W) // 2
        bg = cv2.GaussianBlur(bg[y0:y0 + H, x0:x0 + W], (0, 0), 28)
        bg = (bg.astype(np.float32) * 0.55).astype(np.uint8)
        _cache[code] = (im, bg, w / h)
    return _cache[code]


def ease(x):
    x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)


def render_shot(shot, t):
    im, bg, aspect = image(shot['img'])
    h, w = im.shape[:2]
    p = ease((t - shot['a'] + XFADE / 2) / (shot['b'] - shot['a'] + XFADE))
    fx, fy = FOCUS.get(shot['img'], (.5, .5))
    cover = 1.38 < aspect < 2.3
    s0 = max(W / w, H / h) if cover else min(W * .94 / w, H * .92 / h)
    dur = shot['b'] - shot['a']
    amp = min(0.18, 0.06 + 0.006 * dur)           # longer shots move a bit further
    if shot['mode'] == 'pan':
        z = 1 + amp; d = shot['dir']
        cx = w / 2 + d * (p - .5) * (w - W / (s0 * z)) * (1 if cover else .25); cy = h / 2 + (fy - .5) * h * .3
    else:
        z = 1 + amp * (p if shot['mode'] == 'in' else 1 - p)
        k = (z - 1) / amp if amp else 0
        cx = w / 2 + (fx - .5) * w * k; cy = h / 2 + (fy - .5) * h * k
    s = s0 * z
    if cover:  # never show past the image edge
        hw, hh = W / 2 / s, H / 2 / s
        cx = min(max(cx, hw), w - hw); cy = min(max(cy, hh), h - hh)
    M = np.float32([[s, 0, W / 2 - s * cx], [0, s, H / 2 - s * cy]])
    if cover:
        return cv2.warpAffine(im, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    out = bg.copy()
    cv2.warpAffine(im, M, (W, H), dst=out, flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_TRANSPARENT)
    return out


def make_vignette():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    v = 1 - 0.38 * np.clip(r - 0.45, 0, 1) ** 1.6
    return (v * 256).astype(np.uint16)[..., None]


def make_titles(rows):
    font_s = ImageFont.truetype('/usr/share/fonts/truetype/crosextra/Caladea-Regular.ttf', 30)
    font_b = ImageFont.truetype('/usr/share/fonts/truetype/crosextra/Caladea-Bold.ttf', 52)
    starts = {}
    for r in rows: starts.setdefault(r['sec'], r['a'])
    titles = []
    for sec, t0 in sorted(starts.items()):
        img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
        label, name = f'BAGIAN {sec}', SECTIONS[sec - 1]
        tw = max(d.textlength(label, font=font_s), d.textlength(name, font=font_b))
        x, y = 110, H - 230
        d.rectangle([x - 40, y - 30, x + tw + 40, y + 120], fill=(46, 30, 20, 205))
        d.line([x, y + 44, x + tw, y + 44], fill=(198, 160, 110, 255), width=2)
        d.text((x, y), label, font=font_s, fill=(214, 190, 150, 255))
        d.text((x, y + 54), name, font=font_b, fill=(238, 226, 198, 255))
        a = np.asarray(img)
        titles.append((t0 + 0.6, 4.2, a[..., 2::-1].astype(np.uint16), a[..., 3:].astype(np.uint16)))
    return titles


def frame_at(t, shots, vig, titles):
    i = max(j for j, s in enumerate(shots) if s['a'] <= t + 1e-6) if t >= shots[0]['a'] else 0
    f = render_shot(shots[i], t)
    if i + 1 < len(shots) and t > shots[i]['b'] - XFADE / 2:
        a = (t - (shots[i]['b'] - XFADE / 2)) / XFADE
        f = cv2.addWeighted(f, 1 - ease(a), render_shot(shots[i + 1], t), ease(a), 0)
    if i > 0 and t < shots[i]['a'] + XFADE / 2:
        a = (t - (shots[i]['a'] - XFADE / 2)) / XFADE
        f = cv2.addWeighted(render_shot(shots[i - 1], t), 1 - ease(a), f, ease(a), 0)
    f = ((f.astype(np.uint16) * vig) >> 8).astype(np.uint8)
    for t0, dur, rgb, al in titles:
        if t0 <= t <= t0 + dur:
            k = min(1, (t - t0) / .5, (t0 + dur - t) / .5)
            al2 = (al * k).astype(np.uint16)
            f = ((f.astype(np.uint16) * (255 - al2) + rgb * al2) // 255).astype(np.uint8)
    total = shots[-1]['b']   # fade in from / out to black
    k = min(1.0, t / 1.0, max(0.0, (total - t) / 2.0))
    if k < 1: f = (f * k).astype(np.uint8)
    return f


def setup():
    rows = load_rows(); shots = build_shots(rows)
    return rows, shots, make_vignette(), make_titles(rows)


def render_chunk(args):
    n0, n1, path = args
    rows, shots, vig, titles = setup()
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}',
                           '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
                           '-pix_fmt', 'yuv420p', path], stdin=subprocess.PIPE)
    for n in range(n0, n1):
        ff.stdin.write(frame_at(n / FPS, shots, vig, titles).tobytes())
    ff.stdin.close(); ff.wait()
    return path


def main():
    mode = sys.argv[1]
    if mode == 'stills':
        rows, shots, vig, titles = setup()
        os.makedirs(os.path.join(OUT, 'stills'), exist_ok=True)
        for t in map(float, sys.argv[2].split(',')):
            cv2.imwrite(os.path.join(OUT, 'stills', f'{t:07.2f}.jpg'), frame_at(t, shots, vig, titles))
        print(len(shots), 'shots')
    elif mode == 'full':
        rows, shots, _, _ = setup()
        total = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', AUDIO],
                                     capture_output=True, text=True).stdout)
        shots[-1]['b'] = max(shots[-1]['b'], total)
        nf = int(math.ceil(total * FPS)); k = os.cpu_count() or 4
        tmp = os.path.join(OUT, 'parts'); os.makedirs(tmp, exist_ok=True)
        bounds = [round(nf * i / k) for i in range(k + 1)]
        jobs = [(bounds[i], bounds[i + 1], os.path.join(tmp, f'part{i}.mp4')) for i in range(k)]
        with Pool(k) as pool: parts = pool.map(render_chunk, jobs)
        lst = os.path.join(tmp, 'list.txt')
        open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
        out = os.path.join(OUT, 'Perang_Tiga_Puluh_Tahun.mp4')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-i', AUDIO,
                        '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                        '-movflags', '+faststart', '-shortest', out], check=True)
        print(out)


if __name__ == '__main__':
    main()
