import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
A = Image.open("stills/thA/f0023.jpg").convert("RGB"); Bm = Image.open("stills/thB/f0023.jpg").convert("RGB")
INK, YEL, PINK, CYAN, RED, WHITE = (24, 16, 26), (255, 210, 58), (255, 79, 160), (79, 224, 255), (224, 52, 48), (255, 255, 255)
TXT = {
  "id": dict(top="GTA 6", sub="$3,79 MILIAR / 1 HARI", bot1="GAME PERTAMA?", bot2="DIBUAT CUMA 2 MINGGU"),
  "en": dict(top="GTA 6", sub="$3.79 BILLION IN 1 DAY", bot1="FIRST GAME?", bot2="BUILT IN JUST 2 WEEKS"),
}
def F(size): return ImageFont.truetype(FONT, size)
def fit(text, maxw, size):
    while size > 20 and F(size).getbbox(text)[2] > maxw: size -= 4
    return F(size)
def text(im, xy, t, font, fill, stroke, anchor="mm", glow=None, shadow=10):
    L = Image.new("RGBA", im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    if glow:
        G = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(G).text(xy, t, font=font, fill=glow + (255,), anchor=anchor, stroke_width=stroke + 10, stroke_fill=glow + (255,))
        im.alpha_composite(G.filter(ImageFilter.GaussianBlur(18)))
    d.text((xy[0] + shadow * 0.6, xy[1] + shadow), t, font=font, fill=(0, 0, 0, 140), anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0, 140))
    L = L.filter(ImageFilter.GaussianBlur(4)); ImageDraw.Draw(L).text(xy, t, font=font, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=INK)
    im.alpha_composite(L)
def badge(im, xy, t, h, col):
    f = F(int(h * 0.6)); tw = f.getbbox(t)[2]; x, y = xy; d = ImageDraw.Draw(im)
    d.rounded_rectangle((x + 6, y + 8, x + tw + h + 6, y + h + 8), radius=h // 3, fill=(0, 0, 0, 120))
    d.rounded_rectangle((x, y, x + tw + h, y + h), radius=h // 3, fill=col, outline=INK, width=6)
    d.text((x + (tw + h) / 2, y + h / 2 + 2), t, font=f, fill=WHITE, anchor="mm")
def vs(im, c, r):
    d = ImageDraw.Draw(im); x, y = c
    d.ellipse((x - r + 8, y - r + 10, x + r + 8, y + r + 10), fill=(0, 0, 0, 130))
    d.ellipse((x - r, y - r, x + r, y + r), fill=RED, outline=INK, width=10); d.ellipse((x - r + 16, y - r + 16, x + r - 16, y + r - 16), outline=YEL, width=6)
    d.text((x, y + 4), "VS", font=F(int(r * 0.95)), fill=WHITE, anchor="mm", stroke_width=6, stroke_fill=INK)
def split_mask(size, p0, p1, below=True):
    m = Image.new("L", size, 0); w, h = size
    poly = [p0, p1, (w, h), (0, h)] if below else [(0, 0), (w, 0), p1, p0]
    ImageDraw.Draw(m).polygon(poly, fill=255); return m

def vertical(lang):
    T = TXT[lang]; W, H = 1080, 1920
    im = Image.new("RGBA", (W, H)); top = Image.new("RGB", (W, H)); top.paste(A.crop((0, 520, 1080, 1920)), (0, 0)); top.paste(A.crop((0, 0, 1080, 520)).resize((1080, 520)), (0, 1400))
    im.paste(top, (0, 0)); p0, p1 = (0, 1040), (W, 900)
    im.paste(Bm, (0, 0), split_mask((W, H), p0, p1, True))
    g = Image.new("L", (1, H)); [g.putpixel((0, y), int(185 * max(0, 1 - y / 520) ** 1.3)) for y in range(H)]
    im.alpha_composite(Image.merge("RGBA", [Image.new("L", (W, H), 12)] * 3 + [g.resize((W, H))]))
    g2 = Image.new("L", (1, H)); [g2.putpixel((0, y), int(200 * max(0, (y - 1520) / 400) ** 1.2)) for y in range(H)]
    im.alpha_composite(Image.merge("RGBA", [Image.new("L", (W, H), 12)] * 3 + [g2.resize((W, H))]))
    d = ImageDraw.Draw(im); d.line([p0, p1], fill=INK, width=30); d.line([p0, p1], fill=YEL, width=16)
    text(im, (W / 2, 200), T["top"], F(280), WHITE, 18, glow=PINK)
    vs(im, (W / 2, 970), 115)
    text(im, (W / 2, 1760), T["bot1"], fit(T["bot1"], W - 70, 170), YEL, 16, glow=(255, 150, 40))
    im.convert("RGB").save(f"out/thumbnail_{lang}_vertical.jpg", quality=93)

def landscape(lang):
    T = TXT[lang]; W, H = 1280, 720
    im = Image.new("RGBA", (W, H))
    left = ImageOps.fit(A.crop((0, 760, 1080, 1760)), (760, 720), centering=(0.5, 0.35)); right = ImageOps.fit(Bm.crop((0, 920, 1080, 1920)), (760, 720), centering=(0.4, 0.5))
    im.paste(left, (-40, 0)); im.paste(right, (560, 0), split_mask((760, 720), (160, 0), (40, 720), True).transpose(Image.Transpose.ROTATE_90).resize((760, 720)) if False else None)
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).polygon([(700, 0), (W, 0), (W, H), (580, H)], fill=255)
    R = Image.new("RGB", (W, H)); R.paste(right, (W - 760, 0)); im.paste(R, (0, 0), m)
    g = Image.new("L", (1, H)); [g.putpixel((0, y), int(170 * max(0, 1 - y / 230) ** 1.2)) for y in range(H)]
    im.alpha_composite(Image.merge("RGBA", [Image.new("L", (W, H), 12)] * 3 + [g.resize((W, H))]))
    g2 = Image.new("L", (1, H)); [g2.putpixel((0, y), int(170 * max(0, (y - 540) / 180) ** 1.2)) for y in range(H)]
    im.alpha_composite(Image.merge("RGBA", [Image.new("L", (W, H), 12)] * 3 + [g2.resize((W, H))]))
    d = ImageDraw.Draw(im); d.line([(700, 0), (580, H)], fill=INK, width=24); d.line([(700, 0), (580, H)], fill=YEL, width=12)
    text(im, (320, 100), T["top"], F(150), WHITE, 12, glow=PINK, shadow=7)
    text(im, (965, 640), T["bot1"], fit(T["bot1"], 590, 100), YEL, 10, glow=(255, 150, 40), shadow=7)
    vs(im, (640, 370), 78)
    im.convert("RGB").save(f"out/thumbnail_{lang}_landscape.jpg", quality=93)

for L in ("id", "en"): vertical(L); landscape(L)
print("ok")
