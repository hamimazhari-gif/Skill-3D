"""Album images -> foto/NN_name.jpg: trim scanner margins (near-white/near-black borders), keep original colours."""
import os, numpy as np
from PIL import Image
NAMES = ['pearl-harbor-dari-udara-1941', 'kapal-komodor-perry', 'jepang-masuk-saigon-1941', 'laksamana-yamamoto',
         'armada-kapal-induk-jepang', 'uss-ward', 'radar-opana', 'lepas-landas-dari-shokaku', 'lapangan-udara-terbakar',
         'torpedo-di-ford-island', 'battleship-row-dari-atas', 'lambung-kapal-terbalik', 'uss-arizona-terbakar',
         'langit-penuh-tembakan', 'ledakan-uss-shaw', 'uss-nevada-kandas', 'uss-oklahoma-terbalik', 'doris-miller-navy-cross',
         'battleship-row-10-desember', 'pidato-roosevelt-kongres', 'hiryu-terbakar-di-midway', 'uss-arizona-memorial']
SRC = ['img-000.jpg', 'img-001.jpg', 'img-002.jpg', 'img-003.jpg', 'img-005.jpg', 'img-006.jpg', 'img-007.png', 'img-008.jpg',
       'img-009.jpg', 'img-010.jpg', 'img-011.jpg', 'img-012.png', 'img-013.jpg', 'img-014.jpg', 'img-015.jpg', 'img-016.jpg',
       'img-017.jpg', 'img-018.jpg', 'img-019.jpg', 'img-020.jpg', 'img-021.jpg', 'img-022.jpg']
EXTRA = {2: (0, 0, 1, .86), 4: (0, 0, 1, .93)}      # Perry scroll: drop colour bar; Yamamoto: drop bottom mount
POST = {6: (.02, .03, .965, .955), 8: (.03, .03, .965, .975), 10: (.01, .01, .99, .955), 15: (.03, .03, .975, .975),
        18: (.02, .015, .955, .985), 21: (.07, .065, .96, .955), 19: (.01, .01, .985, .99)}
os.makedirs('foto', exist_ok=True)
def trim(im):
    g = np.asarray(im.convert('L')).astype(float)
    def edge(a):                                   # first row index where content starts
        for i, row in enumerate(a):
            if not (row.mean() > 228 and row.std() < 18) and not (row.mean() < 25 and row.std() < 12): return i
        return 0
    t = edge(g); b = g.shape[0] - edge(g[::-1]); l = edge(g.T); r = g.shape[1] - edge(g.T[::-1])
    m = 6                                          # a few extra pixels to lose the scan edge
    return im.crop((l + m, t + m, r - m, b - m))
for i, (n, s) in enumerate(zip(NAMES, SRC), 1):
    im = Image.open(os.path.join('src', s)).convert('RGB')
    if i in EXTRA:
        x0, y0, x1, y1 = EXTRA[i]; im = im.crop((int(x0*im.width), int(y0*im.height), int(x1*im.width), int(y1*im.height)))
    im = trim(im)
    if i in POST:
        x0, y0, x1, y1 = POST[i]; im = im.crop((int(x0*im.width), int(y0*im.height), int(x1*im.width), int(y1*im.height)))
    im.save(f'foto/{i:02d}_{n}.jpg', quality=93)
    print(i, n, im.size)
