"""Perang Tiga Puluh Tahun — Kaz evidence-board documentary.
Adapted from the kaz-documentary skill's board_engine.py (same rendering grammar), data-driven from timing.json.

  python3 video_kaz/kaz30.py stills 10,130,400      -> video_kaz/stills/*.jpg
  python3 video_kaz/kaz30.py overview                -> top-down board layout check
  python3 video_kaz/kaz30.py full START END out.mp4  -> frame range (30 fps)
"""
import os, sys, json, math, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
IMGDIR = os.path.join(ROOT, 'gambar_tritone')
W, H, FPS = 1920, 1080, 30
MONO = '/usr/share/fonts/truetype/freefont/FreeMonoBold.ttf'
SERIF = '/usr/share/fonts/truetype/crosextra/Caladea-Bold.ttf'
RED = (208, 49, 45)                       # RGB
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
TM, BAG, DUR = _TG['paras'], _TG['bagian'], _TG['duration']
PSTART = {f"{d['bagian']}.{d['para']}": d['start'] for d in TM}
PTEXT = {f"{d['bagian']}.{d['para']}": d['text'] for d in TM}
KEYS = list(PSTART)
PEND = {}
for i, k in enumerate(KEYS):
    nxt = KEYS[i+1] if i+1 < len(KEYS) else None
    PEND[k] = PSTART[nxt] if nxt and nxt.split('.')[0] == k.split('.')[0] else BAG[int(k.split('.')[0]) - 1]['end']
def P(k): return PSTART[k]
def WD(k, word, n=1):
    """Estimated time a word is spoken: char position inside the paragraph, spread over its speech span."""
    txt = PTEXT[k]; i = -1
    for _ in range(n): i = txt.index(word, i + 1)
    span = (PEND[k] - PSTART[k]) - 0.35
    return PSTART[k] + span * i / len(txt)

# vintage insert window (Defenestrasi Praha): paragraphs 3.5 .. 3.9
INS0, INS1 = P('3.5'), P('3.10')

# ---------------------------------------------------------------- board map
MK, MX, MY = 6.0, 2900, 1300              # map 1024-space -> world
def MAP(x, y): return (MX + MK*x, MY + MK*y)
PL = dict(PRAHA=MAP(640, 469), BOHEMIA=MAP(660, 500), MAGDEBURG=MAP(492, 308), MUENSTER=MAP(296, 314),
          OSNABRUECK=MAP(318, 290), BREITENFELD=MAP(538, 362), LUETZEN=MAP(522, 372), WIEN=MAP(738, 622),
          STETTIN=MAP(628, 205), NOERDLINGEN=MAP(430, 590), PFALZ=MAP(320, 560), HRE=MAP(500, 450))

def build_bg():
    w, h = int(WW*BGS), int(WH*BGS)
    bg = np.zeros((h, w, 3), np.float32) + np.array([42, 40, 22], np.float32)
    n = cv2.resize(rng.random((h//20, w//20)).astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC)
    bg += (n[..., None] - .5) * 14
    src = os.path.join(ROOT, 'gambar', '01_peta-kekaisaran-romawi-suci-1618.jpg')
    m = cv2.cvtColor(cv2.imread(src), cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    mw, mh = int(1024*MK*BGS), int(933*MK*BGS)
    m = cv2.resize(m, (mw, mh), interpolation=cv2.INTER_CUBIC)
    m = np.clip((m - .35) / .6, 0, 1)                       # lift land / sea contrast
    dark, light = np.array([40, 38, 20]), np.array([150, 150, 112])
    tint = dark + (light - dark) * m[..., None]
    x0, y0 = int(MX*BGS), int(MY*BGS)
    fy = np.minimum(np.arange(mh), np.arange(mh)[::-1]) / (200)
    fx = np.minimum(np.arange(mw), np.arange(mw)[::-1]) / (200)
    f = np.clip(np.minimum(fy[:, None], fx[None, :]), 0, 1)[..., None] * .82
    reg = bg[y0:y0+mh, x0:x0+mw]
    bg[y0:y0+mh, x0:x0+mw] = reg * (1 - f) + tint * f
    g = int(250*BGS)
    for k in range(0, w, g): bg[:, k:k+1] += 6
    for k in range(0, h, g): bg[k:k+1, :] += 6
    return np.clip(bg, 0, 255).astype(np.uint8)

# ---------------------------------------------------------------- cards
def find_img(code):
    return os.path.join(IMGDIR, next(f for f in os.listdir(IMGDIR) if f.startswith(code + '_')))

CROP = {'13': (.18, 0, .84, 1), '16': (0, .1, 1, 1), '06': (0, .1, 1, .88)}

def make_card(code, wworld, border=14):
    im = Image.open(find_img(code)).convert('RGB')
    if code in CROP:
        x0, y0, x1, y1 = CROP[code]; im = im.crop((int(x0*im.width), int(y0*im.height), int(x1*im.width), int(y1*im.height)))
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
    # prolog / suffering column (left)
    '31': (1250, 1150, -3, 1000), '15': (2500, 950, 4, 900), '11': (1350, 2350, 2, 1050), '32': (2550, 2300, -5, 700),
    # Prague / Bohemia cluster (south-east of Praha pin)
    '07': (7650, 4650, 2, 950), '09': (8900, 3900, -3, 800), '24': (6500, 5750, 3, 700), '13': (8950, 5250, -2, 650),
    '12': (9950, 4600, 4, 800), '03': (8350, 6050, -4, 560),
    # Magdeburg cluster (north of the pin)
    '19': (5100, 2150, -3, 950), '14': (6350, 1550, 2, 1150), '17': (4250, 2950, 3, 750), '16': (7400, 2150, -4, 650),
    '18': (5900, 2700, 3, 800),
    # Sweden / Breitenfeld / Lützen (north-east)
    '20': (8300, 1000, -3, 700), '23': (9350, 2350, 3, 900), '22': (7350, 3500, -2, 800), '21': (10300, 3200, 3, 850),
    # France (south-west)
    '26': (2200, 5100, -3, 900), '25': (3700, 6100, 3, 700), '06': (5300, 5150, -3, 900),
    # Westphalia (west, near Münster / Osnabrück)
    '38': (3500, 3700, -3, 800), '37': (4300, 1650, 4, 750), '35': (5100, 7050, -2, 1150), '39': (6650, 7050, 3, 750),
    '36': (3550, 7550, 2, 750),
    # war on civilians (bottom left)
    '30': (1300, 6450, -3, 1050), '34': (2350, 7650, 4, 650), '33': (1050, 7700, -4, 650), '28': (7950, 7600, 3, 600),
    '29': (2600, 3500, -4, 650),
}
CARDS = {}
def build_cards():
    for code, (cx, cy, rot, w) in LAYOUT.items():
        img, (cw, ch) = make_card(code, w)
        small = cv2.resize(img, (img.shape[1]//4, img.shape[0]//4), interpolation=cv2.INTER_AREA)
        CARDS[code] = dict(img=img, small=small, c=(cx, cy), rot=rot, size=(cw, ch), t0=1e9)

def card_pt(code, fx, fy):
    """World coordinate of a point inside a card's picture (fractions of the card)."""
    cx, cy, rot, _ = LAYOUT[code]; cw, ch = CARDS[code]['size'] if CARDS else (LAYOUT[code][3], LAYOUT[code][3]*.7)
    dx, dy = (fx - .5) * cw, (fy - .5) * ch; a = math.radians(rot)
    return (cx + dx*math.cos(a) - dy*math.sin(a), cy + dx*math.sin(a) + dy*math.cos(a))

def A(spec):
    """Anchor: ('c', code, fx, fy) | ('p', place) | ('m', x, y) | (x, y)."""
    if spec[0] == 'c': return card_pt(*spec[1:])
    if spec[0] == 'p': return PL[spec[1]]
    if spec[0] == 'm': return MAP(spec[1], spec[2])
    return spec

# ---------------------------------------------------------------- beats (camera)
# per paragraph: card code [@fx,fy] [*zoom]  |  'M:PLACE*zoom'  |  'WIDE*zoom'
BEAT = {
 '1.1': '31*0.9', '1.2': '15', '1.3': '11', '1.4': 'WIDE*0.16', '1.5': '03', '1.6': 'M:BOHEMIA*0.55', '1.7': '32', '1.8': '23*0.8', '1.9': '23@.5,.5*1.25',
 '2.1': 'WIDE*0.12', '2.2': 'M:HRE*0.2', '2.3': '06', '2.4': '07', '2.5': '07@.5,.35*1.4', '2.6': '03', '2.7': '03@.45,.3*1.3',
 '2.8': 'M:BOHEMIA*0.5', '2.9': '03@.45,.25*1.5', '2.10': '07*0.9', '2.11': '09',
 '3.1': '07@.55,.4*1.3', '3.2': '09', '3.3': '09@.5,.5*1.2', '3.4': '09@.4,.45*1.4',
 '3.10': '09', '3.11': '09*0.85', '3.12': '07', '3.13': '03@.45,.25*1.3', '3.14': '24', '3.15': '13',
 '4.1': '07*0.85', '4.2': 'M:PFALZ*0.32', '4.3': '12', '4.4': '12*0.85', '4.5': '03', '4.6': '12@.45,.35*1.35', '4.7': '12',
 '4.8': '11', '4.9': '11@.5,.5*1.3', '4.10': '11', '4.11': '12', '4.12': '07', '4.13': 'M:BOHEMIA*0.45',
 '4.14': 'WIDE*0.18', '4.15': 'M:HRE*0.17', '4.16': 'M:BOHEMIA*0.22',
 '5.1': 'M:MAGDEBURG*0.5', '5.2': 'M:MAGDEBURG*0.3', '5.3': '19', '5.4': '19@.62,.45*1.35', '5.5': '17', '5.6': '14',
 '5.7': '14@.45,.35*1.4', '5.8': '17*0.9', '5.9': '16', '5.10': '16@.5,.5*1.2', '5.11': '18', '5.12': '15', '5.13': '15@.5,.5*1.25',
 '5.14': '14@.15,.35*1.6', '5.15': '32', '5.16': '18*0.9', '5.17': 'M:MAGDEBURG*0.2', '5.18': 'WIDE*0.15', '5.19': '15*0.9',
 '5.20': '20*0.75', '5.21': '20', '5.22': '20@.66,.3*1.4',
 '6.1': 'M:STETTIN*0.3', '6.2': '20', '6.3': '26@.6,.25*1.5', '6.4': '20@.66,.3*1.3', '6.5': '13', '6.6': '23', '6.7': '23@.5,.45*1.3',
 '6.8': '23*0.9', '6.9': 'M:BREITENFELD*0.4', '6.10': 'M:HRE*0.2', '6.11': '20', '6.12': '22', '6.13': '22@.5,.45*1.3',
 '6.14': '22@.45,.45*1.5', '6.15': '20', '6.16': '20*0.85', '6.17': 'WIDE*0.16', '6.18': 'M:HRE*0.18', '6.19': '25',
 '7.1': 'M:BOHEMIA*0.18', '7.2': '25', '7.3': '26', '7.4': '25@.45,.3*1.35', '7.5': '25', '7.6': '25*0.85',
 '7.7': '26@.28,.75*1.5', '7.8': '26', '7.9': 'WIDE*0.14', '7.10': '26*0.95', '7.11': '21', '7.12': '23*0.85',
 '8.1': '31', '8.2': '28', '8.3': '33', '8.4': '33@.5,.45*1.3', '8.5': '33@.85,.55*1.45', '8.6': '30', '8.7': '34',
 '8.8': '31@.5,.6*1.3', '8.9': '31', '8.10': '31@.45,.65*1.4', '8.11': '30*0.9', '8.12': '29', '8.13': 'M:HRE*0.17',
 '8.14': '34', '8.15': '26', '8.16': '32', '8.17': '30', '8.18': '39*0.9',
 '9.1': '38', '9.2': '38@.5,.4*1.3', '9.3': '39', '9.4': '36', '9.5': '36', '9.6': '39@.5,.45*1.3', '9.7': '39*0.9',
 '9.8': '38', '9.9': '35', '9.10': '35@.5,.55*1.3', '9.11': '39', '9.12': '36@.45,.4*1.35', '9.13': '36@.5,.45*1.3',
 '9.14': '21', '9.15': '26@.28,.75*1.4', '9.16': '36', '9.17': '35*0.85', '9.18': 'M:HRE*0.16',
 '10.1': '35*0.8', '10.2': '31', '10.3': '15', '10.4': '31@.45,.65*1.4', '10.5': 'M:HRE*0.17',
 '10.6': 'M:BOHEMIA*0.3', '10.7': 'WIDE*0.12', '10.8': '07', '10.9': '19', '10.10': '20', '10.11': '26',
 '10.12': 'WIDE*0.13', '10.13': '23', '10.14': '31', '10.15': 'WIDE*0.115', '10.16': 'WIDE*0.105', '10.17': 'WIDE*0.1',
}
SPLIT = {'9.8': [('38', 0.0), ('37', None)]}   # 9.8: Münster, then cut to Osnabrück on the word
WIDE_C = (5900, 4300)

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
    cw, ch = CARDS[code]['size'] if CARDS else (LAYOUT[code][3]*1.1, LAYOUT[code][3]*.8)
    z = min(.80 * W / cw, .84 * H / ch) * zm
    c = card_pt(code, *(focus or (.5, .5)))
    return (c[0], c[1], z, LAYOUT[code][2] * .6)

def build_camera():
    """Keys: on each beat a short move, then a long slow push. Returns list of (t, cx, cy, z, rot) and the beat list."""
    beats = []
    for k in KEYS:
        if INS0 <= PSTART[k] < INS1: continue
        if k in SPLIT:
            t_cut = WD('9.8', 'Osnabrück') - .4
            beats.append((PSTART[k], t_cut, parse_beat('38'), k)); beats.append((t_cut, PEND[k], parse_beat('37'), k))
        else:
            beats.append((PSTART[k], PEND[k], parse_beat(BEAT[k]), k))
    keys = []
    prev = None
    for a, b, spec, k in beats:
        cx, cy, z, r = target(spec)
        if a >= INS1 - .01 and keys[-1][0] < INS0:      # jump straight past the insert
            keys.append((INS1, cx, cy, z*.97, r))
        dur = b - a
        mv = min(1.1, max(.5, .3 * dur)) if (spec != prev) else .9 * dur
        same = spec == prev or (spec[0] == 'card' and prev and prev[0] == 'card' and spec[1] == prev[1])
        if same: mv = min(1.4, .4*dur)
        keys.append((a + mv, cx, cy, z, r))
        drift = 1.07 if spec[0] == 'card' else 1.05
        keys.append((b - .02, cx + 14*math.sin(a), cy + 10*math.cos(a), z * drift, r + (.6 if (len(keys) % 4) else -.6)))
        prev = spec
    for bg_ in BAG[1:]:                              # chapter card (none for Bagian 1): pull out over the board while the card shows, then go to the first beat
        c0, c1 = bg_['card'], bg_['hold']
        if bg_['n'] == 1:
            keys.append((0.0, WIDE_C[0], WIDE_C[1], .13, 0))
        else:
            keys.append((c0 + .5, WIDE_C[0], WIDE_C[1], .14, 0))
        keys.append((c1 - .1, WIDE_C[0], WIDE_C[1], .15, 0))
        first = min((x for x in beats if x[0] >= bg_['start'] - .01), key=lambda x: x[0])
        cx, cy, z, r = target(first[2]); keys.append((c1 + 1.0, cx, cy, z, r))
    keys = [k for k in keys if not any(b_['card'] - .4 < k[0] < b_['hold'] + 1.0 - 1e-6 and not k in (
        (b_['card'] + .5, WIDE_C[0], WIDE_C[1], .14, 0), (b_['hold'] - .1, WIDE_C[0], WIDE_C[1], .15, 0), (0.0, WIDE_C[0], WIDE_C[1], .13, 0)) for b_ in BAG[1:])]
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
FINALE = P('10.6')
FINAL_TAGS = {'BOHEMIA', 'KASTEL PRAHA', 'WHITE MOUNTAIN', 'MAGDEBURG', 'BREITENFELD', 'LÜTZEN', '1630 · MASUK KE JERMAN', 'MÜNSTER',
              'PRANCIS · KATOLIK', 'KEKAISARAN ROMAWI SUCI'}
TAGS = [  # anchor, text, t0, screen offset
 (('p', 'BOHEMIA'), 'BOHEMIA', WD('1.6', 'Bohemia'), (60, 40)),
 (('c', '03', .7, .2), 'AGAMA', WD('1.5', 'agama'), (80, -120)),
 (('c', '03', .7, .2), 'POLITIK', WD('1.5', 'politik'), (80, -60)),
 (('c', '03', .7, .2), 'AMBISI', WD('1.5', 'ambisi'), (80, 0)),
 (('p', 'HRE'), 'KEKAISARAN ROMAWI SUCI', WD('2.2', 'Kekaisaran'), (-260, -160)),
 (('c', '06', .5, .5), 'RATUSAN WILAYAH KECIL', WD('2.3', 'ratusan'), (-220, -200)),
 (('c', '07', .55, .25), 'REFORMASI PROTESTAN · ABAD KE-16', WD('2.5', 'Reformasi'), (-380, -170)),
 (('c', '03', .45, .2), 'FERDINAND II · HABSBURG', WD('2.7', 'Katolik'), (120, -150)),
 (('c', '03', .45, .2), 'KATOLIK', WD('2.7', 'Katolik') + .8, (120, -90)),
 (('p', 'PRAHA'), 'KASTEL PRAHA', WD('3.1', 'Kastel'), (60, -90)),
 (('c', '09', .5, .4), 'BANGSAWAN PROTESTAN', P('3.2') + .6, (-200, -190)),
 (('c', '09', .4, .45), 'JAROSLAV MARTINIC', WD('3.4', 'Jaroslav'), (120, -200)),
 (('c', '09', .4, .45), 'VILÉM SLAVATA', WD('3.4', 'Vilém'), (120, -140)),
 (('c', '09', .4, .45), 'PHILIP FABRICIUS · SEKRETARIS', WD('3.4', 'Philip'), (120, -80)),
 (('c', '07', .5, .3), 'PEMBERONTAKAN BOHEMIA', WD('3.12', 'pemberontakan'), (-260, -170)),
 (('c', '03', .45, .2), 'FERDINAND II', WD('3.13', 'Ferdinand'), (120, -120)),
 (('c', '13', .5, .3), 'TENTARA KEKAISARAN', WD('3.15', 'Kekaisaran'), (-220, -200)),
 (('p', 'PFALZ'), 'FREDERICK V · PALATINATE', WD('4.2', 'Frederick'), (60, -80)),
 (('p', 'PRAHA'), 'RAJA BOHEMIA · 1619', WD('4.3', '1619'), (60, 40)),
 (('c', '12', .5, .2), '"RAJA MUSIM DINGIN"', WD('4.6', 'Raja'), (-200, -200)),
 (('p', 'PRAHA'), 'WHITE MOUNTAIN', WD('4.8', 'White'), (-300, 60)),
 (('c', '12', .5, .2), 'MELARIKAN DIRI', WD('4.11', 'melarikan'), (-180, -160)),
 (('c', '07', .5, .3), 'HARTA DISITA', WD('4.12', 'disita'), (-180, -170)),
 (('p', 'MAGDEBURG'), 'MAGDEBURG', WD('5.3', 'Magdeburg'), (60, 40)),
 (('c', '19', .6, .4), 'KOTA PROTESTAN', WD('5.3', 'Protestan'), (-260, -190)),
 (('c', '19', .6, .4), 'SIMBOL PERLAWANAN', WD('5.4', 'simbol'), (-260, -130)),
 (('c', '17', .45, .35), 'COUNT OF TILLY', WD('5.5', 'Tilly'), (100, -200)),
 (('c', '17', .45, .35), 'MENGEPUNG MAGDEBURG', WD('5.5', 'mengepung'), (100, -140)),
 (('c', '14', .45, .35), 'BANTUAN TIDAK TIBA', WD('5.8', 'tidak'), (-220, -160)),
 (('c', '18', .5, .4), 'SACK OF MAGDEBURG', WD('5.16', 'Sack'), (-220, -200)),
 (('c', '20', .66, .3), 'GUSTAVUS ADOLPHUS', WD('5.22', 'Gustavus'), (-560, -160)),
 (('c', '20', .66, .3), 'RAJA SWEDIA', WD('5.22', 'Raja'), (-560, -100)),
 (('p', 'STETTIN'), '1630 · MASUK KE JERMAN', WD('6.1', 'memasuki'), (60, 40)),
 (('c', '26', .6, .25), 'LAUT BALTIK', WD('6.3', 'Baltik'), (60, -130)),
 (('c', '13', .5, .4), 'INFANTERI', WD('6.5', 'infanteri'), (-160, -230)),
 (('c', '13', .5, .4), 'KAVALERI', WD('6.5', 'kavaleri'), (-160, -170)),
 (('c', '13', .5, .4), 'ARTILERI', WD('6.5', 'artileri'), (-160, -110)),
 (('p', 'BREITENFELD'), 'BREITENFELD', WD('6.6', 'Breitenfeld') - 3, (80, -60)),
 (('c', '23', .5, .45), 'KEMENANGAN SWEDIA', WD('6.8', 'kemenangan'), (-220, -200)),
 (('p', 'LUETZEN'), 'LÜTZEN', WD('6.12', 'Lützen') - 3, (-200, 50)),
 (('c', '22', .5, .45), 'KABUT TEBAL', WD('6.13', 'kabut'), (-200, -200)),
 (('c', '26', .28, .75), 'PRANCIS · KATOLIK', WD('7.3', 'Prancis'), (-60, -200)),
 (('c', '26', .28, .75), 'MELAWAN SPANYOL & HABSBURG', WD('7.3', 'Spanyol'), (-60, -140)),
 (('c', '26', .28, .75), 'LOUIS XIII · KARDINAL RICHELIEU', WD('7.7', 'Louis'), (-60, -200)),
 (('c', '31', .5, .5), 'RAKYAT BIASA', WD('8.1', 'masyarakat'), (-160, -230)),
 (('c', '33', .5, .5), 'MAKANAN', WD('8.3', 'makanan'), (-240, -240)),
 (('c', '33', .5, .5), 'UANG', WD('8.3', 'uang'), (-240, -180)),
 (('c', '33', .5, .5), 'PERLENGKAPAN PERANG', WD('8.3', 'perlengkapan'), (-240, -120)),
 (('c', '30', .5, .5), 'PENJARAHAN', WD('8.6', 'penjarahan'), (-160, -220)),
 (('c', '31', .5, .6), 'LADANG TERBENGKALAI', WD('8.8', 'Ladang'), (-260, -250)),
 (('c', '31', .5, .6), 'PERDAGANGAN TERGANGGU', WD('8.8', 'Perdagangan'), (-260, -190)),
 (('c', '31', .5, .6), 'HARGA MAKANAN NAIK', WD('8.8', 'Harga'), (-260, -130)),
 (('c', '31', .5, .5), 'KELAPARAN · PENYAKIT', WD('8.9', 'kelaparan'), (-220, -230)),
 (('p', 'HRE'), 'DAMPAK DEMOGRAFIS', WD('8.13', 'Dampak'), (-200, -160)),
 (('p', 'MUENSTER'), 'MÜNSTER', P('9.2'), (60, 40)),
 (('c', '36', .25, .6), 'PRANCIS', WD('9.5', 'Prancis'), (-60, -60)),
 (('c', '36', .55, .1), 'SWEDIA', WD('9.5', 'Swedia'), (60, -10)),
 (('c', '36', .15, .92), 'SPANYOL', WD('9.5', 'Spanyol'), (40, -80)),
 (('c', '36', .5, .45), 'KEKAISARAN ROMAWI SUCI', WD('9.5', 'Kekaisaran'), (40, -40)),
 (('c', '38', .5, .4), 'MÜNSTER', WD('9.8', 'Münster'), (-140, -180)),
 (('c', '37', .5, .45), 'OSNABRÜCK', WD('9.8', 'Osnabrück'), (-160, -190)),
 (('c', '35', .5, .4), 'PERDAMAIAN WESTPHALIA', WD('9.9', 'Perdamaian'), (-260, -230)),
 (('c', '39', .5, .3), 'KATOLIK', WD('9.11', 'Katolik'), (-300, -220)),
 (('c', '39', .5, .3), 'LUTHERAN', WD('9.11', 'Lutheran'), (-300, -160)),
 (('c', '39', .5, .3), 'CALVINIS', WD('9.11', 'Calvinis'), (-300, -100)),
 (('c', '26', .28, .75), 'PRANCIS VS SPANYOL: HINGGA 1659', WD('9.15', 'Prancis'), (-60, -200)),
]
LINES = [  # A, B, t0, dur
 (('c', '07', .55, .3), ('p', 'PRAHA'), WD('3.1', 'Praha'), .8),
 (('p', 'PRAHA'), ('p', 'MAGDEBURG'), P('4.16') + .6, .9),
 (('p', 'PRAHA'), ('p', 'PFALZ'), P('4.16') + 1.0, .9),
 (('p', 'PRAHA'), ('p', 'WIEN'), P('4.16') + 1.4, .9),
 (('c', '03', .5, .2), ('c', '12', .5, .3), WD('4.5', 'Frederick'), .9),
 (('c', '11', .5, .3), ('p', 'PRAHA'), WD('4.8', 'Praha'), .8),
 (('c', '17', .4, .3), ('p', 'MAGDEBURG'), WD('5.5', 'mengepung'), .8),
 (('c', '20', .5, .9), ('p', 'STETTIN'), WD('6.1', 'memasuki') - .3, 1.0),
 (('c', '23', .5, .5), ('p', 'BREITENFELD'), WD('6.6', 'Breitenfeld'), .8),
 (('c', '22', .5, .5), ('p', 'LUETZEN'), WD('6.12', 'Lützen'), .8),
 (('c', '38', .5, .5), ('p', 'MUENSTER'), P('9.2') + .4, .8),
 (('c', '37', .5, .5), ('p', 'OSNABRUECK'), WD('9.8', 'Osnabrück') + .1, .7),
 # finale network
 (('p', 'PRAHA'), ('p', 'MAGDEBURG'), WD('10.9', 'Magdeburg'), .9),
 (('p', 'MAGDEBURG'), ('p', 'BREITENFELD'), WD('10.10', 'Swedia') - .4, .8),
 (('p', 'BREITENFELD'), ('p', 'LUETZEN'), WD('10.10', 'Swedia'), .6),
 (('c', '26', .3, .7), ('p', 'HRE'), WD('10.11', 'Prancis'), .9),
 (('p', 'LUETZEN'), ('p', 'MUENSTER'), WD('10.11', 'Katolik'), .9),
]
ELLS = [  # centre, rx, ry (world), t0, dur
 (('p', 'BOHEMIA'), 520, 380, WD('1.6', 'Bohemia'), .5),
 (('p', 'BOHEMIA'), 520, 380, WD('2.8', 'Bohemia'), .5),
 (('c', '07', .55, .35), 150, 110, WD('3.1', 'Kastel'), .45),
 (('p', 'MAGDEBURG'), 170, 130, WD('5.3', 'Magdeburg'), .45),
 (('c', '19', .62, .45), 180, 120, WD('5.4', 'posisi'), .45),
 (('p', 'BREITENFELD'), 120, 90, WD('6.6', 'Breitenfeld'), .4),
 (('p', 'LUETZEN'), 120, 90, WD('6.12', 'Lützen'), .4),
 (('c', '26', .55, .2), 130, 80, WD('6.3', 'Baltik'), .45),
 (('c', '26', .28, .75), 180, 130, WD('7.3', 'Prancis'), .45),
 (('p', 'MUENSTER'), 120, 90, P('9.2') + .3, .4),
 (('c', '36', .25, .6), 90, 110, WD('9.12', 'Prancis'), .4),
 (('c', '36', .55, .12), 90, 70, WD('9.12', 'Swedia'), .4),
 (('p', 'PRAHA'), 150, 110, WD('10.8', 'Praha'), .45),
 (('p', 'MAGDEBURG'), 170, 130, WD('10.9', 'Magdeburg'), .45),
 (('p', 'LUETZEN'), 160, 130, WD('10.10', 'Swedia'), .45),
]
STAMPS = [  # text, anchor, rot, t
 ('KALAH', ('c', '11', .5, .5), -12, WD('4.10', 'kekalahan')),
 ('GUGUR', ('c', '20', .45, .7), 10, P('6.15') + .9),
 ('DAMAI', ('c', '35', .6, .6), -8, WD('9.9', 'Westphalia')),
]
YEARS = [  # t, small line, big line, hold
 (WD('2.1', 'awal') - .3, 'KEMBALI KE AWAL', 'ABAD KE-17', 3.2),
 (P('3.1') + .1, '23 MEI', '1618', 2.6),
 (WD('4.8', '8') - .2, '8 NOVEMBER', '1620', 2.6),
 (P('5.1') + .05, 'TAHUN', '1631', 1.8),
 (WD('5.9', '20') - .2, '20 MEI', '1631', 2.4),
 (WD('6.6', '17') - .2, '17 SEPTEMBER', '1631', 2.4),
 (WD('6.12', '16') - .2, '16 NOVEMBER', '1632', 2.4),
 (WD('7.2', '1635') - .4, 'PRANCIS MASUK PERANG', '1635', 2.6),
 (P('9.1') + .05, 'NEGOSIASI DIMULAI', '1643', 2.2),
 (WD('9.8', '24') - .2, '24 OKTOBER', '1648', 2.4),
 (WD('10.1', '1648') - .5, 'PERANG BERAKHIR', '1648', 2.4),
]
TITLE = (P('1.8') - .1, P('1.9') + 2.2)                  # opening title card
COUNTER = (WD('5.15', '20.000') - .3, P('5.16') - .2)    # casualty estimate
THESIS = [  # mono line, serif answer, t_start, t_strike, t_answer, t_end
 ('PERANG AGAMA?', 'POLITIK', P('7.5') + .2, P('7.6') + .1, WD('7.6', 'politik') - .2, P('7.7') + .3),
 ('KEJAYAAN · KEHORMATAN · KEMENANGAN', 'MANUSIA BIASA', P('10.13') + .3, P('10.14') + .2, WD('10.14', 'manusia') - .2, P('10.15') - .1),
]
END = P('10.17') + .2

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
CHAIN = []
def build_chain():
    order = sorted((c for c in CARDS if CARDS[c]['t0'] < 1e8), key=lambda c: CARDS[c]['t0'])
    for a, b in zip(order, order[1:]): CHAIN.append((a, b, CARDS[b]['t0'] + .25))

def pin(code): return card_pt(code, .5, .035)

def draw_strings_under(frame, t, C):
    """Red strings between photos, drawn in front of the cards (pins go on top in the overlay pass)."""
    zl = max(.4, min(1.4, C[2]*3))
    for a, b, t0 in CHAIN:
        if t < t0: continue
        u = ease((t - t0) / .8)
        pa, pb = to_screen(pin(a), C), to_screen(pin(b), C)
        L = math.dist(pa, pb)
        if L < 2: continue
        sag = min(90, L*.08); n = int(24*u) + 1
        pts = np.array([(pa[0] + (pb[0]-pa[0])*(i/24), pa[1] + (pb[1]-pa[1])*(i/24) + sag*4*(i/24)*(1-i/24)) for i in range(n)])
        if len(pts) < 2: continue
        cv2.polylines(frame, [(pts + (3, 5)).astype(np.int32)], False, (14, 14, 40), max(3, int(5*zl)), cv2.LINE_AA)
        cv2.polylines(frame, [pts.astype(np.int32)], False, (45, 49, 208), max(2, int(3*zl)), cv2.LINE_AA)

def draw_chain(d, t, C):
    zl = max(.4, min(1.4, C[2]*3))
    for a, b, t0 in []:
        if t < t0: continue
        u = ease((t - t0) / .8)
        pa, pb = to_screen(pin(a), C), to_screen(pin(b), C)
        L = math.dist(pa, pb)
        if L < 2: continue
        sag = min(90, L*.08)
        pts = []
        for i in range(int(24*u) + 1):
            v = i / 24
            pts.append((pa[0] + (pb[0]-pa[0])*v, pa[1] + (pb[1]-pa[1])*v + sag*4*v*(1-v)))
        if len(pts) > 1:
            d.line(pts, fill=(120, 20, 18, 120), width=max(3, int(5*zl)))         # shadow
            d.line([(x-2, y-3) for x, y in pts], fill=RED+(215,), width=max(2, int(3*zl)))
    for code, cd in CARDS.items():                                                # pins
        if t < cd['t0'] + .35: continue
        p = to_screen(pin(code), C); r = max(4, 9*zl)
        if -20 < p[0] < W+20 and -20 < p[1] < H+20:
            d.ellipse([p[0]-r+2, p[1]-r+4, p[0]+r+2, p[1]+r+4], fill=(0, 0, 0, 110))
            d.ellipse([p[0]-r, p[1]-r, p[0]+r, p[1]+r], fill=RED+(255,))
            d.ellipse([p[0]-r*.4, p[1]-r*.55, p[0]+r*.05, p[1]-r*.1], fill=(255, 190, 180, 200))

def draw_overlays(img, t, C):
    global FM
    FM = FM or font(MONO, 30)
    pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)); d = ImageDraw.Draw(pil, 'RGBA')
    draw_chain(d, t, C)
    z = C[2]; zl = max(.35, min(1.6, z*3))
    fin = t > FINALE
    for c, rx, ry, t0, du in ELLS:
        if t < t0: continue
        life = 1 - ss((t - t0 - 12) / .6) if not fin or t0 < FINALE else 1
        if fin: life = max(life, ss((t-FINALE)/.8) * .9)
        if life <= 0: continue
        pts = wobble_ellipse(A(c), rx, ry, clamp((t-t0)/du), C, seed=t0)
        d.line(pts, fill=RED+(int(240*life),), width=max(3, int(5*zl)), joint='curve')
    for A_, B_, t0, du in LINES:
        if t < t0: continue
        life = 1 - ss((t - t0 - 14) / .6)
        if fin: life = max(life, ss((t-FINALE)/.8) * .9)
        if life <= 0: continue
        u = ease((t-t0)/du); a = to_screen(A(A_), C); b0 = to_screen(A(B_), C)
        b = (a[0]+(b0[0]-a[0])*u, a[1]+(b0[1]-a[1])*u + math.sin(u*math.pi)*25*zl)
        al = int(230*life)
        d.line([a, b], fill=RED+(al,), width=max(2, int(4*zl)))
        for p in (a, b): d.ellipse([p[0]-7, p[1]-7, p[0]+7, p[1]+7], fill=RED+(al,))
    for anchor, txt, t0, off in TAGS:
        if t < t0: continue
        life = 1 - ss((t-t0-7)/.5)
        if fin and txt in FINAL_TAGS and anchor[0] != 'c' or (fin and txt in FINAL_TAGS and anchor[1] == '26'):
            life = max(life, ss((t-FINALE)/.6))
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
    for bg_ in BAG[1:]:
        c0, c1 = bg_['card'], bg_['hold']
        if c0 - .01 <= t < c1 + .3:
            a = (ss((t-c0)/.4) if bg_['n'] > 1 else 1) * (1-ss((t-c1+.2)/.5))
            out *= 1 - .62*a
            pil = pil_of(out); d = ImageDraw.Draw(pil, 'RGBA'); al = int(255*a)
            title = bg_['title']; main, sub = (title.split(':', 1) + [''])[:2]      # title only, no "BAGIAN N" label
            if t > c0 + .2:
                a2 = int(al*ss((t-c0-.2)/.5))
                fs = 120 if len(main) < 18 else 96 if len(main) < 26 else 78
                text_center(d, 430, main.strip(), font(SERIF, fs), (242, 238, 228, a2))
                u = ease((t-c0-.6)/.6); x0 = W/2 - 300
                d.line([(x0, 600), (x0 + 600*u, 600)], fill=RED+(a2,), width=6)
                if sub.strip():
                    text_center(d, 630, sub.strip(), font(MONO, 38), (215, 210, 196, int(a2*ss((t-c0-.9)/.5))))
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
            if big.isdigit():
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
        s1 = 'PERANG TIGA PULUH TAHUN'; n = min(len(s1), int(max(0, t-TITLE[0]-.2)*20))
        text_center(d, 330, s1[:n] + ('_' if n < len(s1) else ''), font(MONO, 54), (225, 225, 215, al))
        if t > TITLE[0] + 1.0:
            a2 = int(255*a*ss((t-TITLE[0]-1.0)/.4))
            text_center(d, 420, '1618 – 1648', font(SERIF, 170), (242, 238, 228, a2))
            u = ease((t-TITLE[0]-1.4)/.5); x0 = W/2 - 330
            d.line([(x0, 640), (x0 + 660*u, 640)], fill=RED+(a2,), width=6)
        return back(pil)
    if COUNTER[0] < t < COUNTER[1]:
        a = ss((t-COUNTER[0])/.35) * (1-ss((t-COUNTER[1]+.4)/.4))
        out *= 1 - .6*a
        pil = pil_of(out); d = ImageDraw.Draw(pil, 'RGBA'); al = int(255*a)
        u = ease((t-COUNTER[0]-.2)/1.6)
        lo, hi = int(20000*u) // 10 * 10, int(25000*u) // 10 * 10
        text_center(d, 330, 'PERKIRAAN KORBAN JIWA', font(MONO, 44), (220, 220, 210, al))
        text_center(d, 420, f'{lo:,}–{hi:,}'.replace(',', '.'), font(SERIF, 160), RED+(al,))
        if t > COUNTER[0] + 2.0:
            text_center(d, 640, 'angka pastinya masih diperdebatkan', font(MONO, 32), (200, 200, 190, int(al*ss((t-COUNTER[0]-2)/.4))))
        return back(pil)
    for s1, s2, ta, tstrike, tans, tb in THESIS:
        if ta < t < tb:
            a = ss((t-ta)/.5) * (1-ss((t-tb+.5)/.5))
            out *= 1 - .6*a
            pil = pil_of(out); d = ImageDraw.Draw(pil, 'RGBA'); al = int(255*a)
            f1 = font(MONO, 50 if len(s1) < 20 else 40); n = min(len(s1), int(max(0, t-ta-.3)*18))
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
        text_center(d, 400, 'PERANG TIGA PULUH TAHUN', font(SERIF, 118), RED+(int(255*a),))
        text_center(d, 580, '1618 – 1648', font(MONO, 46), (220, 220, 212, int(255*a)))
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
            hb = next((b_['hold'] for b_ in BAG[1:] if b_['start'] - .01 <= a < b_['hold']), None)
            CARDS[spec[1]]['t0'] = min(CARDS[spec[1]]['t0'], (hb + .6) if hb else a + .25)
    for c in CARDS.values(): c['t0'] = min(c['t0'], FINALE + .5)   # everything is on the board for the finale
    build_chain()
    stamps = [(make_stamp(s), A(an), rot, t) for s, an, rot, t in STAMPS]
    return build_bg(), stamps

SHAKES = [s[3] for s in STAMPS]

def board_frame(t, fi, bg, stamps, vig, grains):
    C = list(cam(t))
    for st in SHAKES:
        if st < t < st+.35:
            k = (1-(t-st)/.35)*14; C[0] += k*math.sin(t*90)/C[2]; C[1] += k*math.cos(t*77)/C[2]
    frame = cv2.warpAffine(bg, world_M(C, BGS), (W, H), flags=cv2.INTER_LINEAR, borderValue=(38, 38, 24)).astype(np.float32)
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
    draw_strings_under(frame, t, C)   # strings over the photos
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
    import defenestrasi as V
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
        if INS0 <= t < INS1: fr = V.frame(t, fi, INS0, INS1)
        else: fr = board_frame(t, fi, bg, stamps, vig, grains)
        if ff: ff.stdin.write(fr.tobytes())
        else: cv2.imwrite(os.path.join(out, f'{t:07.2f}.jpg'), fr, [cv2.IMWRITE_JPEG_QUALITY, 88])
    if ff: ff.stdin.close(); ff.wait()

def overview(path):
    bg, stamps = setup()
    small = cv2.resize(bg, (WW//10, WH//10)).astype(np.float32)
    C = (WW/2, WH/2, .1, 0)
    for code, cd in CARDS.items():
        M = card_M(cd, cd['small'], (WW/2, WH/2, .1, 0), 1, 0, R/4)
        M[0, 2] += WW/20 - W/2; M[1, 2] += WH/20 - H/2
        w = cv2.warpAffine(cd['small'], M, (WW//10, WH//10), borderValue=(0, 0, 0, 0))
        a = w[..., 3:4] / 255; small = small*(1-a) + w[..., :3]*a
    o = np.clip(small, 0, 255).astype(np.uint8)
    for k, p in PL.items():
        cv2.circle(o, (int(p[0]/10), int(p[1]/10)), 6, (45, 49, 208), -1); cv2.putText(o, k, (int(p[0]/10)+8, int(p[1]/10)), 0, .45, (255, 255, 255), 1)
    for code in CARDS: cv2.putText(o, code, (int(LAYOUT[code][0]/10)-10, int(LAYOUT[code][1]/10)), 0, .8, (0, 255, 255), 2)
    cv2.imwrite(path, o)

if __name__ == '__main__':
    sys.path.insert(0, HERE)
    mode = sys.argv[1]
    if mode == 'stills':
        render([int(float(x)*FPS) for x in sys.argv[2].split(',')], os.path.join(HERE, 'stills') + '/')
    elif mode == 'overview':
        overview(os.path.join(HERE, 'overview.jpg'))
    else:
        render(range(int(sys.argv[2]), int(sys.argv[3])), sys.argv[4])
