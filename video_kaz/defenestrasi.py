"""Vintage 2D silent-film insert: Defenestrasi Praha (23 Mei 1618).
Adapted from the kaz-documentary skill's vintage_engine.py: same film treatment, twos, boiling lines, iris wipes,
red-only accent. Non-graphic: the three officials fall onto a soft heap, get up and run off."""
import os, json, math
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1920, 1080
MONO = '/usr/share/fonts/truetype/freefont/FreeMonoBold.ttf'
SERIF = '/usr/share/fonts/truetype/crosextra/Caladea-Bold.ttf'
INK = (52, 38, 26); PAPER = (226, 208, 172); MID = (150, 124, 92); DARK = (88, 66, 46); RED = (178, 40, 32)
_TM = {f"{d['bagian']}.{d['para']}": d['start'] for d in json.load(open(os.path.join(HERE, 'timing_gap.json'), encoding='utf-8'))['paras']}
T_WIN, T_THROW, T_16, T_SAFE, T_TITLE = _TM['3.5'], _TM['3.6'], _TM['3.7'], _TM['3.8'], _TM['3.9']

def F(p, s): return ImageFont.truetype(p, int(s))
def cl(x, a=0, b=1): return max(a, min(b, x))
def ease(x): x = cl(x); return x*x*(3-2*x)
def J(t, k, a=2.0):
    q = int(t*12); r = np.random.default_rng(q*97 + k); return r.uniform(-a, a)
def wline(d, pts, t, k, fill=INK, w=5):
    d.line([(x+J(t, k+i), y+J(t, k+i+50)) for i, (x, y) in enumerate(pts)], fill=fill, width=w, joint='curve')
def wpoly(d, pts, t, k, fill, outline=INK, w=4):
    pts = [(x+J(t, k+i, 1.5), y+J(t, k+i+50, 1.5)) for i, (x, y) in enumerate(pts)]
    d.polygon(pts, fill=fill); d.line(pts+[pts[0]], fill=outline, width=w)

# ------------------------------------------------ figures (drawn upright into a sprite, rotated when falling)
COLS = [(60, 46, 34), (96, 74, 52), (40, 30, 22)]
def sprite(k, t, run=0.0):
    s = Image.new('RGBA', (220, 360), (0, 0, 0, 0)); d = ImageDraw.Draw(s)
    x, y, col = 110, 250, COLS[k]
    wpoly(d, [(x-36, y), (x+36, y), (x+30, y-150), (x-30, y-150)], t, 900+k*40, col, INK, 3)          # long coat
    d.ellipse([x-24, y-205, x+24, y-152], fill=(196, 170, 136), outline=INK, width=3)                # face
    d.ellipse([x-46, y-222, x+46, y-196], fill=INK); d.rectangle([x-24, y-246, x+24, y-206], fill=INK)  # hat
    d.ellipse([x-30, y-160, x+30, y-140], fill=(232, 222, 200), outline=INK, width=2)                # ruff collar
    sw = math.sin(run*14)*24 if run else 0
    wline(d, [(x-14, y), (x-14-sw, y+95)], t, 920+k, col, 16); wline(d, [(x+14, y), (x+14+sw, y+95)], t, 930+k, col, 16)
    wline(d, [(x-30, y-130), (x-58+sw, y-60)], t, 940+k, col, 14); wline(d, [(x+30, y-130), (x+58-sw, y-60)], t, 950+k, col, 14)
    return s

def paste_fig(im, k, t, cx, cy, ang=0.0, run=0.0, scale=1.0):
    sp = sprite(k, t, run)
    if scale != 1: sp = sp.resize((int(220*scale), int(360*scale)))
    sp = sp.rotate(ang, expand=True, resample=Image.BICUBIC)
    im.paste(sp, (int(cx - sp.width/2), int(cy - sp.height/2)), sp)

# ------------------------------------------------ scene: castle facade, side view
WALL = (380, 1180); TOP = 160; GROUND = 930; WIN = (720, 210, 880, 400)   # window box
HEAP = [(640, GROUND), (700, GROUND-50), (820, GROUND-72), (960, GROUND-55), (1040, GROUND)]
LAND = [(760, GROUND-80), (850, GROUND-92), (950, GROUND-78)]
FALL_T = [T_THROW + .55 + .85*i for i in range(3)]
FALL_D = .62

def facade(t):
    im = Image.new('RGB', (W, H), PAPER); d = ImageDraw.Draw(im)
    for i in range(0, GROUND, 8): d.rectangle([0, i, W, i+8], fill=tuple(int(c*(0.93+0.07*i/GROUND)) for c in PAPER))
    # distant city spires (right)
    for i, x in enumerate(range(1300, 1920, 110)):
        h = 260 + (i*73) % 180
        wpoly(d, [(x, GROUND-60), (x+70, GROUND-60), (x+70, GROUND-h), (x+35, GROUND-h-90), (x, GROUND-h)], t, 200+i*9, (196, 176, 140), DARK, 3)
    # castle wall
    wpoly(d, [(WALL[0], GROUND), (WALL[1], GROUND), (WALL[1], TOP), (WALL[0], TOP)], t, 10, (205, 184, 146), INK, 5)
    for r in range(4):                                   # stone courses
        y = TOP + 160 + r*190; wline(d, [(WALL[0], y), (WALL[1], y)], t, 20+r, DARK, 2)
    wpoly(d, [(WALL[0]-30, TOP), (WALL[1]+30, TOP), (WALL[1]-120, TOP-95), (WALL[0]+120, TOP-95)], t, 40, (120, 92, 66), INK, 4)  # roof
    wpoly(d, [(WALL[1]-170, TOP-95), (WALL[1]-90, TOP-95), (WALL[1]-90, TOP-230), (WALL[1]-130, TOP-300), (WALL[1]-170, TOP-230)], t, 45, (205, 184, 146), INK, 4)
    wline(d, [(WALL[1]-130, TOP-300), (WALL[1]-130, TOP-340)], t, 47, INK, 4)
    for (x0, y0) in ((450, 520), (980, 520), (450, 250), (980, 250), (720, 560)):
        wpoly(d, [(x0, y0), (x0+110, y0), (x0+110, y0+150), (x0, y0+150)], t, x0+y0, (98, 76, 54), INK, 3)
    # the window
    x0, y0, x1, y1 = WIN
    wpoly(d, [(x0, y0), (x1, y0), (x1, y1), (x0, y1)], t, 70, (40, 30, 22), INK, 6)
    wline(d, [(x0-14, y1+10), (x1+14, y1+10)], t, 80, INK, 12)
    # heap (straw / refuse) at the foot of the wall
    wpoly(d, HEAP, t, 90, (170, 146, 104), INK, 4)
    for k in range(9): wline(d, [(680+k*40, GROUND-20), (700+k*40, GROUND-48)], t, 100+k, DARK, 3)
    d.rectangle([0, GROUND, W, H], fill=(186, 164, 126)); d.line([(0, GROUND), (W, GROUND)], fill=INK, width=5)
    d.text((70, 965), 'KASTEL PRAHA  ·  23 MEI 1618', font=F(SERIF, 52), fill=INK)
    return im, d

def scene(t):
    im, d = facade(t)
    x0, y0, x1, y1 = WIN; cx = (x0+x1)/2
    # 3.5 — the three officials are brought to the window (heads appear one by one, angry nobles behind)
    if t < FALL_T[2] + .1:
        shown = [i for i in range(3) if t > T_WIN + .5 + .8*i and t < FALL_T[i]]
        for j, i in enumerate(shown):
            hx = x0 + 35 + 45*j + J(t, i)
            d.ellipse([hx-20, y1-110, hx+20, y1-70], fill=(196, 170, 136), outline=INK, width=3)
            d.ellipse([hx-32, y1-122, hx+32, y1-102], fill=INK); d.rectangle([hx-28, y1-70, hx+28, y1-8], fill=COLS[i])
        if t > T_WIN + 1.6 and t < T_16:                 # pushing arms of the nobles
            for k in range(2): wline(d, [(x0+20, y1-40-k*30), (x0+70+15*math.sin(t*6+k), y1-55-k*30)], t, 300+k, INK, 10)
        if T_WIN + .4 < t < T_THROW + .3:
            s = 'TIGA PEJABAT KATOLIK'[:int((t-T_WIN-.4)*20)]
            d.text((x1 + 60, y0 + 10), s, font=F(MONO, 30), fill=RED)
            d.line([(x1 + 10, y0 + 60), (x1 + 55, y0 + 30)], fill=RED, width=4)
    # 3.6 — thrown out: each falls (accelerating, tumbling) onto the heap
    for i in range(3):
        tf = FALL_T[i]
        if t < tf: continue
        u = cl((t - tf) / FALL_D)
        lx, ly = LAND[i]
        if u < 1:
            x = cx + (lx - cx) * u + 40*math.sin(u*math.pi); y = y1 - 40 + (ly - (y1 - 40)) * u*u
            paste_fig(im, i, t, x, y, ang=-200*u - 30*i, scale=.9)
        else:
            tr = t - (T_SAFE + .3 + .35*i)              # 3.8 — they get up and run off to the right
            if tr < 0: paste_fig(im, i, t, lx, ly + 10, ang=-90 if i != 1 else 90, scale=.9)
            elif tr < .4: paste_fig(im, i, t, lx, ly - 20*ease(tr/.4), ang=(-90 if i != 1 else 90)*(1-ease(tr/.4)), scale=.9)
            else:
                rx = lx + 520*(tr-.4); paste_fig(im, i, t, rx, ly - 30, ang=-8, run=tr, scale=.9)
            if 0 <= u and t - (tf + FALL_D) < .9:        # dust puff on landing
                st = t - (tf + FALL_D)
                for k in range(5):
                    r = 16 + st*90 + k*6; ox = lx - 60 + k*30; oy = ly + 20 - st*40
                    if st < .9: d.ellipse([ox-r, oy-r, ox+r, oy+r], outline=DARK, width=3)
    # 3.7 — "± 16 M" measurement
    if t > T_16 + .1:
        u = ease((t - T_16 - .1) / .6); xm = WALL[1] + 70; ya, yb = y1 + 10, GROUND
        wline(d, [(xm, ya), (xm, ya + (yb - ya)*u)], t, 500, RED, 7)
        for y in (ya, ya + (yb-ya)*u): d.line([(xm-26, y), (xm+26, y)], fill=RED, width=7)
        d.polygon([(xm, ya-6), (xm-16, ya+24), (xm+16, ya+24)], fill=RED)
        if u > .95: d.polygon([(xm, yb+4), (xm-16, yb-26), (xm+16, yb-26)], fill=RED)
        d.text((xm + 50, (ya+yb)/2 - 40), '± 16 M'[:int((t - T_16 - .5)*14)], font=F(SERIF, 84), fill=RED)
    if t > T_SAFE + .2:
        d.text((1280, 820), 'KETIGANYA SELAMAT'[:int((t - T_SAFE - .2)*22)], font=F(MONO, 36), fill=INK)
    return im

def intertitle(t):
    im = Image.new('RGB', (W, H), (18, 14, 10)); d = ImageDraw.Draw(im)
    d.rectangle([180, 140, W-180, H-140], outline=(200, 180, 140), width=4)
    d.rectangle([200, 160, W-200, H-160], outline=(200, 180, 140), width=1)
    for (x, y) in ((200, 160), (W-200, 160), (200, H-160), (W-200, H-160)): d.ellipse([x-12, y-12, x+12, y+12], fill=RED)
    for s, y, ff in (('Defenestrasi Praha', 360, F(SERIF, 116)), ('23 Mei 1618', 560, F(SERIF, 72)),
                     ('Tiga pejabat dilempar dari jendela kastel', 680, F(SERIF, 46))):
        w = ff.getbbox(s)[2]; d.text(((W-w)/2, y), s, font=ff, fill=(232, 218, 190))
    d.line([(W/2-180, 530), (W/2+180, 530)], fill=RED, width=4)
    return im

yy, xx = np.ogrid[:H, :W]
VIG = (1 - .62*np.clip(((xx-W/2)/(W*.58))**2 + ((yy-H/2)/(H*.58))**2, 0, 1))[..., None].astype(np.float32)
def film(img, fi):
    a = np.asarray(img).astype(np.float32)
    g = a.mean(axis=2, keepdims=True); sep = np.concatenate([g*1.07, g*.95, g*.78], 2)
    redmask = ((a[..., 0] > a[..., 1]*1.6) & (a[..., 0] > 120))[..., None]
    a = np.where(redmask, a, sep*.85 + a*.15)
    r = np.random.default_rng(fi)
    a *= 0.93 + 0.07*r.random()
    a = a*VIG + r.normal(0, 13, (H, W, 1))
    out = np.clip(a, 0, 255).astype(np.uint8)
    for _ in range(r.integers(0, 3)):
        x = int(r.integers(0, W)); cv2.line(out, (x, 0), (x+int(r.integers(-20, 20)), H), (235, 225, 200) if r.random() < .6 else (40, 30, 20), 1)
    for _ in range(r.integers(2, 8)):
        cv2.circle(out, (int(r.integers(0, W)), int(r.integers(0, H))), int(r.integers(1, 4)), (25, 18, 12), -1)
    M = np.float32([[1, 0, r.normal(0, 1.5)], [0, 1, r.normal(0, 2.0)]])
    return cv2.warpAffine(out, M, (W, H), borderMode=cv2.BORDER_REFLECT)

def iris(o, r):
    m = ((xx-W/2)**2 + (yy-H/2)**2 <= r*r).astype(np.float32)
    m = cv2.GaussianBlur(m, (0, 0), 6)[..., None]
    return (o*m).astype(np.uint8)

def frame(t, fi, T0, T1):
    falling = any(ft <= t < ft + FALL_D + .15 for ft in FALL_T)
    tq = t if falling else math.floor(t*12)/12            # animate on twos, full rate during the falls
    img = scene(tq) if t < T_TITLE else intertitle(tq)
    out = film(img, fi)
    st = t - (FALL_T[0] + FALL_D)                         # first landing: flash + frame jump
    if 0 <= st < .2:
        k = 1 - st/.2; out = np.clip(out.astype(np.float32) + 150*k, 0, 255).astype(np.uint8); out = np.roll(out, int(12*k), axis=0)
    full = math.hypot(W/2, H/2)
    if t < T0 + .6: out = iris(out, full*ease((t-T0)/.6))
    if T_TITLE - .25 < t < T_TITLE: out = iris(out, full*(1-ease((t-(T_TITLE-.25))/.25)))
    if T_TITLE <= t < T_TITLE + .3: out = iris(out, full*ease((t-T_TITLE)/.3))
    if t > T1 - .45: out = iris(out, full*(1-ease((t-(T1-.45))/.45)))
    return cv2.cvtColor(out, cv2.COLOR_RGB2BGR)
