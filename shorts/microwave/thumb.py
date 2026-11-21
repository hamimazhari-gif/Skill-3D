import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
hero = Image.open("stills/thumb/f0000.jpg").convert("RGB")
mw = Image.open("frames_id/f0003.jpg").convert("RGB").crop((0, 180, 1080, 1260))
TXT = {
  "id": (["PERMEN INI", "MENEMUKAN"], "MICROWAVE?!", "1940-an"),
  "en": (["THIS CANDY BAR", "INVENTED THE"], "MICROWAVE?!", "1940s"),
}
YEL, RED, INK = (255, 210, 58), (224, 52, 48), (24, 16, 26)

def fit(text, maxw, size):
    while size > 20:
        f = ImageFont.truetype(FONT, size)
        if f.getbbox(text)[2] <= maxw: return f
        size -= 4
    return ImageFont.truetype(FONT, size)

def text_layer(W, H, x, y, text, font, fill, stroke, rot=0, shadow=10):
    L = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    d.text((x + shadow * 0.6, y + shadow), text, font=font, fill=(0, 0, 0, 150), stroke_width=stroke, stroke_fill=(0, 0, 0, 150))
    L = L.filter(ImageFilter.GaussianBlur(4)); d = ImageDraw.Draw(L)
    d.text((x, y), text, font=font, fill=fill, stroke_width=stroke, stroke_fill=INK)
    if rot: L = L.rotate(rot, resample=Image.BICUBIC, center=(x + font.getbbox(text)[2] / 2, y))
    return L

def circle_inset(img, size, ring=14):
    s = min(img.size); img = ImageOps.fit(img, (size, size), centering=(0.5, 0.42))
    m = Image.new("L", (size, size), 0); ImageDraw.Draw(m).ellipse((0, 0, size - 1, size - 1), fill=255)
    out = Image.new("RGBA", (size + 2 * ring, size + 2 * ring), (0, 0, 0, 0)); d = ImageDraw.Draw(out)
    d.ellipse((0, 0, size + 2 * ring - 1, size + 2 * ring - 1), fill=INK)
    d.ellipse((ring * 0.35, ring * 0.35, size + 2 * ring - ring * 0.35, size + 2 * ring - ring * 0.35), fill=(255, 255, 255))
    out.paste(img, (ring, ring), m); return out

def arrow(d, pts, w, col):
    for c, ww in ((INK, w + 14), (col, w)): d.line(pts, fill=c, width=ww, joint="curve")
    (x0, y0), (x1, y1) = pts[-2], pts[-1]
    import math; a = math.atan2(y1 - y0, x1 - x0); L = w * 2.6
    tri = [(x1 + math.cos(a) * L * 0.6, y1 + math.sin(a) * L * 0.6), (x1 + math.cos(a + 2.4) * L, y1 + math.sin(a + 2.4) * L), (x1 + math.cos(a - 2.4) * L, y1 + math.sin(a - 2.4) * L)]
    d.polygon(tri, fill=col, outline=INK, width=7)

def badge(text, h=92, col=RED):
    f = ImageFont.truetype(FONT, int(h * 0.58)); tw = f.getbbox(text)[2]
    B = Image.new("RGBA", (tw + h, h + 12), (0, 0, 0, 0)); d = ImageDraw.Draw(B)
    d.rounded_rectangle((6, 6, tw + h - 1, h + 11), radius=h // 3, fill=(0, 0, 0, 120))
    d.rounded_rectangle((0, 0, tw + h - 7, h + 4), radius=h // 3, fill=col, outline=INK, width=6)
    d.text(((tw + h - 7) / 2, (h + 4) / 2), text, font=f, fill=(255, 255, 255), anchor="mm"); return B

def vertical(lang):
    lines, big, year = TXT[lang]
    W, H = 1080, 1920; im = hero.copy().convert("RGBA")
    g = Image.new("L", (1, H)); [g.putpixel((0, y), int(170 * max(0, 1 - y / 900) ** 1.4)) for y in range(H)]
    im = Image.alpha_composite(im, Image.merge("RGBA", [Image.new("L", (W, H), 20)] * 3 + [g.resize((W, H))]))
    y = 110
    for t in lines:
        f = fit(t, W - 120, 132); im = Image.alpha_composite(im, text_layer(W, H, (W - f.getbbox(t)[2]) / 2, y, t, f, (255, 255, 255), 12)); y += f.getbbox(t)[3] + 26
    f = fit(big, W - 80, 190); im = Image.alpha_composite(im, text_layer(W, H, (W - f.getbbox(big)[2]) / 2, y + 6, big, f, YEL, 16, rot=3))
    d = ImageDraw.Draw(im)
    ins = circle_inset(mw, 300); im.alpha_composite(ins, (W - ins.width - 40, 1470))
    arrow(d, [(640, 1420), (720, 1500), (800, 1560)], 22, YEL)
    b = badge(year); im.alpha_composite(b, (50, 1750))
    nb = badge("SEKARANG" if lang == "id" else "TODAY", 70, (47, 140, 80)); im.alpha_composite(nb, (W - nb.width - 60, 1800))
    out = f"out/thumbnail_{lang}_vertical.jpg"; im.convert("RGB").save(out, quality=93); print(out)

def landscape(lang):
    lines, big, year = TXT[lang]
    W, H = 1280, 720
    import math
    bg = Image.new("RGBA", (W, H), (236, 120, 40, 255)); dd = ImageDraw.Draw(bg); cx, cy = 300, 330
    for i in range(24):
        a0, a1 = i * math.pi / 12, i * math.pi / 12 + math.pi / 24
        dd.polygon([(cx, cy), (cx + 2000 * math.cos(a0), cy + 2000 * math.sin(a0)), (cx + 2000 * math.cos(a1), cy + 2000 * math.sin(a1))], fill=(246, 150, 52, 255))
    rg = Image.new("L", (W, H), 0); ImageDraw.Draw(rg).ellipse((cx - 700, cy - 600, cx + 700, cy + 600), fill=255)
    bg = Image.composite(bg, Image.new("RGBA", (W, H), (150, 60, 30, 255)), rg.filter(ImageFilter.GaussianBlur(160)))
    crop = hero.crop((120, 720, 820, 1560)).resize((600, 720), Image.LANCZOS)
    m = Image.new("L", crop.size, 255); md = ImageDraw.Draw(m)
    for x in range(60): md.line([(x, 0), (x, 720)], fill=int(255 * x / 60))
    bg.paste(crop, (W - 600, 0), m)
    y = 60
    for t in lines:
        f = fit(t, 660, 92); bg = Image.alpha_composite(bg, text_layer(W, H, 50, y, t, f, (255, 255, 255), 9, shadow=7)); y += f.getbbox(t)[3] + 16
    f = fit(big, 700, 120); bg = Image.alpha_composite(bg, text_layer(W, H, 44, y + 10, big, f, YEL, 12, rot=3, shadow=8))
    ins = circle_inset(mw, 210, 10); bg.alpha_composite(ins, (70, 440))
    d = ImageDraw.Draw(bg); arrow(d, [(740, 560), (560, 600), (330, 560)], 16, YEL)
    b = badge(year, 64); bg.alpha_composite(b, (W - b.width - 30, 30))
    out = f"out/thumbnail_{lang}_landscape.jpg"; bg.convert("RGB").save(out, quality=93); print(out)

for L in ("id", "en"): vertical(L); landscape(L)
