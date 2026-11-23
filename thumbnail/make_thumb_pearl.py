"""Thumbnail 1280x720 in the 'evidence board' YouTube style (dark teal grid, big serif title, red key word, photo collage)."""
import sys, math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FB = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'fonts')                                   # folder with merriweather-latin-{900,700}-normal.woff
BLACK = os.path.join(FB, 'merriweather-latin-900-normal.woff'); BOLD = os.path.join(FB, 'merriweather-latin-700-normal.woff')
W, H, S = 1280, 720, 2                             # draw at 2x, downsample at the end
RED, CREAM, INK = (200, 38, 36), (246, 240, 226), (14, 16, 16)
img = Image.new('RGB', (W*S, H*S), (22, 40, 42))
# background: teal radial + grid
bg = Image.new('L', (W*S, H*S), 0); d = ImageDraw.Draw(bg)
for r in range(0, 1400*S, 8*S):
    d.ellipse([W*S*.35-r, H*S*.45-r, W*S*.35+r, H*S*.45+r], outline=int(max(0, 60 - r/(1400*S)*60)), width=8*S)
bg = bg.filter(ImageFilter.GaussianBlur(40*S))
img = Image.composite(Image.new('RGB', img.size, (40, 66, 68)), Image.new('RGB', img.size, (14, 26, 28)), bg)
d = ImageDraw.Draw(img, 'RGBA')
for x in range(0, W*S, 26*S): d.line([(x, 0), (x, H*S)], fill=(120, 170, 170, 16), width=S)
for y in range(0, H*S, 26*S): d.line([(0, y), (W*S, y)], fill=(120, 170, 170, 16), width=S)

def photo(path, box_w, rot, crop=None, border=14):
    im = Image.open(path).convert('RGB')
    if crop: w, h = im.size; im = im.crop((int(crop[0]*w), int(crop[1]*h), int(crop[2]*w), int(crop[3]*h)))
    im = im.resize((box_w*S, int(box_w*S*im.height/im.width)), Image.LANCZOS)
    im = ImageOps.expand(im, border=border*S, fill=CREAM)
    return im, rot

def paste(img, ph, cx, cy, annot=None):
    im, rot = ph
    if annot: annot(ImageDraw.Draw(im, 'RGBA'), im.size)
    im = im.convert('RGBA').rotate(rot, Image.BICUBIC, expand=True)
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh.putalpha(im.getchannel('A').point(lambda a: int(a*.65)))
    sh = sh.filter(ImageFilter.GaussianBlur(14*S))
    x, y = int(cx*S - im.width/2), int(cy*S - im.height/2)
    img.paste(Image.new('RGB', im.size, (0, 0, 0)), (x+10*S, y+14*S), sh.getchannel('A'))
    img.paste(im, (x, y), im)

G = lambda n: os.path.join(ROOT, 'pearl', 'foto', n)
def stamp(img, text, cx, cy, rot, size=54):
    f = ImageFont.truetype(BLACK, size*S); tw = f.getbbox(text)[2]
    st = Image.new('RGBA', (tw + 60*S, int(size*2.05)*S), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
    sd.rectangle([6*S, 6*S, st.width-6*S, st.height-6*S], outline=RED+(235,), width=7*S)
    sd.text((30*S, int(size*.26)*S), text, font=f, fill=RED+(235,))
    st = st.rotate(rot, Image.BICUBIC, expand=True)
    img.paste(st, (int(cx*S - st.width/2), int(cy*S - st.height/2)), st)
# top-right: USS Arizona burning
paste(img, photo(G('13_uss-arizona-terbakar.jpg'), 300, 3, border=10), 1120, 100)
# big middle photo: Admiral Yamamoto (colour portrait)
paste(img, photo(G('04_laksamana-yamamoto.jpg'), 360, -2.5, crop=(.1, .17, .9, .5)), 1050, 315)
# bottom: torpedo attack at Ford Island, red circle on Battleship Row + stamp
def row_annot(dd, size):
    w, h = size
    dd.ellipse([w*.48, h*.22, w*.80, h*.50], outline=RED+(255,), width=6*S)
paste(img, photo(G('10_torpedo-di-ford-island.jpg'), 390, 2), 1060, 600, annot=row_annot)
stamp(img, 'KEJUTAN', 1140, 672, 10, 46)

# title
d = ImageDraw.Draw(img, 'RGBA')
def title(text, y, size, fill):
    f = ImageFont.truetype(BLACK, size*S)
    d.text((48*S, y*S), text, font=f, fill=fill, stroke_width=5*S, stroke_fill=INK)
title('SERANGAN YANG', 40, 70, CREAM)
title('MEMBANGUNKAN', 165, 78, CREAM)
title('AMERIKA', 320, 138, RED)
# subtitle box
d.rectangle([48*S, 568*S, 60*S+38*S, 574*S], fill=RED)
d.rectangle([0, 580*S, 700*S, 700*S], fill=(10, 14, 14, 225))
d.rectangle([0, 580*S, 10*S, 700*S], fill=RED)
f = ImageFont.truetype(BOLD, 30*S)
d.text((46*S, 598*S), 'Kisah Serangan Pearl Harbor', font=f, fill=CREAM)
d.text((46*S, 644*S), '7 Desember 1941', font=f, fill=CREAM)
out = img.resize((W, H), Image.LANCZOS)
out.save(os.path.join(HERE, 'Thumbnail_Pearl_Harbor.jpg'), quality=92)
out.save(os.path.join(HERE, 'Thumbnail_Pearl_Harbor.png'))
