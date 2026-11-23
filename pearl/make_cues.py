import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kazph as K
K.build_cards(); keys, beats = K.build_camera()
wh, prev = [], None
for a, b, spec, k in beats:
    if spec != prev and a > 3: wh.append(round(a + .05, 2))
    prev = spec
wh += [round(b['card'] + .2, 2) for b in K.CHAP]
cues = dict(duration=K.DUR,
            whoosh=wh,
            type=[[round(t0, 2), len(txt)] for _, txt, t0, _ in K.TAGS] + [[round(K.TITLE[0] + .2, 2), 24]] +
                 [[round(q[0] + .2, 2), len(q[3])] for q in K.QUOTES] + [[round(th[2] + .3, 2), len(th[0])] for th in K.THESIS],
            thud=[round(b['card'] + .2, 2) for b in K.CHAP] + [round(s[3], 2) for s in K.STAMPS] + [round(y[0], 2) for y in K.YEARS] +
                 [round(K.TITLE[0] + 1.0, 2), round(K.END, 2)] + [round(c[0], 2) for c in K.COUNTERS],
            scratch=[[round(e[3], 2), e[4]] for e in K.ELLS] + [[round(l[2], 2), l[3]] for l in K.LINES],
            tension=[K.P(5), K.P(53), K.P(75), K.P(79), K.P(89), K.P(96)],
            engine=[[round(a, 2), round(b, 2)] for a, b in K.ENGINE])
json.dump(cues, open(os.path.join(K.HERE, 'cues.json'), 'w'))
print(len(wh), 'whooshes', len(cues['type']), 'tags', len(cues['thud']), 'thuds')
