import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kaz30 as K
K.build_cards(); keys, beats = K.build_camera()
wh, prev = [], None
for a, b, spec, k in beats:
    if spec != prev and a > 1: wh.append(round(a + .05, 2))
    prev = spec
cues = dict(duration=K.DUR,
            whoosh=wh,
            type=[[round(t0, 2), len(txt)] for _, txt, t0, _ in K.TAGS] + [[round(K.TITLE[0] + .2, 2), 23]] +
                 [[round(th[2] + .3, 2), len(th[0])] for th in K.THESIS],
            thud=[round(s[3], 2) for s in K.STAMPS] + [round(y[0], 2) for y in K.YEARS] + [round(K.TITLE[0] + 1.0, 2), round(K.END, 2)],
            scratch=[[round(e[3], 2), e[4]] for e in K.ELLS] + [[round(l[2], 2), l[3]] for l in K.LINES],
            tension=[K.P('3.1'), K.P('5.9'), K.P('5.14'), K.P('6.14'), K.P('10.15')],
            film=[[round(K.INS0, 2), round(K.INS1, 2)]])
json.dump(cues, open('cues.json', 'w'))
print(len(wh), 'whooshes', len(cues['type']), 'tags', len(cues['thud']), 'thuds')
