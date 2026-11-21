import json, re
A = {
 'id': [('candy','Sebatang'),('forties','Tahun'),('built','Percy'),('school','Dia'),('oneday','Suatu'),('melt','meleleh'),('corn','Dia'),('pop','meletus'),('egg','Lalu'),('burst','Meledak'),('wave','Ternyata'),('hands','seperti'),('oven','Oven'),('piano','piano'),('today','Kini'),('popcorn','popcorn')],
 'en': [('candy','candy'),('forties','In'),('built','Percy'),('school','He'),('oneday','One'),('melt','melted'),('corn','So'),('pop','exploded'),('egg','Then'),('burst','burst'),('wave','You'),('hands','like'),('oven','His'),('piano','piano'),('today','Today'),('popcorn','popcorn')],
}
out = {}
for L, anchors in A.items():
    W = json.load(open(f'work/{L}/words.json')); P = json.load(open(f'work/{L}/phrases.json'))
    norm = lambda s: re.sub(r'[^a-z]', '', s.lower())
    i = 1; b = {'hook': 0}
    for k, a in anchors:
        while norm(W[i]['w']) != norm(a): i += 1
        if k == 'popcorn':  # last occurrence
            i = max(j for j, w in enumerate(W) if norm(w['w']) == 'popcorn')
        j = i - 1 if (L, k) == ('en', 'candy') else i
        b[k] = round(W[j]['s'] * 30); i += 1
    b['end'] = P['frames30']; out[L] = b
    print(L, b)
open('web/beats.js', 'w').write('export const BEATS = ' + json.dumps(out) + ';\n')
