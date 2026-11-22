# Tritone grade: shadows dark brown -> midtones grey -> highlights parchment.
import sys, os, numpy as np
from PIL import Image
SRC, DST = sys.argv[1], sys.argv[2]; os.makedirs(DST, exist_ok=True)
stops = np.array([0.0, 0.5, 1.0])
cols = np.array([[46, 30, 20],      # cokelat tua
                 [128, 122, 114],   # abu-abu
                 [238, 226, 198]])  # parchment
lut = np.stack([np.interp(np.linspace(0, 1, 256), stops, cols[:, c]) for c in range(3)], 1).astype(np.uint8)
for f in sorted(os.listdir(SRC)):
    if not f.endswith('.jpg'): continue
    a = np.asarray(Image.open(os.path.join(SRC, f)).convert('RGB')).astype(float)
    y = a @ [0.299, 0.587, 0.114]
    lo, hi = np.percentile(y, [0.5, 99.5])
    y = np.clip((y - lo) / max(hi - lo, 1) * 255, 0, 255).astype(np.uint8)
    Image.fromarray(lut[y]).save(os.path.join(DST, f), quality=93)
    print(f)
