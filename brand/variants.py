import sys; sys.argv = ['x']
exec(open('brand.py').read().split('# ---------------- profile picture')[0])
def variant(name, char, cols, props, logo_glow, crop_h=800, scale=1300, y=165):
    W = 1080; im = rays(W, W, (540, 520), 22, cols[0] + (255,), cols[1] + (255,))
    m = Image.new("L", (W, W), 0); ImageDraw.Draw(m).ellipse((90, 60, 990, 960), fill=255); m = m.filter(ImageFilter.GaussianBlur(160))
    im = Image.composite(im, Image.new("RGBA", (W, W), cols[2] + (255,)), m)
    back = [p for p in props if p[4] == 'back']; front = [p for p in props if p[4] == 'front']
    def put(lst):
        for k, xy, h, r, _ in lst:
            if k == '?':
                L = Image.new("RGBA", (300, 360), (0, 0, 0, 0)); ImageDraw.Draw(L).text((150, 180), "?", font=F(h), fill=YEL, anchor="mm", stroke_width=14, stroke_fill=INK)
                shadowed(im, L.rotate(r, expand=True, resample=Image.BICUBIC), xy, 8, (6, 8), 90); continue
            p = scaled(k, h).rotate(r, expand=True, resample=Image.BICUBIC); shadowed(im, p, xy, 8, (6, 8), 90)
    put(back)
    c = png(char); c = c.resize((round(c.width * scale / c.height), scale), Image.LANCZOS); c = c.crop((0, 0, c.width, crop_h)); shadowed(im, c, ((W - c.width) // 2, y))
    put(front)
    band = Image.new("RGBA", (W, W), (0, 0, 0, 0)); ImageDraw.Draw(band).rounded_rectangle((210, 820, 870, 965), radius=40, fill=INK); im.alpha_composite(band)
    lg = logo(110, logo_glow); lg = lg.resize((min(600, lg.width), round(lg.height * min(600, lg.width) / lg.width)), Image.LANCZOS); im.alpha_composite(lg, ((W - lg.width) // 2, 892 - lg.height // 2))
    vignette(im, 110); im.convert("RGB").save(f"out/profile_{name}.png")
    mk = Image.new("L", (W, W), 0); ImageDraw.Draw(mk).ellipse((0, 0, W, W), fill=255); bg = Image.new("RGBA", (W, W), (240, 242, 245, 255)); bg.paste(im, (0, 0), mk)
    return bg.convert("RGB").resize((420, 420), Image.LANCZOS)
A = variant("A_penjelajah", "explorer", [(20, 150, 160), (40, 180, 180), (16, 60, 90)], [("clock", (690, 90), 330, -10, 'back'), ("magnifier", (700, 430), 330, -25, 'front'), ("popcorn", (130, 230), 120, 10, 'back')], (255, 150, 40))
B = variant("B_profesor", "prof", [(40, 90, 200), (70, 120, 230), (20, 30, 90)], [("bulb", (650, 40), 330, 12, 'back'), ("mol", (110, 260), 190, -10, 'back'), ("ctrl", (760, 560), 140, -12, 'front')], (79, 224, 255))
C = variant("C_penasaran", "mascotQ", [(255, 79, 160), (255, 110, 180), (90, 40, 170)], [("?", (700, 110), 300, 12, 'back'), ("popcorn", (130, 230), 130, 10, 'back'), ("dot", (780, 470), 200, 0, 'front')], (79, 224, 255))
sheet = Image.new("RGB", (1380, 520), (255, 255, 255)); d = ImageDraw.Draw(sheet)
for i, (im, t) in enumerate([(A, "A · Penjelajah Waktu"), (B, "B · Profesor Fakta"), (C, "C · Si Penasaran")]):
    sheet.paste(im, (30 + i * 450, 20)); d.text((240 + i * 450, 480), t, font=F(30), fill=INK, anchor="mm")
sheet.save("out/profile_options.png"); print("ok")
