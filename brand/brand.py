import math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
INK, YEL, PINK, CYAN, WHITE = (24, 16, 26), (255, 210, 58), (255, 79, 160), (79, 224, 255), (255, 255, 255)
F = lambda s: ImageFont.truetype(FONT, s)
def png(k): im = Image.open(f"png/{k}.png").convert("RGBA"); return im.crop(im.getbbox())
def shadowed(base, img, xy, blur=14, off=(10, 14), alpha=110):
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0)); sh.putalpha(img.getchannel("A").point(lambda a: a * alpha // 255))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)), (xy[0] + off[0], xy[1] + off[1])); base.alpha_composite(img, xy)
def scaled(k, h): im = png(k); return im.resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS)
def rays(W, H, c, n, col_a, col_b):
    im = Image.new("RGBA", (W, H), col_a); d = ImageDraw.Draw(im)
    for i in range(n):
        a0 = i * 2 * math.pi / n; a1 = a0 + math.pi / n
        d.polygon([c, (c[0] + 4000 * math.cos(a0), c[1] + 4000 * math.sin(a0)), (c[0] + 4000 * math.cos(a1), c[1] + 4000 * math.sin(a1))], fill=col_b)
    return im
def vignette(im, strength=170):
    W, H = im.size; m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).ellipse((-W * 0.2, -H * 0.2, W * 1.2, H * 1.2), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(min(W, H) * 0.2)); dark = Image.new("RGBA", (W, H), (20, 8, 30, strength)); dark.putalpha(Image.eval(m, lambda v: (255 - v) * strength // 255)); im.alpha_composite(dark)
def logo(size, glow=PINK):
    a, b = "E-DAY", "zz"; fa, fb = F(size), F(int(size * 0.72))
    wa = fa.getbbox(a)[2]; wb = fb.getbbox(b)[2]; W, H = wa + wb + int(size * 0.5), int(size * 1.7)
    L = Image.new("RGBA", (W, H), (0, 0, 0, 0)); x0, y0 = int(size * 0.18), int(size * 0.3)
    G = Image.new("RGBA", (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(G)
    gd.text((x0, y0), a, font=fa, fill=glow + (255,), stroke_width=int(size * 0.14), stroke_fill=glow + (255,))
    gd.text((x0 + wa + size * 0.04, y0 - size * 0.12), b, font=fb, fill=glow + (255,), stroke_width=int(size * 0.12), stroke_fill=glow + (255,))
    L.alpha_composite(G.filter(ImageFilter.GaussianBlur(size * 0.12)))
    d = ImageDraw.Draw(L); sw = max(4, int(size * 0.075))
    d.text((x0 + size * 0.05, y0 + size * 0.08), a, font=fa, fill=(0, 0, 0, 150), stroke_width=sw, stroke_fill=(0, 0, 0, 150))
    d.text((x0, y0), a, font=fa, fill=WHITE, stroke_width=sw, stroke_fill=INK)
    zz = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(zz).text((x0 + wa + size * 0.04, y0 - size * 0.12), b, font=fb, fill=YEL, stroke_width=sw, stroke_fill=INK)
    L.alpha_composite(zz.rotate(-8, resample=Image.BICUBIC, center=(x0 + wa + wb / 2, y0 + size * 0.2)))
    return L.crop(L.getbbox())

# ---------------- profile picture 1080x1080 ----------------
def profile():
    W = 1080; im = rays(W, W, (540, 520), 22, (255, 79, 160, 255), (255, 110, 180, 255))
    m = Image.new("L", (W, W), 0); ImageDraw.Draw(m).ellipse((90, 60, 990, 960), fill=255); m = m.filter(ImageFilter.GaussianBlur(160))
    im = Image.composite(im, Image.new("RGBA", (W, W), (90, 40, 170, 255)), m)
    for k, xy, h, r in [("popcorn", (150, 210), 150, 15), ("dot", (800, 150), 220, 0), ("popcorn2", (840, 420), 130, -20), ("ctrl", (70, 520), 150, -12)]:
        p = scaled(k, h).rotate(r, expand=True, resample=Image.BICUBIC); shadowed(im, p, xy, 8, (6, 8), 90)
    m_ = png("mascot"); h = 1300; m_ = m_.resize((round(m_.width * h / m_.height), h), Image.LANCZOS); m_ = m_.crop((0, 0, m_.width, 800))
    shadowed(im, m_, ((W - m_.width) // 2, 165))
    band = Image.new("RGBA", (W, W), (0, 0, 0, 0)); bd = ImageDraw.Draw(band); bd.rounded_rectangle((210, 820, 870, 965), radius=40, fill=INK)
    im.alpha_composite(band); lg = logo(110, CYAN); lg = lg.resize((min(600, lg.width), round(lg.height * min(600, lg.width) / lg.width)), Image.LANCZOS)
    im.alpha_composite(lg, ((W - lg.width) // 2, 892 - lg.height // 2))
    vignette(im, 120); im.convert("RGB").save("out/profile_E-DAYzz.png")
    prev = im.copy(); mk = Image.new("L", (W, W), 0); ImageDraw.Draw(mk).ellipse((0, 0, W, W), fill=255); bg = Image.new("RGBA", (W, W), (240, 242, 245, 255)); bg.paste(prev, (0, 0), mk)
    bg.convert("RGB").resize((360, 360), Image.LANCZOS).save("out/preview_profile_circle.png")

# ---------------- cover 1640x924 ----------------
def cover(lang):
    W, H = 1640, 924; im = Image.new("RGBA", (W, H))
    left = Image.new("RGBA", (W, H), (236, 214, 170, 255)); ld = ImageDraw.Draw(left)
    for i in range(0, W, 70): ld.rectangle((i, 0, i + 34, H), fill=(228, 204, 158, 255))
    ld.rectangle((0, 690, W, H), fill=(120, 150, 140, 255))
    for i in range(0, W, 92):
        for j in range(690, H, 92): ld.rectangle((i + ((j // 92) % 2) * 46, j, i + ((j // 92) % 2) * 46 + 46, j + 46), fill=(232, 222, 196, 255))
    right = Image.new("RGBA", (W, H)); rd = ImageDraw.Draw(right)
    for y in range(H): t = y / H; rd.line([(0, y), (W, y)], fill=(int(18 + 220 * t ** 2.2), int(10 + 70 * t ** 2.2), int(48 + 90 * t), 255))
    random.seed(4)
    for x in range(820, W, 70):
        h = random.randint(260, 560); rd.rectangle((x, H - h, x + 62, H), fill=(34, 28, 62, 255))
        for wy in range(H - h + 20, H - 40, 34):
            for wx in range(x + 8, x + 56, 18):
                if random.random() < 0.5: rd.rectangle((wx, wy, wx + 9, wy + 16), fill=random.choice([(255, 216, 138), (159, 216, 255), (255, 154, 208)]) + (255,))
    rd.rectangle((0, 760, W, H), fill=(30, 26, 44, 255))
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).polygon([(900, 0), (W, 0), (W, H), (740, H)], fill=255)
    im.alpha_composite(left); im.paste(right, (0, 0), m)
    d = ImageDraw.Draw(im); d.line([(900, 0), (740, H)], fill=INK, width=26); d.line([(900, 0), (740, H)], fill=YEL, width=12)
    floor = 900
    cast = [("spencer", 150, 470), ("cowork", 330, 455), ("kid58", 490, 340), ("higgy", 640, 470), ("youB", 1010, 455), ("mascot2", 1190, 500), ("youA", 1370, 455), ("gran58", 1545, 440)]
    for k, cx, h in cast:
        p = scaled(k, h); shadowed(im, p, (cx - p.width // 2, floor - h), 10, (8, 10), 100)
    for k, xy, h, r in [("popcorn", (70, 90), 110, 10), ("popcorn2", (250, 230), 90, -15), ("mol", (300, 40), 150, -8), ("ctrl", (1240, 70), 140, 10), ("dot", (1420, 180), 200, 0)]:
        p = scaled(k, h).rotate(r, expand=True, resample=Image.BICUBIC); shadowed(im, p, xy, 8, (6, 8), 90)
    # logo + tagline in the centre safe zone
    pan = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(pan).rounded_rectangle((460, 60, 1180, 380), radius=50, fill=(24, 16, 26, 215)); im.alpha_composite(pan)
    lg = logo(150, PINK); im.alpha_composite(lg, ((W - lg.width) // 2, 92))
    tag = {"id": "Fakta unik. Dianimasikan.", "en": "Weird facts. Animated."}[lang]
    d = ImageDraw.Draw(im); d.text((W // 2, 325), tag, font=F(54), fill=YEL, anchor="mm", stroke_width=5, stroke_fill=INK)
    im.convert("RGB").save(f"out/cover_E-DAYzz_{lang}.png")

import os; os.makedirs("out", exist_ok=True)
profile(); cover("id"); cover("en"); print("ok")
