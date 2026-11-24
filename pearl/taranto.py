"""Vintage 2D silent-film insert: Swordfish biplanes from HMS Illustrious attack the Italian fleet at Taranto (Nov 1940).
Built on the kaz-documentary vintage engine (boiling lines on twos, sepia, grain, scratches, gate weave, iris wipes).
  python3 pearl/taranto.py stills 316.5,318,320,321,322.5,324    -> stills/v_*.jpg
  python3 pearl/taranto.py full parts/taranto.mp4                -> the insert, frames TARANTO t0..t1"""
import os, sys, math, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kazph as K

W, H, FPS = 1920, 1080, 30
TT = K.TARANTO; T0, S2, S3, T1 = TT['t0'], TT['s2'], TT['s3'], TT['t1']
MONO = "/usr/share/fonts/truetype/freefont/FreeMonoBold.ttf"
SERIF = "/usr/share/fonts/truetype/crosextra/Caladea-Bold.ttf"
INK = (52, 38, 26); PAPER = (226, 208, 172); MID = (150, 124, 92); DARK = (88, 66, 46); RED = (178, 40, 32)
NIGHT = (70, 56, 42); SEA = (118, 98, 74); FOAM = (236, 226, 206)
def F(p, s): return ImageFont.truetype(p, int(s))
def cl(x, a=0, b=1): return max(a, min(b, x))
def ease(x): x = cl(x); return x*x*(3-2*x)
def J(t, k, a=2.0):  # boiling-line jitter, changes on twos (12 fps)
    q = int(t*12); r = np.random.default_rng(q*97 + k); return r.uniform(-a, a)
def wline(d, pts, t, k, fill=INK, w=5):
    pts = [(x+J(t, k+i), y+J(t, k+i+50)) for i, (x, y) in enumerate(pts)]
    d.line(pts, fill=fill, width=w, joint="curve")
def wpoly(d, pts, t, k, fill, outline=INK, w=4):
    pts = [(x+J(t, k+i, 1.5), y+J(t, k+i+50, 1.5)) for i, (x, y) in enumerate(pts)]
    d.polygon(pts, fill=fill); d.line(pts+[pts[0]], fill=outline, width=w)
def xf(pts, x, y, s, ang):
    c, si = math.cos(ang), math.sin(ang)
    return [(x + s*(px*c - py*si), y + s*(px*si + py*c)) for px, py in pts]
def typed(d, xy, s, t0, t, f, fill=INK, cps=24):
    n = int((t - t0)*cps)
    if n > 0: d.text(xy, s[:n] + ('_' if n < len(s) else ''), font=f, fill=fill)

# ---------------- drawing kit ----------------
def biplane(d, x, y, t, k, s=1.0, ang=0.0, torpedo=True):
    """Old torpedo biplane, side view facing right (open cockpits, fabric wings, fixed wheels)."""
    P = lambda pts: xf(pts, x, y, s, ang)
    w = max(2, int(4*s))
    wpoly(d, P([(-80, -24), (-60, -40), (0, -38), (0, -30), (-70, -22)]), t, k, DARK, INK, w)          # upper wing (perspective)
    wpoly(d, P([(-130, -6), (70, -14), (100, -8), (100, 8), (70, 12), (-130, 2)]), t, k+10, (120, 98, 72), INK, w)
    wpoly(d, P([(-128, -6), (-152, -42), (-122, -42), (-100, -8)]), t, k+20, (120, 98, 72), INK, w)  # fin
    wline(d, P([(-160, -2), (-104, -2)]), t, k+30, INK, int(7*s))                                      # tailplane
    wline(d, P([(-40, -56), (60, -56)]), t, k+40, INK, int(11*s))                                       # upper wing
    wline(d, P([(-30, 14), (60, 14)]), t, k+50, INK, int(9*s))                                          # lower wing
    for a, b in (((-10, -56), (-4, 14)), ((40, -56), (46, 14))): wline(d, P([a, b]), t, k+60+a[0], INK, max(2, int(3*s)))
    wline(d, P([(-34, -14), (-26, -26), (-14, -26)]), t, k+70, INK, max(2, int(3*s)))                   # cockpit rim
    cx, cy = P([(100, 0)])[0]; r = 15*s; d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=INK)                 # engine
    blade = (int(t*30) % 2) * 6
    wline(d, P([(110, -44 + blade), (110, 44 - blade)]), t, k+80, (176, 156, 124), max(2, int(5*s)))   # spinning prop
    for gx in (30, 56): wline(d, P([(gx, 12), (44, 40)]), t, k+90+gx, INK, max(2, int(3*s)))
    wx, wy = P([(44, 44)])[0]; r = 11*s; d.ellipse([wx-r, wy-r, wx+r, wy+r], fill=INK)
    if torpedo:
        wline(d, P([(-10, 26), (74, 26)]), t, k+95, (70, 54, 38), int(9*s))

def battleship(d, x, y, t, k, s=1.0, ang=0.0, col=(104, 84, 62)):
    """Battleship side view, waterline at (x, y), bow to the left."""
    P = lambda pts: xf(pts, x, y, s, ang)
    wpoly(d, P([(-290, -40), (-240, -34), (250, -34), (270, -40), (250, 8), (-250, 8)]), t, k, col, INK, 4)
    wpoly(d, P([(-80, -34), (-70, -96), (60, -96), (70, -34)]), t, k+10, (130, 106, 80), INK, 3)
    wpoly(d, P([(-40, -96), (-30, -150), (20, -150), (26, -96)]), t, k+20, (130, 106, 80), INK, 3)
    wline(d, P([(-6, -150), (-6, -230)]), t, k+30, INK, 4); wline(d, P([(-30, -205), (18, -205)]), t, k+31, INK, 3)
    wpoly(d, P([(80, -34), (84, -112), (112, -112), (114, -34)]), t, k+40, (84, 66, 48), INK, 3)       # funnel
    for tx, dr in ((-210, -1), (-140, -1), (150, 1), (215, 1)):                                          # turrets + guns
        wpoly(d, P([(tx-26, -34), (tx-22, -56), (tx+22, -56), (tx+26, -34)]), t, k+50+tx, (84, 66, 48), INK, 3)
        wline(d, P([(tx, -48), (tx + dr*70, -54)]), t, k+60+tx, INK, 5)

def sea(d, t, top, k):
    d.rectangle([0, top, W, H], fill=SEA)
    for i, yy in enumerate(range(top+30, H, 46)):
        ph = (i % 2) * 70
        for x0 in range(-120 + ph, W, 240):
            wline(d, [(x0, yy), (x0+40, yy-6), (x0+80, yy)], t, k+i*37+x0, (96, 78, 58), 3)

def night_sky(d, top):
    for i in range(0, top, 6): d.rectangle([0, i, W, i+6], fill=tuple(int(a + (b-a)*i/top) for a, b in zip(NIGHT, (150, 126, 96))))

def moon(d, x, y, r): d.ellipse([x-r, y-r, x+r, y+r], fill=(236, 222, 190)); d.ellipse([x-r+18, y-r-6, x+r+18, y+r-6], fill=NIGHT)

def smoke(d, x, y, age, k, big=1.0):
    if age < 0: return
    r0 = np.random.default_rng(k)
    for j in range(9):
        dx, dy, rr = r0.uniform(-40, 40), r0.uniform(0, 1), r0.uniform(.7, 1.2)
        r = (14 + age*30 + j*4) * rr * big; ox = x + dx*big + age*45 + j*6; oy = y - (j*22 + dy*20)*big - age*60
        a = cl(1 - age/4)
        if a > 0: d.ellipse([ox-r, oy-r, ox+r, oy+r], fill=(136, 118, 94) if j % 3 else (112, 94, 72), outline=(96, 78, 58), width=2)

def splash(d, x, y, age):
    if not 0 <= age < 1.4: return
    k = math.sin(min(age/1.4, 1)*math.pi)**.7
    for dx, hh, ww in ((-38, 210, 22), (0, 300, 30), (40, 240, 24), (-70, 120, 18), (72, 140, 18)):
        h = hh*k; d.polygon([(x+dx-ww, y), (x+dx-ww*.4, y-h*.85), (x+dx, y-h), (x+dx+ww*.4, y-h*.85), (x+dx+ww, y)], fill=FOAM)
    for j in range(8):
        a = -math.pi/2 + (j-3.5)*.25; rr = 120*k + 40*age
        px, py = x + rr*math.cos(a)*1.3, y - 260*k + rr*math.sin(a)*.3 + 90*age*age
        d.ellipse([px-7, py-7, px+7, py+7], fill=FOAM)

def wobble_circle(d, cx, cy, rx, ry, frac, t, k):
    pts = []
    for i in range(int(90*frac)+2):
        th = -1.9 + 2*math.pi*1.06*i/90
        pts.append((cx + rx*math.cos(th) + J(t, k+i, 3), cy + ry*math.sin(th) + J(t, k+i+9, 3)))
    d.line(pts, fill=RED, width=8, joint="curve")

# ---------------- scene 1: launch from the carrier ----------------
def carrier_scene(t):
    lt = t - T0
    im = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(im)
    night_sky(d, 700); moon(d, 1580, 190, 70)
    for i in range(40):  # stars
        r = np.random.default_rng(i); sx, sy = r.integers(0, W), r.integers(20, 520)
        if (int(t*12) + i) % 7: d.ellipse([sx-2, sy-2, sx+2, sy+2], fill=(226, 212, 180))
    sea(d, t, 700, 100)
    # carrier hull, flight deck and island
    wpoly(d, [(60, 640), (1330, 640), (1260, 760), (150, 760)], t, 200, (98, 78, 58), INK, 5)
    wpoly(d, [(30, 618), (1380, 618), (1380, 646), (30, 646)], t, 210, (140, 116, 88), INK, 4)
    for x0 in range(80, 1360, 90): d.line([(x0, 632), (x0+40, 632)], fill=(226, 212, 180), width=3)
    wpoly(d, [(880, 618), (890, 500), (1010, 500), (1020, 618)], t, 220, (120, 98, 72), INK, 4)
    wpoly(d, [(930, 500), (938, 440), (990, 440), (996, 500)], t, 230, (84, 66, 48), INK, 3)
    wline(d, [(960, 440), (960, 360)], t, 240, INK, 4); wline(d, [(930, 390), (990, 390)], t, 241, INK, 3)
    f = F(MONO, 34)
    typed(d, (210, 790), "HMS ILLUSTRIOUS · KAPAL INDUK INGGRIS", T0 + .5, t, f, (236, 222, 190))
    d.text((70, 60), "LAUT IONIA  ·  11 NOVEMBER 1940", font=F(SERIF, 58), fill=(236, 222, 190))
    # biplanes roll down the deck and climb away to the right
    for i, st in enumerate((0.0, .7, 1.4)):
        u = lt - st
        x = 260 + 1500*cl(u/2.0)**1.7 if u >= 0 else 260 - i*150
        lift = max(0, x - 1150)
        y = 575 - lift*.42 - 0*i
        ang = -math.radians(min(14, lift*.05))
        if x < 2200: biplane(d, x, y, t, 400 + i*200, .85, ang)
    return im

# ---------------- scene 2: the harbour attack ----------------
SHIPS = [(1060, 760, .78, 0), (1400, 735, .72, 1), (1730, 770, .82, 2)]
DROP = 1.05; HIT0 = K.TARANTO['hit'] - S2 - .55
def harbour_scene(t):
    lt = t - S2
    im = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(im)
    night_sky(d, 640); moon(d, 1560, 170, 60)
    # far shore: hills, town, cranes
    wpoly(d, [(700, 640), (820, 560), (980, 590), (1160, 520), (1380, 570), (1580, 530), (1800, 575), (1960, 560), (1960, 660), (700, 660)],
          t, 500, (110, 90, 68), INK, 4)
    for i, x0 in enumerate(range(760, 1940, 70)):
        hh = 30 + (i*37) % 50
        wpoly(d, [(x0, 645), (x0, 645-hh), (x0+50, 645-hh), (x0+50, 645)], t, 520+i, (124, 102, 76), INK, 2)
    sea(d, t, 650, 600)
    # anti-aircraft fire: dotted streaks from the ships
    if lt > .5:
        for j in range(4):
            r = np.random.default_rng(int(t*12)*31 + j); sx = SHIPS[j % 3][0] + r.integers(-120, 120); sy = SHIPS[j % 3][1] - 120
            ex, ey = sx - r.integers(150, 450), sy - r.integers(200, 380)
            for q in range(0, 10, 2):
                a, b = q/10, (q+1)/10
                d.line([(sx+(ex-sx)*a, sy+(ey-sy)*a), (sx+(ex-sx)*b, sy+(ey-sy)*b)], fill=(236, 222, 190), width=4)
    # ships: hit, list and settle
    hits = [HIT0 + i*.32 for i in range(3)]
    for (x, y, s, i), hb in zip(SHIPS, hits):
        age = lt - hb
        sink = ease(age/2.2)*28 if age > 0 else 0
        tilt = math.radians(ease(age/2.2)*(3 + i)) * (1 if i % 2 else -1) if age > 0 else 0
        battleship(d, x, y + sink, t, 800 + i*100, s, tilt)
    # torpedo wakes
    for (x, y, s, i), hb in zip(SHIPS, hits):
        x0 = 380 + i*150; y0 = y + 26
        u = cl((lt - DROP - i*.12) / (hb - DROP - i*.12))
        if lt > DROP + i*.12 and lt < hb + .2:
            xe = x0 + (x - 120*s - x0)*u
            wline(d, [(x0, y0), (xe, y0 - 6)], t, 900+i, FOAM, 6)
            d.ellipse([xe-8, y0-14, xe+8, y0+2], fill=FOAM)
    # biplanes: low run in from the left, drop, pull up
    for i in range(3):
        u = lt - i*.12
        x = -300 + 950*cl(u/DROP) + (900 - i*170)*cl((u-DROP)/1.4)
        y = 540 + i*45 - (300 - i*70)*ease((u-DROP)/1.2)
        ang = -math.radians(16*ease((u-DROP)/.5)) if u > DROP else math.radians(3)
        if x < 2200: biplane(d, x, y, t, 1000 + i*200, .8, ang, torpedo=u < DROP)
        if DROP <= u < DROP + .4:  # dropped torpedo falling to the water
            fu = (u - DROP)/.4; tx = 380 + i*150 - 60*(1-fu); ty = y + 26 + (SHIPS[i][1] + 26 - y - 26)*fu
            wline(d, [(tx-40, ty), (tx+40, ty)], t, 1100+i, (70, 54, 38), 8)
    for (x, y, s, i), hb in zip(SHIPS, hits):
        splash(d, x - 120*s, y + 10, lt - hb)
        smoke(d, x - 60*s, y - 80, lt - hb - .3, 1200 + i)
    d.text((70, 60), "TARANTO, ITALIA  ·  MALAM 11–12 NOV 1940", font=F(SERIF, 58), fill=(236, 222, 190))
    typed(d, (70, 140), "21 PESAWAT TORPEDO SWORDFISH", S2 + .2, t, F(MONO, 32), (236, 222, 190))
    if lt > hits[-1] + .35:
        u = cl((lt - hits[-1] - .35)/.45)
        wobble_circle(d, 1400, 680, 560, 160, u, t, 1300)
        typed(d, (1080, 870), "3 KAPAL TEMPUR LUMPUH", S2 + hits[-1] + .6, t, F(MONO, 36), RED)
    return im

def intertitle(t):
    im = Image.new("RGB", (W, H), (18, 14, 10)); d = ImageDraw.Draw(im)
    d.rectangle([180, 140, W-180, H-140], outline=(200, 180, 140), width=4)
    d.rectangle([200, 160, W-200, H-160], outline=(200, 180, 140), width=1)
    for (x, y) in ((200, 160), (W-200, 160), (200, H-160), (W-200, H-160)): d.ellipse([x-12, y-12, x+12, y+12], fill=RED)
    for s, y, ff in (("Dalam satu malam,", 330, F(SERIF, 96)), ("tiga kapal tempur Italia", 520, F(SERIF, 76)), ("lumpuh.", 620, F(SERIF, 76))):
        w = ff.getbbox(s)[2]; d.text(((W-w)/2, y), s, font=ff, fill=(232, 218, 190))
    d.line([(W/2-160, 480), (W/2+160, 480)], fill=RED, width=4)
    return im

# --------------- film treatment ---------------
yy, xx = np.ogrid[:H, :W]
VIG = (1 - .62*np.clip(((xx-W/2)/(W*.58))**2 + ((yy-H/2)/(H*.58))**2, 0, 1))[..., None].astype(np.float32)
def film(img, t, fi):
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

def frame(fi):
    t = fi / FPS
    hits = [S2 + HIT0 + i*.32 for i in range(3)]
    tq = math.floor(t*12)/12 if not any(h <= t < h + .3 for h in hits) else t     # on twos, except the hits
    if t < S2: img = carrier_scene(tq)
    elif t < S3: img = harbour_scene(tq)
    else: img = intertitle(tq)
    out = film(img, t, fi)
    for h in hits:                                   # torpedo-hit flash with a frame jump
        st = t - h
        if 0 <= st < .22:
            k = 1 - st/.22; out = np.clip(out.astype(np.float32) + 170*k, 0, 255).astype(np.uint8); out = np.roll(out, int(12*k), axis=0)
    full = math.hypot(W/2, H/2)
    if t < T0 + .6: out = iris(out, full*ease((t-T0)/.6))
    for a in (S2, S3):
        if a-.25 < t < a: out = iris(out, full*(1-ease((t-(a-.25))/.25)))
        if a <= t < a+.3: out = iris(out, full*ease((t-a)/.3))
    if t > T1 - .45: out = iris(out, full*(1-ease((t-(T1-.45))/.45)))
    return cv2.cvtColor(out, cv2.COLOR_RGB2BGR)

FR0, FR1 = round(T0*FPS), round(T1*FPS)
if __name__ == "__main__":
    if sys.argv[1] == "stills":
        os.makedirs(os.path.join(K.HERE, 'stills'), exist_ok=True)
        for s in sys.argv[2].split(","):
            cv2.imwrite(os.path.join(K.HERE, 'stills', f"v_{s}.jpg"), frame(int(float(s)*FPS)))
    else:
        p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                              "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", sys.argv[2]], stdin=subprocess.PIPE)
        for fi in range(FR0, FR1): p.stdin.write(frame(fi).tobytes())
        p.stdin.close(); p.wait()
        print(FR0, FR1)
