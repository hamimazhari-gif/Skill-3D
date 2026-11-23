"""Pearl Harbor — Kaz evidence-board documentary.
Same rendering grammar as video_kaz/kaz30.py (board, camera keys, cards, tags, stamps, screen cards), data-driven from
timing_gap.json. Photos keep their original colours. Photos are linked by straight red lines (no strings, no pins) that
draw themselves while the camera travels from one photo to the next and stay on the board.

  python3 pearl/kazph.py stills 10,130,400      -> pearl/stills/*.jpg
  python3 pearl/kazph.py overview                -> pearl/overview.jpg
  python3 pearl/kazph.py full START END out.mp4  -> frame range (30 fps)
"""
import os, sys, json, math, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
IMGDIR = os.path.join(HERE, 'foto')
W, H, FPS = 1920, 1080, 30
MONO = '/usr/share/fonts/truetype/freefont/FreeMonoBold.ttf'
SERIF = '/usr/share/fonts/truetype/crosextra/Caladea-Bold.ttf'
RED = (208, 49, 45)                       # RGB
REDB = (45, 49, 208)                      # BGR
WW, WH = 12000, 8600                      # world size
BGS = 0.5                                 # background raster: pixels per world unit
R = 2.0                                   # card raster: pixels per world unit

def font(p, s): return ImageFont.truetype(p, int(s))
def clamp(x, a=0, b=1): return max(a, min(b, x))
def ss(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease(x): x = clamp(x); return 4*x*x*x if x < .5 else 1 - (-2*x+2)**3/2
def backout(x, s=1.7): x = clamp(x) - 1; return 1 + (s+1)*x**3 + s*x**2
rng = np.random.default_rng(1)

# ---------------------------------------------------------------- timing
_TG = json.load(open(os.path.join(HERE, 'timing_gap.json'), encoding='utf-8'))
TM, BAB, DUR = _TG['paras'], _TG['bab'], _TG['duration'] + 5.0   # 5 s tail so the end title can breathe
CHAP = [b for b in BAB if b['n'] >= 1]                    # chapters with a title card
PSTART = {str(d['i']): d['start'] for d in TM}
PTEXT = {str(d['i']): d['text'] for d in TM}
PBAB = {str(d['i']): d['bab'] for d in TM}
KEYS = list(PSTART)
PEND = {}
for i, k in enumerate(KEYS):
    nxt = KEYS[i+1] if i+1 < len(KEYS) else None
    PEND[k] = PSTART[nxt] if nxt and PBAB[nxt] == PBAB[k] else BAB[PBAB[k]]['end']
def P(k): return PSTART[str(k)]
PW = {str(d['i']): d.get('w', []) for d in TM}
def WD(k, word, n=1):
    """Time a word is spoken: Whisper word anchors (interpolated by character position), else char position over the span."""
    k = str(k); txt = PTEXT[k]; i = -1
    for _ in range(n): i = txt.index(word, i + 1)
    pts = [[0, PSTART[k]]] * (not PW[k] or PW[k][0][0] > 0) + PW[k] + [[len(txt), PEND[k] - .35]]
    for (c0, t0), (c1, t1) in zip(pts, pts[1:]):
        if c0 <= i <= c1: return t0 + (t1 - t0) * ((i - c0) / (c1 - c0) if c1 > c0 else 0)
    return PSTART[k] + ((PEND[k] - PSTART[k]) - 0.35) * i / len(txt)

# ---------------------------------------------------------------- board map (generated Pacific map)
LON0, LON1, LAT0, LAT1, KD, MX, MY = 95.0, 290.0, 58.0, -12.0, 50.0, 1100, 2600
def MAP(lon, lat):
    if lon < 0: lon += 360
    return (MX + KD*(lon - LON0), MY + KD*(LAT0 - lat))
PL = dict(TOKYO=MAP(139.7, 35.7), JAPAN=MAP(137.0, 36.5), KAGOSHIMA=MAP(130.55, 31.6), HITOKAPPU=MAP(147.6, 44.9),
          PEARL=MAP(-157.95, 21.37), MIDWAY=MAP(-177.4, 28.2), SANDIEGO=MAP(-117.2, 32.7), CALIFORNIA=MAP(-120.0, 37.0),
          WASHINGTON=MAP(-77.0, 38.9), SAIGON=MAP(106.7, 10.8), PHILIPPINES=MAP(121.5, 14.5), MALAYA=MAP(102.0, 4.0),
          SINGAPORE=MAP(103.8, 1.3), HINDIA=MAP(113.0, -2.5), MANCHURIA=MAP(125.0, 45.0), CHINA=MAP(112.0, 32.0),
          NORTHPAC=MAP(175.0, 40.0), OAHUN=MAP(-158.0, 27.5))
ROUTE = [MAP(147.6, 44.9), MAP(160.0, 43.5), MAP(175.0, 42.0), MAP(-170.0, 38.0), MAP(-160.0, 31.0), MAP(-158.0, 27.0)]

def build_bg():
    w, h = int(WW*BGS), int(WH*BGS)
    bg = np.zeros((h, w, 3), np.float32) + np.array([42, 40, 22], np.float32)
    n = cv2.resize(rng.random((h//20, w//20)).astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC)
    bg += (n[..., None] - .5) * 14
    from global_land_mask import globe
    step = .05
    lats = np.arange(LAT0, LAT1, -step); lons = np.arange(LON0, LON1, step)
    lo = np.where(lons > 180, lons - 360, lons)
    LA, LO = np.meshgrid(lats, lo, indexing='ij')
    m = globe.is_land(LA, LO).astype(np.float32)
    mw, mh = int((LON1-LON0)*KD*BGS), int((LAT0-LAT1)*KD*BGS)
    m = cv2.resize(m, (mw, mh), interpolation=cv2.INTER_LINEAR)
    m = cv2.GaussianBlur(m, (0, 0), 1.6)
    land = np.clip((m - .35) / .3, 0, 1)
    coast = np.clip(1 - np.abs(m - .5) / .18, 0, 1)                # thin coastline
    sea, ground, edge = np.array([52, 50, 26]), np.array([118, 128, 104]), np.array([170, 180, 160])
    tint = sea + (ground - sea) * land[..., None]
    tint = tint * (1 - .7*coast[..., None]) + edge * .7*coast[..., None]
    ny = cv2.resize(rng.random((mh//6, mw//6)).astype(np.float32), (mw, mh), interpolation=cv2.INTER_CUBIC)
    tint += (ny[..., None] - .5) * 18 * land[..., None]
    x0, y0 = int(MX*BGS), int(MY*BGS)
    fy = np.minimum(np.arange(mh), np.arange(mh)[::-1]) / 160
    fx = np.minimum(np.arange(mw), np.arange(mw)[::-1]) / 160
    f = np.clip(np.minimum(fy[:, None], fx[None, :]), 0, 1)[..., None] * .85
    reg = bg[y0:y0+mh, x0:x0+mw]
    bg[y0:y0+mh, x0:x0+mw] = reg * (1 - f) + tint * f
    for lon in range(100, 290, 10):                                  # graticule
        x = int(MAP(lon if lon <= 180 else lon - 360, 0)[0]*BGS); bg[y0:y0+mh, x:x+1] += 7
    for lat in range(-10, 60, 10):
        y = int(MAP(100, lat)[1]*BGS); bg[y:y+1, x0:x0+mw] += 7
    g = int(250*BGS)
    for k in range(0, w, g): bg[:, k:k+1] += 5
    for k in range(0, h, g): bg[k:k+1, :] += 5
    bg = np.clip(bg, 0, 255).astype(np.uint8)
    pil = Image.fromarray(bg); d = ImageDraw.Draw(pil)                # printed sea names
    for (lon, lat), s, fs in [((-172, 15), 'S A M U D R A   P A S I F I K', 44), ((152, 25), 'PASIFIK BARAT', 26),
                              ((-140, 47), 'PASIFIK UTARA', 26), ((108, -8.5), 'HINDIA BELANDA', 20)]:
        x, y = MAP(lon, lat); d.text((x*BGS, y*BGS), s, font=font(SERIF, fs), fill=(128, 132, 98))
    return np.array(pil)

# ---------------------------------------------------------------- cards
def find_img(code):
    return os.path.join(IMGDIR, next(f for f in os.listdir(IMGDIR) if f.startswith(code + '_')))

def make_card(code, wworld, border=14):
    im = Image.open(find_img(code)).convert('RGB')
    pw = int(wworld * R); ph = int(im.height * pw / im.width)
    im = im.resize((pw, ph), Image.LANCZOS)
    b = int(border * R); pad = int(50 * R)
    cw, ch = pw + 2*b, ph + 2*b
    c = Image.new('RGBA', (cw + 2*pad, ch + 2*pad), (0, 0, 0, 0))
    sh = Image.new('L', c.size, 0); ImageDraw.Draw(sh).rectangle([pad, pad + 16*R, pad+cw, pad+ch+16*R], fill=130)
    c.paste((0, 0, 0, 255), (0, 0), sh.filter(ImageFilter.GaussianBlur(14*R)))
    paper = Image.new('RGBA', (cw, ch), (234, 227, 210, 255)); paper.paste(im, (b, b))
    c.alpha_composite(paper, (pad, pad))
    return cv2.cvtColor(np.array(c), cv2.COLOR_RGBA2BGRA), (cw / R, ch / R)

def make_stamp(text):
    f = font(SERIF, 110*R); tw = f.getbbox(text)[2] + 60*R; th = 160*R
    c = Image.new('RGBA', (int(tw), int(th)), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
    d.rectangle([6*R, 6*R, tw-6*R, th-6*R], outline=RED+(235,), width=int(9*R))
    d.text((30*R, 10*R), text, font=f, fill=RED+(235,))
    a = np.array(c); a[..., 3] = a[..., 3] * (rng.random(a.shape[:2]) > .22)
    return cv2.cvtColor(a, cv2.COLOR_RGBA2BGRA)

# code: (centre x, centre y, rotation deg, width in world units)
LAYOUT = {
    '02': (3200, 1750, 2, 1350),  # Perry scroll, above Japan
    '05': (4950, 2050, -3, 850),  # carrier fleet, north Pacific
    '08': (6250, 2550, 3, 850),   # Shokaku take-off
    '22': (7650, 1450, -2, 950),  # Arizona Memorial
    '07': (8150, 2900, -2, 820),  # radar Opana
    '20': (10350, 2150, -2, 950), # Roosevelt, above Washington
    '04': (4450, 4550, 3, 560),   # Yamamoto
    '01': (6500, 5400, -2, 1050), # Pearl Harbor from the air
    '21': (5350, 5650, 3, 800),   # Hiryu at Midway
    '09': (9300, 4700, -3, 850),  # airfield burning
    '14': (10550, 5350, 2, 850),  # flak sky
    '03': (1550, 6900, -3, 950),  # Saigon
    '18': (4300, 6400, 2, 600),   # Doris Miller
    '06': (8150, 6000, 2, 800),   # USS Ward
    '12': (9850, 6600, 3, 520),   # capsized hull
    '10': (7250, 6950, 2, 950),   # torpedo, Ford Island
    '13': (5850, 7350, -3, 950),  # Arizona burning
    '11': (8700, 7450, -2, 900),  # Battleship Row from above
    '16': (10350, 7750, -3, 850), # Nevada
    '15': (4400, 7900, 3, 850),   # Shaw explosion
    '17': (2850, 7750, -2, 950),  # Oklahoma capsized
    '19': (7300, 8150, 2, 850),   # Battleship Row 10 Dec
}
CARDS = {}
def build_cards():
    for code, (cx, cy, rot, w) in LAYOUT.items():
        img, (cw, ch) = make_card(code, w)
        small = cv2.resize(img, (img.shape[1]//4, img.shape[0]//4), interpolation=cv2.INTER_AREA)
        CARDS[code] = dict(img=img, small=small, c=(cx, cy), rot=rot, size=(cw, ch), t0=1e9)

def card_size(code):
    if code in CARDS: return CARDS[code]['size']
    w = LAYOUT[code][3]; im = Image.open(find_img(code)); return (w + 28, w * im.height / im.width + 28)

def card_pt(code, fx, fy):
    """World coordinate of a point inside a card's picture (fractions of the card)."""
    cx, cy, rot, _ = LAYOUT[code]; cw, ch = card_size(code)
    dx, dy = (fx - .5) * cw, (fy - .5) * ch; a = math.radians(rot)
    return (cx + dx*math.cos(a) - dy*math.sin(a), cy + dx*math.sin(a) + dy*math.cos(a))

def A(spec):
    """Anchor: ('c', code, fx, fy) | ('p', place) | ('g', lon, lat) | (x, y)."""
    if spec[0] == 'c': return card_pt(*spec[1:])
    if spec[0] == 'p': return PL[spec[1]]
    if spec[0] == 'g': return MAP(spec[1], spec[2])
    return spec

# ---------------------------------------------------------------- beats (camera)
# per paragraph: spec, or a list [spec, (spec, word[, n]), ...] that cuts on the word.
# spec: card code [@fx,fy] [*zoom]  |  'M:PLACE*zoom' (absolute zoom)  |  'WIDE*zoom'
BEAT = {
 '1': '01*0.8', '2': ['01', ('01@.45,.55*1.5', 'setenang')], '3': ['M:HITOKAPPU*0.3', ('05', 'kapal induk')], '4': '08',
 '5': ['13', ('11', 'Armada')], '6': '14', '7': 'WIDE*0.17',
 '8': 'WIDE*0.15', '9': ['M:TOKYO*0.5', ('02', 'Komodor')], '10': 'M:JAPAN*0.38', '11': ['M:CHINA*0.26', ('M:MANCHURIA*0.3', 'Rusia')],
 '12': 'M:JAPAN*0.34', '13': 'M:JAPAN*0.22', '14': ['M:MANCHURIA*0.34', ('M:CHINA*0.3', 'Tiongkok meletus')], '15': 'M:JAPAN*0.28',
 '16': ['M:CALIFORNIA*0.3', ('M:PEARL*0.36', 'pelabuhan')], '17': '01',
 '18': 'M:JAPAN*0.3', '19': ['M:JAPAN*0.26', ('M:CALIFORNIA*0.24', 'delapan')], '20': 'M:CALIFORNIA*0.32',
 '21': 'M:WASHINGTON*0.34', '22': ['M:SAIGON*0.36', ('03', 'Vietnam'), ('M:SAIGON*0.22', 'Malaya')],
 '23': ['M:WASHINGTON*0.3', ('M:JAPAN*0.28', 'ekspor')], '24': 'M:TOKYO*0.48', '25': 'M:JAPAN*0.34', '26': 'M:CHINA*0.24',
 '27': 'M:HINDIA*0.34', '28': 'M:TOKYO*0.42', '29': ['M:HINDIA*0.2', ('M:PEARL*0.34', 'Armada')],
 '30': '04', '31': ['04@.5,.22*1.5', ('M:WASHINGTON*0.3', 'Harvard')], '32': '04*0.9', '33': '01*0.95',
 '34': 'WIDE*0.15', '35': '10', '36': '10@.55,.45*1.5', '37': 'M:KAGOSHIMA*0.5', '38': '01@.5,.4*1.3', '39': '04',
 '40': 'M:JAPAN*0.36', '41': 'M:HITOKAPPU*0.5', '42': ['05', ('05@.5,.5*1.25', 'Lebih')], '43': '05*0.9',
 '44': 'M:HITOKAPPU*0.34', '45': 'M:NORTHPAC*0.24', '46': '05', '47': 'M:WASHINGTON*0.36', '48': 'M:TOKYO*0.42',
 '49': 'M:NORTHPAC*0.24', '50': '05@.5,.5*1.2', '51': '05', '52': 'M:PEARL*0.36', '53': 'M:NORTHPAC*0.2',
 '54': 'M:WASHINGTON*0.32', '55': ['M:WASHINGTON*0.3', ('M:PEARL*0.3', 'Pasifik')], '56': 'WIDE*0.16',
 '57': ['M:PHILIPPINES*0.24', ('09', 'Oahu')], '58': '09@.5,.5*1.3', '59': 'M:WASHINGTON*0.4', '60': 'M:PEARL*0.4',
 '61': '06', '62': '06*0.9', '63': '07', '64': ['07@.5,.45*1.3', ('M:OAHUN*0.26', 'California')], '65': '07',
 '66': 'M:WASHINGTON*0.4', '67': 'M:WASHINGTON*0.32',
 '68': 'M:NORTHPAC*0.3', '69': ['M:OAHUN*0.3', ('08', 'gelombang')], '70': '08*0.9', '71': ['10', ('10@.55,.45*1.4', 'Kapal-kapal')],
 '72': '10*0.9', '73': '10@.5,.5*1.2', '74': '10', '75': '09', '76': '09@.5,.5*1.25', '77': '10@.6,.45*1.45',
 '78': ['11', ('12', 'miring')], '79': '13', '80': '13@.45,.4*1.4', '81': '14', '82': ['15', ('16', 'Nevada')],
 '83': 'M:PEARL*0.4', '84': '13*0.85',
 '85': '11', '86': '11@.5,.5*1.3', '87': '17', '88': '18', '89': '19', '90': '08', '91': '05', '92': 'M:PEARL*0.3',
 '93': ['M:PEARL*0.24', ('M:MIDWAY*0.3', 'Lexington'), ('M:SANDIEGO*0.3', 'Saratoga')], '94': '05', '95': '01@.3,.45*1.5',
 '96': 'WIDE*0.16',
 '97': '20', '98': '20@.5,.4*1.3', '99': '20*0.9', '100': 'WIDE*0.16',
 '101': ['M:PHILIPPINES*0.28', ('M:SINGAPORE*0.32', 'Singapura'), ('M:HINDIA*0.3', 'Hindia')], '102': '04',
 '103': ['M:MIDWAY*0.36', ('21', 'Akagi')], '104': 'WIDE*0.15', '105': '22', '106': '22@.42,.6*1.45', '107': '22*0.9',
 '108': ['WIDE*0.14', ('WIDE*0.12', 'satu pagi')],
}
WIDE_C = (6000, 4400)

def parse_beat(s):
    zoom_mul, focus = 1.0, None
    if '*' in s: s, z = s.split('*'); zoom_mul = float(z)
    if s.startswith('M:'): return ('map', PL[s[2:]], zoom_mul)
    if s == 'WIDE': return ('map', WIDE_C, zoom_mul)
    if '@' in s: s, f = s.split('@'); focus = tuple(map(float, f.split(',')))
    return ('card', s, zoom_mul, focus)

def target(spec):
    """(cx, cy, zoom, rot) for a beat."""
    if spec[0] == 'map': return (spec[1][0], spec[1][1], spec[2], 0.0)
    _, code, zm, focus = spec
    cw, ch = card_size(code)
    z = min(.80 * W / cw, .84 * H / ch) * zm
    c = card_pt(code, *(focus or (.5, .5)))
    return (c[0], c[1], z, LAYOUT[code][2] * .6)

def build_beats():
    beats = []
    for k in KEYS:
        v = BEAT[k]
        if isinstance(v, str): beats.append((PSTART[k], PEND[k], parse_beat(v), k)); continue
        cuts = [PSTART[k]] + [WD(k, *x[1:]) - .3 for x in v[1:]] + [PEND[k]]
        specs = [v[0]] + [x[0] for x in v[1:]]
        for a, b, s in zip(cuts, cuts[1:], specs): beats.append((a, b, parse_beat(s), k))
    return beats

def build_camera():
    """Keys: on each beat a short move, then a long slow push. Returns list of (t, cx, cy, z, rot) and the beat list."""
    beats = build_beats()
    keys = []
    prev = None
    for a, b, spec, k in beats:
        cx, cy, z, r = target(spec)
        dur = b - a
        mv = min(1.1, max(.5, .3 * dur)) if (spec != prev) else .9 * dur
        same = spec == prev or (spec[0] == 'card' and prev and prev[0] == 'card' and spec[1] == prev[1])
        if same: mv = min(1.4, .4*dur)
        keys.append((a + mv, cx, cy, z, r))
        drift = 1.07 if spec[0] == 'card' else 1.05
        keys.append((b - .02, cx + 14*math.sin(a), cy + 10*math.cos(a), z * drift, r + (.6 if (len(keys) % 4) else -.6)))
        prev = spec
    special = set()
    for bg_ in CHAP:                                 # chapter card: pull out over the board, then go to the first beat
        c0, c1 = bg_['card'], bg_['hold']
        k1 = (c0 + .5, WIDE_C[0], WIDE_C[1], .15, 0); k2 = (c1 - .1, WIDE_C[0], WIDE_C[1], .16, 0)
        keys += [k1, k2]; special |= {k1, k2}
        first = min((x for x in beats if x[0] >= bg_['start'] - .01), key=lambda x: x[0])
        cx, cy, z, r = target(first[2]); keys.append((c1 + 1.0, cx, cy, z, r))
    keys = [k for k in keys if k in special or not any(b_['card'] - .4 < k[0] < b_['hold'] + 1.0 - 1e-6 for b_ in CHAP)]
    keys.sort(key=lambda x: x[0])
    return keys, beats

KEYS_CAM, BEATS = None, None
def cam(t):
    K = KEYS_CAM
    if t <= K[0][0]: return K[0][1:]
    for i in range(len(K)-1):
        a, b = K[i], K[i+1]
        if a[0] <= t <= b[0]:
            u = ease((t-a[0])/max(b[0]-a[0], 1e-3))
            z = math.exp(math.log(a[3]) + (math.log(b[3])-math.log(a[3]))*u)
            return (a[1]+(b[1]-a[1])*u, a[2]+(b[2]-a[2])*u, z, a[4]+(b[4]-a[4])*u)
    return K[-1][1:]

# ---------------------------------------------------------------- annotations
FINALE = P(108)
FINAL_TAGS = {'TOKYO', 'PEARL HARBOR', 'TELUK HITOKAPPU', 'WASHINGTON', 'HINDIA BELANDA · KINI INDONESIA', 'MIDWAY'}
TAGS = [  # anchor, text, t0, screen offset
 (('c', '01', .55, .5), 'PEARL HARBOR · OAHU', WD(2, 'Pearl'), (-300, -230)),
 (('c', '05', .5, .5), '6 KAPAL INDUK JEPANG', WD(3, 'enam'), (-260, -220)),
 (('c', '05', .5, .5), 'TANPA SUARA RADIO', WD(3, 'Tanpa suara'), (-260, -160)),
 (('c', '13', .5, .4), '± 90 MENIT', WD(5, 'sembilan'), (-200, -240)),
 (('c', '13', .5, .4), '> 2.400 TEWAS', WD(5, 'dua ribu'), (-200, -180)),
 (('p', 'TOKYO'), 'TELUK EDO · TOKYO', WD(9, 'Edo'), (60, 40)),
 (('c', '02', .5, .5), 'KOMODOR MATTHEW PERRY', WD(9, 'Komodor') + .4, (-300, -200)),
 (('p', 'JAPAN'), 'RESTORASI MEIJI', WD(10, 'Restorasi'), (80, -120)),
 (('p', 'JAPAN'), 'PABRIK · REL KERETA · ANGKATAN LAUT', WD(10, 'Pabrik'), (80, -60)),
 (('p', 'CHINA'), '1895 · TIONGKOK KALAH', WD(11, 'Tiongkok'), (60, -60)),
 (('p', 'MANCHURIA'), '1905 · RUSIA KALAH', WD(11, 'Rusia'), (60, -60)),
 (('p', 'JAPAN'), 'BATU BARA', WD(12, 'batu'), (100, -180)),
 (('p', 'JAPAN'), 'BESI', WD(12, 'besi'), (100, -120)),
 (('p', 'JAPAN'), 'KARET', WD(12, 'karet'), (100, -60)),
 (('p', 'JAPAN'), 'MINYAK', WD(12, 'minyak'), (100, 0)),
 (('p', 'MANCHURIA'), '1931 · MANCHURIA DIREBUT', WD(14, 'Manchuria'), (60, 40)),
 (('p', 'MANCHURIA'), 'KELUAR DARI LIGA BANGSA-BANGSA', WD(14, 'Liga'), (60, 100)),
 (('p', 'CHINA'), '1937 · PERANG DENGAN TIONGKOK', WD(14, 'Tiongkok meletus'), (60, 40)),
 (('p', 'JAPAN'), 'BERSEKUTU: JERMAN · ITALIA', WD(15, 'Jerman'), (80, -80)),
 (('p', 'CALIFORNIA'), 'CALIFORNIA', WD(16, 'California'), (-300, -60)),
 (('p', 'PEARL'), 'PEARL HARBOR', WD(16, 'pelabuhan') + .6, (60, 40)),
 (('p', 'JAPAN'), '> 80% MINYAK DARI AS', WD(19, 'delapan'), (80, -60)),
 (('p', 'WASHINGTON'), 'WASHINGTON', P(21) + .2, (-120, 50)),
 (('p', 'WASHINGTON'), 'BESI TUA & BAHAN BAKAR DIBATASI', WD(21, 'Penjualan'), (-480, -110)),
 (('p', 'SAIGON'), 'INDOCHINA PRANCIS · KINI VIETNAM', WD(22, 'Indochina'), (60, 40)),
 (('p', 'WASHINGTON'), 'ASET JEPANG DIBEKUKAN', WD(23, 'aset'), (-420, -110)),
 (('p', 'TOKYO'), 'CADANGAN BBM < 2 TAHUN', WD(25, 'kurang'), (60, -100)),
 (('p', 'CHINA'), 'MUNDUR DARI TIONGKOK?', WD(26, 'Mundur'), (60, -110)),
 (('p', 'HINDIA'), 'REBUT SUMBER MINYAK?', WD(26, 'merebut'), (60, -110)),
 (('p', 'HINDIA'), 'HINDIA BELANDA · KINI INDONESIA', WD(27, 'Hindia'), (60, 40)),
 (('p', 'TOKYO'), 'HIDEKI TOJO · PERDANA MENTERI', WD(28, 'Tojo'), (60, 40)),
 (('p', 'TOKYO'), 'PERANG JIKA RUNDING GAGAL', WD(28, 'berperang') - 1.2, (60, 100)),
 (('p', 'PEARL'), 'ARMADA PASIFIK AS', WD(29, 'Armada'), (60, 40)),
 (('c', '04', .5, .25), 'LAKSAMANA ISOROKU YAMAMOTO', WD(30, 'Isoroku'), (-560, -150)),
 (('c', '04', .5, .25), 'PANGLIMA ARMADA GABUNGAN', WD(30, 'Panglima'), (-560, -90)),
 (('p', 'WASHINGTON'), 'HARVARD · ATASE AL DI WASHINGTON', WD(31, 'Harvard'), (-560, -110)),
 (('c', '01', .55, .5), 'SATU PUKULAN KEJUTAN', WD(33, 'pukulan'), (-260, -230)),
 (('c', '10', .5, .5), 'KEDALAMAN ± 12 M', WD(35, 'dua belas'), (-240, -230)),
 (('c', '10', .5, .5), 'SIRIP KAYU PADA TORPEDO', WD(36, 'sirip'), (-280, -170)),
 (('p', 'KAGOSHIMA'), 'TELUK KAGOSHIMA', WD(37, 'Kagoshima'), (60, 40)),
 (('c', '01', .5, .5), 'MATA-MATA · KONSULAT JEPANG', WD(38, 'mata-mata'), (-280, -230)),
 (('c', '04', .5, .25), '"ENAM BULAN KEMENANGAN"', WD(39, 'enam'), (-560, -150)),
 (('p', 'HITOKAPPU'), 'TELUK HITOKAPPU', WD(41, 'Hitokappu'), (60, 40)),
 (('p', 'HITOKAPPU'), 'KEPULAUAN KURIL', WD(41, 'Kuril'), (60, 100)),
 (('c', '05', .5, .5), 'AKAGI', WD(42, 'Akagi'), (-320, -260)),
 (('c', '05', .5, .5), 'KAGA', WD(42, 'Kaga'), (-320, -200)),
 (('c', '05', .5, .5), 'SORYU', WD(42, 'Soryu'), (-320, -140)),
 (('c', '05', .5, .5), 'HIRYU', WD(42, 'Hiryu'), (40, -260)),
 (('c', '05', .5, .5), 'SHOKAKU', WD(42, 'Shokaku'), (40, -200)),
 (('c', '05', .5, .5), 'ZUIKAKU', WD(42, 'Zuikaku'), (40, -140)),
 (('c', '05', .5, .5), '> 400 PESAWAT', WD(42, 'empat ratus'), (-140, 120)),
 (('c', '05', .5, .5), 'WAKIL LAKSAMANA CHUICHI NAGUMO', WD(43, 'Nagumo'), (-360, -220)),
 (('p', 'NORTHPAC'), 'RADIO DIMATIKAN', WD(45, 'Radio'), (-120, -140)),
 (('p', 'NORTHPAC'), 'RUTE PASIFIK UTARA', WD(45, 'Pasifik utara'), (-120, -80)),
 (('c', '05', .5, .5), 'KETAHUAN? PUTAR BALIK', WD(46, 'ketahuan'), (-300, -220)),
 (('p', 'WASHINGTON'), 'NOTA CORDELL HULL', WD(47, 'Cordell'), (-420, -110)),
 (('p', 'TOKYO'), 'DIBACA SEBAGAI ULTIMATUM', WD(48, 'ultimatum'), (60, 40)),
 (('p', 'WASHINGTON'), 'KODE JEPANG DIBONGKAR', WD(55, 'membongkar'), (-420, -110)),
 (('p', 'PEARL'), '27 NOV · PERINGATAN PERANG', WD(55, 'dua puluh tujuh'), (60, 40)),
 (('p', 'PHILIPPINES'), 'FILIPINA?', WD(57, 'Filipina'), (60, -60)),
 (('p', 'MALAYA'), 'MALAYA?', WD(57, 'Malaya'), (60, -60)),
 (('p', 'HINDIA'), 'HINDIA BELANDA?', WD(57, 'Hindia'), (60, 40)),
 (('c', '09', .5, .5), 'TAKUT SABOTASE', WD(57, 'sabotase'), (-240, -230)),
 (('c', '09', .5, .5), 'SAYAP BERTEMU SAYAP', WD(57, 'sayap'), (-240, -170)),
 (('p', 'WASHINGTON'), '"INI BERARTI PERANG"', WD(59, 'perang'), (-380, -110)),
 (('c', '06', .5, .5), 'USS WARD', WD(61, 'Ward'), (-200, -230)),
 (('c', '06', .5, .5), 'KAPAL SELAM MINI DITENGGELAMKAN', WD(61, 'menenggelamkannya'), (-200, -170)),
 (('c', '06', .5, .5), 'TEMBAKAN PERTAMA AS', WD(62, 'tembakan'), (-200, -230)),
 (('c', '07', .5, .4), 'RADAR OPANA', WD(63, 'Opana'), (-220, -230)),
 (('c', '07', .5, .4), 'PULUHAN PESAWAT DARI UTARA', WD(63, 'Puluhan'), (-220, -170)),
 (('c', '07', .5, .4), 'B-17 DARI CALIFORNIA?', WD(64, 'pembom'), (-220, -230)),
 (('c', '07', .5, .4), '"JANGAN KHAWATIR"', WD(65, 'Jangan'), (-220, -170)),
 (('p', 'WASHINGTON'), 'PESAN PEMUTUSAN RUNDING', WD(66, 'pemutusan'), (-440, -110)),
 (('c', '08', .5, .5), 'GELOMBANG PERTAMA · 183 PESAWAT', WD(69, 'Seratus'), (-320, -230)),
 (('c', '08', .5, .5), 'KOMANDAN MITSUO FUCHIDA', WD(70, 'Mitsuo'), (-320, -170)),
 (('c', '10', .55, .45), 'TANPA TANDA SIAGA', WD(71, 'siaga'), (-260, -230)),
 (('c', '09', .5, .5), 'WHEELER', WD(76, 'Wheeler'), (-260, -240)),
 (('c', '09', .5, .5), 'HICKAM', WD(76, 'Hickam'), (-260, -180)),
 (('c', '09', .5, .5), 'KANEOHE', WD(76, 'Kaneohe'), (-260, -120)),
 (('c', '10', .6, .45), 'BATTLESHIP ROW', WD(77, 'Battleship'), (-260, -230)),
 (('c', '11', .5, .5), 'USS OKLAHOMA', WD(78, 'Oklahoma'), (-240, -230)),
 (('c', '12', .5, .5), 'TERBALIK', WD(78, 'terbalik'), (-200, -260)),
 (('c', '12', .5, .5), 'USS WEST VIRGINIA TENGGELAM', WD(78, 'West'), (-200, -200)),
 (('c', '13', .45, .4), 'USS ARIZONA', WD(79, 'Arizona'), (-240, -230)),
 (('c', '13', .45, .4), 'GUDANG AMUNISI MELEDAK', WD(79, 'gudang'), (-240, -170)),
 (('c', '13', .45, .4), '> 1.100 AWAK GUGUR', WD(80, 'seribu'), (-240, -230)),
 (('c', '13', .45, .4), 'HAMPIR SEPARUH KORBAN', WD(80, 'separuh'), (-240, -170)),
 (('c', '14', .5, .5), 'TEMBAKAN ANTIPESAWAT', WD(81, 'antipesawat'), (-260, -230)),
 (('c', '15', .5, .5), 'GELOMBANG KEDUA · 170 PESAWAT', WD(82, 'seratus'), (-300, -230)),
 (('c', '16', .5, .5), 'USS NEVADA', WD(82, 'Nevada'), (-220, -230)),
 (('c', '16', .5, .5), 'SENGAJA DIKANDASKAN', WD(82, 'mengandaskan'), (-220, -170)),
 (('c', '17', .5, .5), 'USS OKLAHOMA', WD(87, 'Oklahoma'), (-240, -230)),
 (('c', '17', .5, .5), '32 PELAUT DISELAMATKAN', WD(87, 'Tiga'), (-240, -170)),
 (('c', '18', .55, .3), 'DORIS MILLER', WD(88, 'Doris'), (-300, -200)),
 (('c', '18', .55, .3), 'JURU MASAK · USS WEST VIRGINIA', WD(88, 'juru'), (-300, -140)),
 (('c', '18', .55, .3), 'NAVY CROSS', WD(88, 'Navy'), (-300, -80)),
 (('c', '08', .5, .5), 'JEPANG: 29 PESAWAT', WD(90, 'Dua'), (-300, -240)),
 (('c', '08', .5, .5), '5 KAPAL SELAM MINI', WD(90, 'lima'), (-300, -180)),
 (('c', '08', .5, .5), '129 PRAJURIT', WD(90, 'seratus'), (-300, -120)),
 (('c', '08', .5, .5), 'KAZUO SAKAMAKI · TAWANAN PERTAMA', WD(90, 'Sakamaki'), (-300, -240)),
 (('p', 'PEARL'), 'ENTERPRISE · CUACA BURUK', WD(93, 'Enterprise'), (60, 40)),
 (('p', 'MIDWAY'), 'MIDWAY', WD(93, 'Midway') - .3, (-120, 50)),
 (('p', 'MIDWAY'), 'LEXINGTON', WD(93, 'Lexington') + .3, (-120, -60)),
 (('p', 'SANDIEGO'), 'SARATOGA · SAN DIEGO', WD(93, 'Saratoga') + .2, (-380, -60)),
 (('c', '05', .5, .5), 'SERANGAN KETIGA?', WD(94, 'ketiga'), (-280, -230)),
 (('c', '05', .5, .5), 'TANGKI MINYAK · GALANGAN', WD(94, 'tangki'), (-280, -170)),
 (('c', '01', .3, .45), 'TANGKI MINYAK UTUH', WD(95, 'barel'), (60, -160)),
 (('c', '01', .3, .45), 'GALANGAN UTUH', WD(95, 'Galangan'), (60, -100)),
 (('c', '20', .5, .4), 'KONGRES AMERIKA SERIKAT', WD(97, 'Kongres'), (-300, -230)),
 (('c', '20', .5, .4), 'PERANG TERHADAP JEPANG', WD(99, 'menyatakan'), (-300, -230)),
 (('c', '20', .5, .4), 'HANYA 1 SUARA MENOLAK', WD(99, 'satu suara'), (-300, -170)),
 (('c', '20', .5, .4), 'JERMAN & ITALIA MENYATAKAN PERANG', WD(99, 'Jerman'), (-300, -110)),
 (('p', 'PHILIPPINES'), 'FILIPINA DISERANG', WD(101, 'Filipina'), (60, -60)),
 (('p', 'SINGAPORE'), 'SINGAPURA JATUH', WD(101, 'Singapura'), (60, 40)),
 (('p', 'HINDIA'), 'MARET 1942 · HINDIA BELANDA MENYERAH', WD(101, 'Hindia'), (60, 40)),
 (('p', 'MIDWAY'), 'PERTEMPURAN MIDWAY · JUNI 1942', WD(103, 'Midway'), (-120, 50)),
 (('c', '21', .5, .5), 'HIRYU', WD(103, 'Hiryu'), (-200, -230)),
 (('c', '21', .5, .5), '4 KAPAL INDUK TENGGELAM', WD(103, 'menenggelamkan'), (-200, -170)),
 (('c', '22', .55, .5), 'USS ARIZONA MEMORIAL', WD(105, 'Arizona'), (-260, -230)),
 (('c', '22', .42, .6), '"AIR MATA HITAM"', WD(106, 'air mata'), (-260, -230)),
]
LINES = [  # A, B, t0, dur  (straight red lines on the map)
 (('p', 'CALIFORNIA'), ('p', 'PEARL'), WD(16, 'memindahkan'), 1.0),
 (('p', 'CALIFORNIA'), ('p', 'JAPAN'), WD(19, 'dibeli'), 1.2),
 (('p', 'SAIGON'), ('p', 'MALAYA'), WD(22, 'Malaya'), .7),
 (('p', 'SAIGON'), ('p', 'PHILIPPINES'), WD(22, 'Filipina'), .7),
 (('p', 'SAIGON'), ('p', 'HINDIA'), WD(22, 'Hindia'), .7),
 (('p', 'PEARL'), ('p', 'HINDIA'), WD(29, 'Pearl'), 1.2),
 (('p', 'HITOKAPPU'), ('p', 'TOKYO'), WD(41, 'Hitokappu'), .8),
 (ROUTE[0], ROUTE[1], WD(45, 'Rutenya'), .5), (ROUTE[1], ROUTE[2], WD(45, 'Rutenya') + .5, .5),
 (ROUTE[2], ROUTE[3], WD(45, 'Rutenya') + 1.0, .5), (ROUTE[3], ROUTE[4], WD(45, 'Rutenya') + 1.5, .5),
 (ROUTE[4], ROUTE[5], P(53) + .3, .6),
 (('p', 'WASHINGTON'), ('p', 'TOKYO'), WD(47, 'nota'), 1.4),
 (('p', 'CALIFORNIA'), ('p', 'PEARL'), WD(64, 'California'), 1.0),
 (ROUTE[5], ('p', 'PEARL'), WD(69, 'lepas'), .8),
 (('p', 'PEARL'), ('p', 'MIDWAY'), WD(93, 'Lexington'), .8),
 (('p', 'PEARL'), ('p', 'SANDIEGO'), WD(93, 'Saratoga'), .9),
 (('p', 'PHILIPPINES'), ('p', 'SINGAPORE'), WD(101, 'Singapura'), .8),
 (('p', 'SINGAPORE'), ('p', 'HINDIA'), WD(101, 'Hindia'), .8),
]
ELLS = [  # centre, rx, ry (world), t0, dur
 (('p', 'PEARL'), 130, 100, WD(16, 'pelabuhan') + .4, .45),
 (('c', '01', .55, .5), 200, 140, P(17) + .2, .45),
 (('p', 'TOKYO'), 120, 100, WD(9, 'Edo'), .45),
 (('p', 'MANCHURIA'), 380, 260, WD(14, 'Manchuria'), .5),
 (('p', 'SAIGON'), 120, 100, WD(22, 'Indochina'), .45),
 (('p', 'HINDIA'), 520, 340, WD(27, 'Hindia'), .5),
 (('p', 'PEARL'), 130, 100, WD(29, 'Pearl'), .45),
 (('p', 'KAGOSHIMA'), 110, 90, WD(37, 'Kagoshima'), .45),
 (('p', 'HITOKAPPU'), 120, 100, WD(41, 'Hitokappu'), .45),
 (('p', 'PHILIPPINES'), 230, 300, WD(57, 'Filipina'), .45),
 (('p', 'MALAYA'), 180, 240, WD(57, 'Malaya'), .45),
 (('p', 'HINDIA'), 520, 340, WD(57, 'Hindia'), .45),
 (('c', '07', .5, .35), 130, 110, WD(63, 'titik'), .45),
 (('c', '13', .45, .4), 190, 150, WD(79, 'Arizona'), .45),
 (('c', '01', .3, .45), 180, 140, WD(95, 'barel'), .45),
 (('p', 'MIDWAY'), 120, 100, WD(103, 'Midway'), .45),
 (('c', '22', .55, .5), 160, 90, WD(105, 'bangkai'), .45),
]
STAMPS = [  # text, anchor, rot, t
 ('EMBARGO', ('g', 155.0, 30.0), -10, WD(23, 'dihentikan')),
 ('PERANG', ('g', 141.5, 31.0), 8, WD(48, 'perang')),
 ('TERLAMBAT', ('g', -86.0, 32.0), -8, P(67) + .2),
 ('DITOLAK', ('c', '05', .55, .62), 9, WD(94, 'menolak')),
 ('TENGGELAM', ('c', '21', .5, .65), -9, WD(103, 'Akagi')),
]
YEARS = [  # t, small line, big line, hold
 (P(1) + .1, 'MINGGU, 7 DESEMBER', '1941', 3.4),
 (P(9) + .05, 'KOMODOR PERRY TIBA', '1853', 2.6),
 (WD(19, 'delapan') - .1, 'MINYAK JEPANG DIBELI DARI AS', '> 80%', 2.6),
 (WD(23, 'satu Agustus') - .2, '1 AGUSTUS 1941', 'EMBARGO', 2.4),
 (WD(34, 'November') - .3, 'TARANTO, ITALIA', 'NOV 1940', 2.6),
 (P(44) + .05, '26 NOVEMBER', '1941', 2.4),
 (P(61) + .05, '7 DESEMBER · WAKTU HAWAII', '06.45', 2.3),
 (P(63) + .05, 'RADAR OPANA', '07.02', 2.2),
 (P(68) + .05, 'GELOMBANG PERTAMA LEPAS LANDAS', '06.10', 2.0),
 (P(71) + .05, 'OAHU TERLIHAT', '07.40', 2.0),
 (P(72) + .05, 'PESAN KE ARMADA', '07.53', 2.0),
 (P(75) + .05, 'BOM PERTAMA', '07.55', 2.0),
 (WD(79, 'pukul') - .1, 'USS ARIZONA', '08.10', 2.2),
 (WD(82, 'pukul') - .1, 'GELOMBANG KEDUA', '08.50', 2.2),
 (P(97) + .05, '8 DESEMBER', '1941', 2.4),
 (WD(104, 'Agustus') - .3, 'PERANG BERAKHIR', '1945', 2.4),
]
TITLE = (WD(7, 'satu pagi') - .4, BAB[0]['end'] + .6)   # opening title card (ends in the first gap)
COUNTERS = [  # t0, t1, small line, number, note
 (WD(89, 'Dua ribu') - .3, P(90) - .2, 'KORBAN TEWAS DI PIHAK AMERIKA', 2403, 'termasuk 68 warga sipil · 1.178 terluka'),
]
QUOTES = [  # t0, t_second_line, t1, mono line, serif line
 (P(50) + .1, P(51) + .2, P(52) - .2, 'NIITAKAYAMA NOBORE 1208', 'Dakilah Gunung Niitaka'),
 (P(73) + .05, P(74) + .1, P(75) - .2, 'TORA! TORA! TORA!', 'kejutan berhasil'),
 (WD(98, 'a date') - .2, WD(98, 'hari') - .1, P(99) - .2, '"A DATE WHICH WILL LIVE IN INFAMY"', 'hari yang akan dikenang sebagai aib'),
]
THESIS = [  # mono line, serif answer, t_start, t_strike, t_answer, t_end
 ('KEMENANGAN TAKTIS BESAR', 'KALAH PERANG', WD(96, 'Jepang meraih') - .2, WD(96, 'karena') - .3, WD(96, 'kalah') - .2, PEND['96'] + .2),
]
END = P(108) + (PEND['108'] - P(108)) * .92
ENGINE = [(P(69), P(84))]

# ---------------------------------------------------------------- projection helpers
def to_screen(p, C):
    cx, cy, z, r = C; a = math.radians(-r)
    x, y = (p[0]-cx)*z, (p[1]-cy)*z
    return (x*math.cos(a) - y*math.sin(a) + W/2, x*math.sin(a) + y*math.cos(a) + H/2)

def world_M(C, scale=1.0):
    cx, cy, z, r = C; a = math.radians(-r); c, s = math.cos(a)*z, math.sin(a)*z
    M = np.array([[c, -s, W/2 - c*cx + s*cy], [s, c, H/2 - s*cx - c*cy]], np.float32)
    M[:, :2] /= scale
    return M

def blend(frame, bgra, M):
    w = cv2.warpAffine(bgra, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    a = w[..., 3:4].astype(np.float32) / 255
    frame[:] = frame * (1 - a) + w[..., :3] * a

def card_M(cd, img, C, extra_scale=1, dy=0, Rr=R):
    h, w = img.shape[:2]
    rr = math.radians(cd['rot']); k = extra_scale / Rr
    c, s = math.cos(rr)*k, math.sin(rr)*k
    L = np.array([[c, -s, cd['c'][0] - (c*w/2 - s*h/2)], [s, c, cd['c'][1] + dy - (s*w/2 + c*h/2)], [0, 0, 1]])
    Wm = np.vstack([world_M(C), [0, 0, 1]])
    return (Wm @ L)[:2].astype(np.float32)

def wobble_ellipse(c, rx, ry, frac, C, seed=0):
    n = int(90*frac)+2; pts = []
    for i in range(n):
        th = -2.3 + 2*math.pi*1.08*(i/89)
        jit = 1 + .04*math.sin(i*.7+seed)
        pts.append(to_screen((c[0]+rx*jit*math.cos(th), c[1]+ry*jit*math.sin(th)), C))
    return pts

def text_center(d, y, s, f, fill):
    w = f.getbbox(s)[2]; d.text(((W-w)/2, y), s, font=f, fill=fill)

FM = None
LINKS = []   # straight red lines between photos: (a, b, t0, dur)
def build_links():
    order = sorted((c for c in CARDS if CARDS[c]['t0'] < 1e8), key=lambda c: CARDS[c]['t0'])
    for a, b in zip(order, order[1:]): LINKS.append((a, b, CARDS[b]['t0'] - .2, .9))

def edge_pt(code, toward):
    """Where the segment from a card's centre toward a world point leaves the card's paper."""
    cx, cy = CARDS[code]['c']; cw, ch = CARDS[code]['size']; a = math.radians(CARDS[code]['rot'])
    dx, dy = toward[0] - cx, toward[1] - cy
    lx, ly = dx*math.cos(a) + dy*math.sin(a), -dx*math.sin(a) + dy*math.cos(a)
    k = min((cw/2 + 6) / abs(lx) if abs(lx) > 1e-6 else 1e9, (ch/2 + 6) / abs(ly) if abs(ly) > 1e-6 else 1e9)
    return (cx + dx*k, cy + dy*k), k

def draw_links(frame, t, C):
    """Straight red photo-to-photo lines from paper edge to paper edge; they grow while the camera travels."""
    zl = max(.4, min(1.4, C[2]*3))
    for a, b, t0, du in LINKS:
        if t < t0: continue
        ca, cb = CARDS[a]['c'], CARDS[b]['c']
        pa, ka = edge_pt(a, cb); pb, kb = edge_pt(b, ca)
        if ka + kb >= 1: continue                                     # overlapping cards: nothing to draw
        u = ease((t - t0) / du)
        qa, qb = to_screen(pa, C), to_screen(pb, C)
        qe = (qa[0] + (qb[0]-qa[0])*u, qa[1] + (qb[1]-qa[1])*u)
        wd = max(2, int(4*zl)); r = max(3, int(6*zl))
        cv2.line(frame, (int(qa[0]+3), int(qa[1]+4)), (int(qe[0]+3), int(qe[1]+4)), (14, 14, 30), wd + 2, cv2.LINE_AA)
        cv2.line(frame, (int(qa[0]), int(qa[1])), (int(qe[0]), int(qe[1])), REDB, wd, cv2.LINE_AA)
        cv2.circle(frame, (int(qa[0]), int(qa[1])), r, REDB, -1, cv2.LINE_AA)
        if u >= 1: cv2.circle(frame, (int(qb[0]), int(qb[1])), r, REDB, -1, cv2.LINE_AA)

def draw_overlays(img, t, C):
    global FM
    FM = FM or font(MONO, 30)
    pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)); d = ImageDraw.Draw(pil, 'RGBA')
    z = C[2]; zl = max(.35, min(1.6, z*3))
    fin = t > FINALE
    for c, rx, ry, t0, du in ELLS:
        if t < t0: continue
        life = 1 - ss((t - t0 - 12) / .6)
        if life <= 0: continue
        pts = wobble_ellipse(A(c), rx, ry, clamp((t-t0)/du), C, seed=t0)
        d.line(pts, fill=RED+(int(240*life),), width=max(3, int(5*zl)), joint='curve')
    for A_, B_, t0, du in LINES:
        if t < t0: continue
        life = 1 - ss((t - t0 - 16) / .6)
        if life <= 0: continue
        u = ease((t-t0)/du); a = to_screen(A(A_), C); b0 = to_screen(A(B_), C)
        b = (a[0]+(b0[0]-a[0])*u, a[1]+(b0[1]-a[1])*u)
        al = int(230*life)
        d.line([a, b], fill=RED+(al,), width=max(2, int(4*zl)))
        for p in (a, b): d.ellipse([p[0]-7, p[1]-7, p[0]+7, p[1]+7], fill=RED+(al,))
    for anchor, txt, t0, off in TAGS:
        if t < t0: continue
        life = 1 - ss((t-t0-7)/.5)
        if fin and txt in FINAL_TAGS: life = max(life, ss((t-FINALE)/.6))
        if t > END - .5: life *= 1 - ss((t - END + .5) / .5)
        if life <= 0: continue
        LA = int(235*life)
        n = min(len(txt), int((t-t0)*22)); s = txt[:n]
        if n < len(txt) or (int(t*2.5) % 2 == 0 and t-t0 < 3): s += '_'
        p = to_screen(A(anchor), C)
        k = 1 if not fin else .7
        q = (p[0]+off[0]*k, p[1]+off[1]*k)
        if not (-600 < q[0] < W+100 and -100 < q[1] < H+100): continue
        ff = FM if not fin else font(MONO, 22)
        tw = ff.getbbox(txt + '_')[2]
        d.line([p, (q[0], q[1]+22*k)], fill=RED+(LA,), width=2)
        d.ellipse([p[0]-6, p[1]-6, p[0]+6, p[1]+6], fill=RED+(LA,))
        d.rectangle([q[0]-10, q[1]-4, q[0]+tw+10, q[1]+44*k], fill=(14, 14, 14, LA))
        d.text((q[0], q[1]+2), s, font=ff, fill=(235, 235, 228, LA))
    return cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)

def screen_overlays(img, t):
    out = img.astype(np.float32)
    def pil_of(o): return Image.fromarray(cv2.cvtColor(np.clip(o, 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB))
    def back(p): return cv2.cvtColor(np.array(p), cv2.COLOR_RGB2BGR)
    for bg_ in CHAP:                                  # chapter card: title only
        c0, c1 = bg_['card'], bg_['hold']
        if c0 - .01 <= t < c1 + .3:
            a = ss((t-c0)/.4) * (1-ss((t-c1+.2)/.5))
            out *= 1 - .62*a
            pil = pil_of(out); d = ImageDraw.Draw(pil, 'RGBA'); al = int(255*a)
            main = bg_['title']
            if t > c0 + .2:
                a2 = int(al*ss((t-c0-.2)/.5))
                fs = 120 if len(main) < 18 else 96 if len(main) < 26 else 84
                text_center(d, 450, main, font(SERIF, fs), (242, 238, 228, a2))
                u = ease((t-c0-.6)/.6); x0 = W/2 - 300
                d.line([(x0, 620), (x0 + 600*u, 620)], fill=RED+(a2,), width=6)
            return back(pil)
    for t0, small, big, hold in YEARS:
        if t0 < t < t0 + hold + .5:
            a = ss((t-t0)/.3) * (1-ss((t-t0-hold)/.4))
            out *= 1 - .45*a
            fl = math.exp(-(t-t0)*5) * a
            yy, xx = np.ogrid[:H, :W]; g = np.exp(-(((xx-W/2)/700)**2 + ((yy-H/2)/400)**2))
            out += (g*fl*120)[..., None] * np.array([40, 120, 230]) / 230
            pil = pil_of(out); d = ImageDraw.Draw(pil, 'RGBA'); al = int(255*a)
            shown = big
            if big.replace('.', '').isdigit():
                roll = int(clamp((t-t0-.15)/.7)*14)
                if roll < 14: shown = big[:-1] + str((int(big[-1]) + roll + 7) % 10)
            text_center(d, 340, small, font(MONO, 44), (220, 220, 210, al))
            text_center(d, 420, shown, font(SERIF, 190 if len(big) < 6 else 150), (240, 236, 225, al))
            d.line([(560, 640), (860, 640)], fill=(200, 200, 190, al), width=2); d.line([(1060, 640), (1360, 640)], fill=(200, 200, 190, al), width=2)
            return back(pil)
    if TITLE[0] < t < TITLE[1]:
        a = ss((t-TITLE[0])/.4) * (1-ss((t-TITLE[1]+.5)/.5))
        out *= 1 - .6*a
        pil = pil_of(out); d = ImageDraw.Draw(pil, 'RGBA'); al = int(255*a)
        s1 = 'SERANGAN KE PEARL HARBOR'; n = min(len(s1), int(max(0, t-TITLE[0]-.2)*20))
        text_center(d, 330, s1[:n] + ('_' if n < len(s1) else ''), font(MONO, 54), (225, 225, 215, al))
        if t > TITLE[0] + 1.0:
            a2 = int(255*a*ss((t-TITLE[0]-1.0)/.4))
            text_center(d, 420, '7 · 12 · 1941', font(SERIF, 170), (242, 238, 228, a2))
            u = ease((t-TITLE[0]-1.4)/.5); x0 = W/2 - 330
            d.line([(x0, 640), (x0 + 660*u, 640)], fill=RED+(a2,), width=6)
        return back(pil)
    for t0, t1, small, num, note in COUNTERS:
        if t0 < t < t1:
            a = ss((t-t0)/.35) * (1-ss((t-t1+.4)/.4))
            out *= 1 - .6*a
            pil = pil_of(out); d = ImageDraw.Draw(pil, 'RGBA'); al = int(255*a)
            v = int(num * ease((t-t0-.2)/1.6))
            text_center(d, 330, small, font(MONO, 44), (220, 220, 210, al))
            text_center(d, 420, f'{v:,}'.replace(',', '.'), font(SERIF, 170), RED+(al,))
            if t > t0 + 2.0:
                text_center(d, 640, note, font(MONO, 32), (200, 200, 190, int(al*ss((t-t0-2)/.4))))
            return back(pil)
    for t0, t2, t1, s1, s2 in QUOTES:
        if t0 < t < t1:
            a = ss((t-t0)/.4) * (1-ss((t-t1+.4)/.4))
            out *= 1 - .65*a
            pil = pil_of(out); d = ImageDraw.Draw(pil, 'RGBA'); al = int(255*a)
            f1 = font(MONO, 64 if len(s1) < 26 else 46); n = min(len(s1), int(max(0, t-t0-.2)*16))
            text_center(d, 400, s1[:n] + ('_' if n < len(s1) else ''), f1, (232, 230, 222, al))
            if t > t2:
                a2 = int(al*ss((t-t2)/.5))
                text_center(d, 520, s2, font(SERIF, 84), RED+(a2,))
            return back(pil)
    for s1, s2, ta, tstrike, tans, tb in THESIS:
        if ta < t < tb:
            a = ss((t-ta)/.5) * (1-ss((t-tb+.5)/.5))
            out *= 1 - .6*a
            pil = pil_of(out); d = ImageDraw.Draw(pil, 'RGBA'); al = int(255*a)
            f1 = font(MONO, 50 if len(s1) < 26 else 40); n = min(len(s1), int(max(0, t-ta-.3)*18))
            w1 = f1.getbbox(s1)[2]; x1 = (W-w1)/2
            d.text((x1, 400), s1[:n], font=f1, fill=(220, 220, 212, al))
            if t > tstrike:
                u = ease((t-tstrike)/.5); d.line([(x1-10, 428), (x1-10+(w1+20)*u, 428)], fill=RED+(al,), width=6)
            if t > tans:
                f2 = font(SERIF, 150 if len(s2) < 10 else 120); n2 = min(len(s2), int((t-tans)*12)); w2 = f2.getbbox(s2 + '.')[2]
                d.text(((W-w2)/2, 490), s2[:n2], font=f2, fill=(242, 238, 228, al))
                if n2 == len(s2): d.text(((W-w2)/2 + f2.getbbox(s2)[2], 490), '.', font=f2, fill=RED+(al,))
            return back(pil)
    if t > END:
        a = ss((t-END)/.6); fade = 1 - ss((t-(DUR-1.4))/1.2)
        out *= (1 - .85*a)
        pil = pil_of(out); d = ImageDraw.Draw(pil, 'RGBA')
        text_center(d, 400, 'PEARL HARBOR', font(SERIF, 150), RED+(int(255*a),))
        text_center(d, 600, '7 DESEMBER 1941', font(MONO, 46), (220, 220, 212, int(255*a)))
        o = back(pil)
        if END < t < END + .5:
            r2 = np.random.default_rng(int(t*30))
            for _ in range(6):
                y = int(r2.integers(380, 640)); hh = int(r2.integers(8, 30)); sh = int(r2.integers(-60, 60))
                o[y:y+hh] = np.roll(o[y:y+hh], sh, axis=1)
        return (o * fade).astype(np.uint8)
    return np.clip(out, 0, 255).astype(np.uint8)

# ---------------------------------------------------------------- render
def setup():
    global KEYS_CAM, BEATS
    build_cards()
    KEYS_CAM, BEATS = build_camera()
    for a, b, spec, k in BEATS:                  # a card appears when the camera first goes to it
        if spec[0] == 'card':
            hb = next((b_['hold'] for b_ in CHAP if b_['start'] - .01 <= a < b_['hold']), None)
            CARDS[spec[1]]['t0'] = min(CARDS[spec[1]]['t0'], (hb + .6) if hb else a + .25)
    build_links()
    stamps = [(make_stamp(s), A(an), rot, t) for s, an, rot, t in STAMPS]
    return build_bg(), stamps

SHAKES = [s[3] for s in STAMPS]

def board_frame(t, fi, bg, stamps, vig, grains):
    C = list(cam(t))
    for st in SHAKES:
        if st < t < st+.35:
            k = (1-(t-st)/.35)*14; C[0] += k*math.sin(t*90)/C[2]; C[1] += k*math.cos(t*77)/C[2]
    frame = cv2.warpAffine(bg, world_M(C, BGS), (W, H), flags=cv2.INTER_LINEAR, borderValue=(38, 38, 24)).astype(np.float32)
    draw_links(frame, t, C)                      # photo-to-photo lines run edge to edge, under other photos
    for code in sorted(CARDS, key=lambda c: CARDS[c]['t0']):
        cd = CARDS[code]
        if t < cd['t0']: continue
        u = (t - cd['t0']) / .45
        sc = 1.12 - .12*backout(u); dy = -60*(1-ease(u))
        p = to_screen(cd['c'], C); r = max(cd['size']) * C[2] * .75
        if p[0]+r < 0 or p[0]-r > W or p[1]+r < 0 or p[1]-r > H: continue
        use_small = C[2] < .22
        im = cd['small'] if use_small else cd['img']
        if u < 1:
            im = im.copy(); im[..., 3] = (im[..., 3] * ss(u*1.6)).astype(np.uint8)
        blend(frame, im, card_M(cd, im, C, sc, dy, R/4 if use_small else R))
    for img, c, rot, st in stamps:
        if t > st:
            u = (t-st)/.2; sc = 1.6 - .6*backout(u, 2.2)
            blend(frame, img, card_M(dict(c=c, rot=rot), img, C, sc))
    frame = np.clip(frame, 0, 255).astype(np.uint8)
    frame = draw_overlays(frame, t, C)
    frame = screen_overlays(frame, t)
    f = frame.astype(np.float32)
    for st in SHAKES:
        if st < t < st + .2:
            f[..., 2] = np.roll(f[..., 2], 10, axis=1); f[..., 0] = np.roll(f[..., 0], -10, axis=1)
    f = f * vig + grains[fi % 6]
    if t < .8: f *= t/.8
    return np.clip(f, 0, 255).astype(np.uint8)

def render(frames, out):
    bg, stamps = setup()
    yy, xx = np.ogrid[:H, :W]; vig = (1 - .45*np.clip(((xx-W/2)/(W*.62))**2 + ((yy-H/2)/(H*.62))**2, 0, 1))[..., None].astype(np.float32)
    grains = [rng.normal(0, 7, (H, W, 1)).astype(np.float32) for _ in range(6)]
    if out.endswith('/'):
        os.makedirs(out, exist_ok=True); ff = None
    else:
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    for fi in frames:
        t = fi / FPS
        fr = board_frame(t, fi, bg, stamps, vig, grains)
        if ff: ff.stdin.write(fr.tobytes())
        else: cv2.imwrite(os.path.join(out, f'{t:07.2f}.jpg'), fr, [cv2.IMWRITE_JPEG_QUALITY, 88])
    if ff: ff.stdin.close(); ff.wait()

def overview(path):
    bg, stamps = setup()
    small = cv2.resize(bg, (WW//10, WH//10)).astype(np.float32)
    for code, cd in CARDS.items():
        M = card_M(cd, cd['small'], (WW/2, WH/2, .1, 0), 1, 0, R/4)
        M[0, 2] += WW/20 - W/2; M[1, 2] += WH/20 - H/2
        w = cv2.warpAffine(cd['small'], M, (WW//10, WH//10), borderValue=(0, 0, 0, 0))
        a = w[..., 3:4] / 255; small = small*(1-a) + w[..., :3]*a
    o = np.clip(small, 0, 255).astype(np.uint8)
    for k, p in PL.items():
        cv2.circle(o, (int(p[0]/10), int(p[1]/10)), 6, REDB, -1); cv2.putText(o, k, (int(p[0]/10)+8, int(p[1]/10)), 0, .45, (255, 255, 255), 1)
    for code in CARDS: cv2.putText(o, code, (int(LAYOUT[code][0]/10)-10, int(LAYOUT[code][1]/10)), 0, .8, (0, 255, 255), 2)
    cv2.imwrite(path, o)

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'stills':
        render([int(float(x)*FPS) for x in sys.argv[2].split(',')], os.path.join(HERE, 'stills') + '/')
    elif mode == 'overview':
        overview(os.path.join(HERE, 'overview.jpg'))
    else:
        render(range(int(sys.argv[2]), int(sys.argv[3])), sys.argv[4])
