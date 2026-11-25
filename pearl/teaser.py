"""Cold-open teaser (~22 s): vintage 2D silent-film animation of the attack on Pearl Harbor.
Reuses the drawing kit and film treatment from taranto.py.
  python3 pearl/teaser.py stills 2,5,9,12,14,19
  python3 pearl/teaser.py full pearl/teaser_video.mp4"""
import os, sys, math, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from taranto import (W, H, FPS, F, MONO, SERIF, INK, PAPER, MID, DARK, RED, SEA, FOAM, cl, ease, J, wline, wpoly, xf, typed,
                     battleship, sea, smoke, splash, wobble_circle, film, iris)

DUR = 22.0
S1, S2, S3, S4 = 0.0, 4.0, 7.5, 17.5          # carrier launch, Oahu map, Battleship Row, intertitle
LIGHT = (236, 222, 190)

def monoplane(d, x, y, t, k, s=1.0, ang=0.0, torpedo=False, bomb=False):
    """Low-wing carrier plane (torpedo bomber / dive bomber), side view facing right, with the red roundel."""
    P = lambda pts: xf(pts, x, y, s, ang)
    w = max(2, int(4*s))
    wpoly(d, P([(-150, -4), (-60, -16), (60, -20), (100, -12), (104, 8), (60, 14), (-150, 4)]), t, k, (128, 106, 80), INK, w)
    wpoly(d, P([(-40, -16), (-30, -34), (50, -34), (64, -18)]), t, k+10, (176, 160, 130), INK, max(2, int(3*s)))   # long canopy
    wpoly(d, P([(-148, -4), (-170, -44), (-140, -44), (-116, -8)]), t, k+20, (128, 106, 80), INK, w)              # fin
    wline(d, P([(-176, 0), (-120, 0)]), t, k+30, INK, int(7*s))
    wpoly(d, P([(-30, 8), (70, 8), (80, 18), (-36, 18)]), t, k+40, (96, 78, 58), INK, max(2, int(3*s)))           # wing root
    cx, cy = P([(-90, -2)])[0]; r = 13*s; d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=RED)                            # hinomaru
    blade = (int(t*30) % 2) * 6
    wline(d, P([(110, -40 + blade), (110, 40 - blade)]), t, k+50, (176, 156, 124), max(2, int(5*s)))
    if torpedo: wline(d, P([(-20, 24), (70, 24)]), t, k+60, (70, 54, 38), int(9*s))
    if bomb:
        bx, by = P([(20, 26)])[0]; r = 9*s; d.ellipse([bx-2*r, by-r, bx+2*r, by+r], fill=(70, 54, 38))

def sky(d, top, c0, c1):
    for i in range(0, top, 6): d.rectangle([0, i, W, i+6], fill=tuple(int(a + (b-a)*i/top) for a, b in zip(c0, c1)))

# ---------------- scene 1: dawn launch from a Japanese carrier ----------------
def carrier_scene(t):
    lt = t - S1
    im = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(im)
    sky(d, 700, (66, 52, 40), (200, 176, 136))
    d.ellipse([1380, 560, 1620, 800], fill=(240, 226, 192))                                   # sun on the horizon
    sea(d, t, 700, 100)
    wpoly(d, [(80, 640), (1300, 640), (1230, 760), (170, 760)], t, 200, (98, 78, 58), INK, 5)
    wpoly(d, [(40, 618), (1360, 618), (1360, 646), (40, 646)], t, 210, (140, 116, 88), INK, 4)
    for x0 in range(90, 1340, 90): d.line([(x0, 632), (x0+40, 632)], fill=LIGHT, width=3)
    wpoly(d, [(820, 618), (830, 540), (900, 540), (906, 618)], t, 220, (120, 98, 72), INK, 4)  # small island
    wline(d, [(860, 540), (860, 470)], t, 240, INK, 4)
    d.text((70, 60), "PASIFIK UTARA  ·  7 DESEMBER 1941  ·  06.10", font=F(SERIF, 56), fill=LIGHT)
    typed(d, (70, 140), "GELOMBANG PERTAMA: 183 PESAWAT", S1 + .6, t, F(MONO, 34), LIGHT)
    for i, st in enumerate((0.2, 1.0, 1.8)):
        u = lt - st
        x = 300 + 1600*cl(u/2.0)**1.7 if u >= 0 else 300 - (i+1)*170
        lift = max(0, x - 1100); y = 585 - lift*.42
        if x < 2200: monoplane(d, x, y, t, 400 + i*200, .8, -math.radians(min(14, lift*.05)), torpedo=True)
    return im

# ---------------- scene 2: schematic map of Oahu ----------------
OAHU = [(640, 300), (860, 200), (1060, 280), (1230, 400), (1380, 560), (1430, 700), (1330, 790), (1130, 830), (930, 800),
        (780, 700), (660, 540)]
PH = (1010, 770)
ROUTES = [[(700, -40), (820, 360), (980, 700)], [(1000, -40), (1040, 380), (1010, 720)], [(1400, -40), (1240, 400), (1050, 710)]]
def map_scene(t):
    lt = t - S2
    im = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(im)
    for y in range(0, H, 60): d.line([(0, y), (W, y)], fill=(214, 195, 158), width=1)
    for x in range(0, W, 60): d.line([(x, 0), (x, H)], fill=(214, 195, 158), width=1)
    wpoly(d, OAHU, t, 10, (196, 174, 136), INK, 5)
    for i, (a, b) in enumerate(((720, 420), (1200, 520))):                                    # two mountain ranges
        wline(d, [(a, b), (a+80, b-60), (a+160, b+10), (a+240, b-40)], t, 30+i*10, DARK, 4)
    wpoly(d, [(950, 800), (980, 740), (1010, 760), (1040, 730), (1070, 760), (1060, 810)], t, 50, PAPER, INK, 3)  # harbour lochs
    f = F(MONO, 30)
    d.text((820, 520), "O A H U", font=F(SERIF, 64), fill=INK)
    d.text((1150, 820), "HONOLULU", font=f, fill=INK)
    d.text((70, 60), "HAWAII  ·  07.48 WAKTU SETEMPAT", font=F(SERIF, 56), fill=INK)
    for ri, route in enumerate(ROUTES):                                                        # dashed red attack routes
        u = ease((lt - .2 - ri*.25)/1.6)
        segs = [math.dist(route[i], route[i+1]) for i in range(len(route)-1)]; L = u*sum(segs)
        pts = [route[0]]
        for i, s_ in enumerate(segs):
            a, b = route[i], route[i+1]
            if L <= s_: pts.append((a[0]+(b[0]-a[0])*L/s_, a[1]+(b[1]-a[1])*L/s_)); break
            L -= s_; pts.append(b)
        for i in range(len(pts)-1):
            a, b = pts[i], pts[i+1]; n = int(math.dist(a, b)//22)
            for k in range(0, n, 2):
                p, q = k/max(n, 1), (k+1)/max(n, 1)
                d.line([(a[0]+(b[0]-a[0])*p, a[1]+(b[1]-a[1])*p), (a[0]+(b[0]-a[0])*q, a[1]+(b[1]-a[1])*q)], fill=RED, width=8)
        if u > 0: x, y = pts[-1]; d.polygon([(x-14, y-18), (x+14, y-18), (x, y+8)], fill=RED)
    if lt > 2.0:
        wobble_circle(d, PH[0], PH[1] - 20, 120, 80, cl((lt-2.0)/.4), t, 70)
        typed(d, (1150, 700), "PEARL HARBOR", S2 + 2.2, t, F(MONO, 40), RED)
    return im

# ---------------- scene 3: Battleship Row ----------------
SHIPS = [(760, 790, .74, 0), (1110, 770, .78, 1), (1480, 800, .86, 2)]   # the last one stands in for USS Arizona
TORP = 3.0; HITS = [4.2, 4.55, 4.9]; BOOM = 6.2
def harbour_scene(t):
    lt = t - S3
    im = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(im)
    sky(d, 660, (176, 156, 122), (222, 204, 166))
    wpoly(d, [(-20, 660), (200, 470), (420, 520), (640, 400), (900, 500), (1150, 430), (1400, 520), (1700, 450), (1960, 560), (1960, 680), (-20, 680)],
          t, 500, (150, 128, 98), INK, 4)                                                     # Ko'olau range
    wpoly(d, [(-20, 660), (1960, 660), (1960, 700), (-20, 700)], t, 510, (170, 148, 112), INK, 3)  # Ford Island shore
    for i, x0 in enumerate(range(80, 1900, 160)): wline(d, [(x0, 660), (x0, 620), (x0+40, 620)], t, 520+i, INK, 3)
    sea(d, t, 700, 600)
    hits = HITS + [BOOM + .2]
    if lt > 3.4:                                                                               # anti-aircraft fire
        for j in range(5):
            r = np.random.default_rng(int(t*12)*31 + j); sx = SHIPS[j % 3][0] + r.integers(-120, 120); sy = SHIPS[j % 3][1] - 140
            ex, ey = sx - r.integers(-300, 300), sy - r.integers(250, 480)
            for q in range(0, 10, 2):
                a, b = q/10, (q+1)/10
                d.line([(sx+(ex-sx)*a, sy+(ey-sy)*a), (sx+(ex-sx)*b, sy+(ey-sy)*b)], fill=LIGHT, width=4)
    for (x, y, s, i), hb in zip(SHIPS, HITS):
        hb2 = BOOM if i == 2 else hb
        age = lt - hb2
        sink = ease(age/2.5)*(40 if i == 2 else 26) if age > 0 else 0
        tilt = math.radians(ease(age/2.5)*(4 + i))*(1 if i % 2 else -1) if age > 0 else 0
        battleship(d, x, y + sink, t, 800 + i*100, s, tilt)
    for (x, y, s, i), hb in zip(SHIPS[:2], HITS[:2]):                                          # torpedo wakes
        x0 = 260 + i*120; y0 = y + 30
        u = cl((lt - TORP - i*.15) / (hb - TORP - i*.15))
        if TORP + i*.15 < lt < hb + .2:
            xe = x0 + (x - 140*s - x0)*u; wline(d, [(x0, y0), (xe, y0 - 6)], t, 900+i, FOAM, 6); d.ellipse([xe-8, y0-14, xe+8, y0+2], fill=FOAM)
    for i in range(2):                                                                         # torpedo bombers: low run from the left
        u = lt - 1.2 - i*.2
        x = -300 + 700*cl(u/1.8) + 1500*cl((u-1.8)/1.6); y = 560 + i*60 - 300*ease((u-1.8)/1.4)
        ang = -math.radians(18*ease((u-1.8)/.5)) if u > 1.8 else math.radians(2)
        if -400 < x < 2200: monoplane(d, x, y, t, 1000 + i*200, .75, ang, torpedo=u < 1.8)
    for i in range(3):                                                                         # dive bombers from the top right
        u = lt - 3.0 - i*.35
        if u < 0: continue
        x = 2000 - 560*cl(u/1.6) - 900*cl((u-1.6)/1.5); y = -150 + 520*cl(u/1.6) - 400*ease((u-1.6)/1.2)
        ang = math.radians(150 - 120*ease((u-1.6)/.6))
        if -400 < x < 2200: monoplane(d, x, y, t, 1300 + i*200, .7, ang, bomb=u < 1.6)
    if 4.6 < lt < BOOM:                                                                        # falling bomb
        u = (lt - 4.6)/(BOOM - 4.6); bx = 1440 + 20*u; by = 380 + (SHIPS[2][1] - 120 - 380)*u
        d.ellipse([bx-14, by-8, bx+14, by+8], fill=(70, 54, 38))
    for (x, y, s, i), hb in zip(SHIPS[:2], HITS[:2]):
        splash(d, x - 140*s, y + 10, lt - hb); smoke(d, x - 60*s, y - 80, lt - hb - .3, 1200 + i)
    age = lt - BOOM                                                                            # the big explosion
    if age > 0:
        x, y = SHIPS[2][0] - 20, SHIPS[2][1] - 90
        r = 60 + 260*ease(age/.6)
        if age < 1.2: d.ellipse([x-r, y-r*1.1, x+r, y+r*.5], fill=FOAM)
        smoke(d, x, y - 40, min(age - .2, 2.6), 1300, big=1.5); smoke(d, x - 90, y, min(age - .5, 2.2), 1310, big=1.1)
    d.text((70, 60), "PEARL HARBOR  ·  07.55", font=F(SERIF, 56), fill=INK)
    typed(d, (70, 140), "BATTLESHIP ROW, FORD ISLAND", S3 + .4, t, F(MONO, 34), INK)
    if lt > BOOM + 1.2:
        wobble_circle(d, SHIPS[2][0] - 20, SHIPS[2][1] - 140, 330, 240, cl((lt - BOOM - 1.2)/.45), t, 1400)
        typed(d, (1260, 920), "USS ARIZONA", S3 + BOOM + 1.5, t, F(MONO, 42), RED)
    return im

def intertitle(t):
    im = Image.new("RGB", (W, H), (18, 14, 10)); d = ImageDraw.Draw(im)
    d.rectangle([180, 140, W-180, H-140], outline=(200, 180, 140), width=4)
    d.rectangle([200, 160, W-200, H-160], outline=(200, 180, 140), width=1)
    for (x, y) in ((200, 160), (W-200, 160), (200, H-160), (W-200, H-160)): d.ellipse([x-12, y-12, x+12, y+12], fill=RED)
    for s, y, ff in (("7 Desember 1941", 330, F(SERIF, 110)), ("Satu pagi", 540, F(SERIF, 76)), ("yang mengubah sejarah.", 640, F(SERIF, 76))):
        if s != "7 Desember 1941" and t < S4 + .9: continue
        w = ff.getbbox(s)[2]; d.text(((W-w)/2, y), s, font=ff, fill=(232, 218, 190))
    d.line([(W/2-180, 490), (W/2+180, 490)], fill=RED, width=4)
    return im

FLASHES = [S3 + h for h in HITS[:2]] + [S3 + BOOM]
def frame(fi):
    t = fi / FPS
    tq = math.floor(t*12)/12 if not any(h <= t < h + .3 for h in FLASHES) else t
    img = carrier_scene(tq) if t < S2 else map_scene(tq) if t < S3 else harbour_scene(tq) if t < S4 else intertitle(tq)
    out = film(img, t, fi)
    for h in FLASHES:
        st = t - h; big = h == FLASHES[-1]
        if 0 <= st < (.4 if big else .22):
            k = 1 - st/(.4 if big else .22); out = np.clip(out.astype(np.float32) + (230 if big else 170)*k, 0, 255).astype(np.uint8)
            out = np.roll(out, int((22 if big else 12)*k), axis=0)
    full = math.hypot(W/2, H/2)
    if t < .6: out = iris(out, full*ease(t/.6))
    for a in (S2, S3, S4):
        if a-.25 < t < a: out = iris(out, full*(1-ease((t-(a-.25))/.25)))
        if a <= t < a+.3: out = iris(out, full*ease((t-a)/.3))
    if t > DUR - .6: out = iris(out, full*(1-ease((t-(DUR-.6))/.6)))
    return cv2.cvtColor(out, cv2.COLOR_RGB2BGR)

if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    if sys.argv[1] == "stills":
        os.makedirs(os.path.join(here, 'stills'), exist_ok=True)
        for s in sys.argv[2].split(","): cv2.imwrite(os.path.join(here, 'stills', f"teaser_{s}.jpg"), frame(int(float(s)*FPS)))
    else:
        p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                              "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", sys.argv[2]], stdin=subprocess.PIPE)
        for fi in range(int(DUR*FPS)): p.stdin.write(frame(fi).tobytes())
        p.stdin.close(); p.wait()
        import json
        cues = dict(duration=DUR, film=[[0, DUR]], engine=[[.3, S4 - .1]],
                    shot=[round(h, 2) for h in FLASHES] + [round(S3 + BOOM + .15, 2)],
                    thud=[S4 + .05, round(S4 + .9, 2)], whoosh=[S2 - .25, S3 - .25, S4 - .25],
                    type=[[S1 + .6, 30], [S2 + 2.2, 12], [S3 + .4, 27], [round(S3 + BOOM + 1.5, 2), 11]],
                    scratch=[[S2 + 2.0, .4], [round(S3 + BOOM + 1.2, 2), .45]], tension=[S3 + BOOM])
        json.dump(cues, open(os.path.join(here, 'teaser_cues.json'), 'w'))
