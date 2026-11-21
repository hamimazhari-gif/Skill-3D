import json, re
A = {
 'id': [('gta','GTA',0),('superhero','Lebih',0),('cost','Biaya',0),('first','Tapi',0),('weeks','Dibuat',0),('scientist','Oleh',0),('bored','bosan',0),('argue','ya',-1),('ny','New',0),('dull','Pamerannya',0),('photos','Foto',0),('charts','Grafik',0),('machines','Mesin',0),('grab','Maka',0),('tennis','tenis',-1),('screen','layar',-1),('net','Netnya',0),('ball','Bolanya',0),('boxes','Dua',0),('knob','kenop',0),('button','tombol',0),('hundreds','Ratusan',0),('nextyear','berikutnya',-1),('moon','Bulan',0),('jupiter','Jupiter',0),('apart','dibongkar',0),('patents','sudah',-1),('thisone','Yang',0),('never','Tidak',0),('simple','sederhana',0),('later','Enam',0),('city','kota',0),('buttons','Dua',0),('line','Dan',0),('preorders','Kini',0),('still','Kita',0),('question','Game',0)],
 'en': [('gta','Grand',0),('superhero','More',0),('cost','reportedly',-1),('first','But',0),('weeks','built',-2),('scientist','By',0),('bored','boredom',0),('argue','yes',-1),('ny','New',0),('dull','exhibits',-1),('photos','Photos',0),('charts','Charts',0),('machines','Humming',0),('grab','So',0),('tennis','Tennis',0),('screen','On',0),('net','net',-1),('ball','ball',-1),('boxes','Two',0),('knob','knob',0),('button','button',0),('hundreds','Hundreds',0),('nextyear','next',-1),('moon','Moon',0),('jupiter','Jupiter',0),('apart','apart',0),('patents','had',-1),('thisone','This',0),('never','never',0),('simple','simple',0),('later','Sixtyeight',0),('city','city',0),('buttons','Those',0),('line','And',0),('preorders','Now',0),('still','We',0),('question','So',0)],
}
out = {}
norm = lambda s: re.sub(r'[^a-z]', '', s.lower())
for L, anchors in A.items():
    W = json.load(open(f'work/{L}/words.json')); P = json.load(open(f'work/{L}/phrases.json'))
    i = 0; b = {'hook': 0}
    for k, a, off in anchors:
        while norm(W[i]['w']) != norm(a): i += 1
        b[k] = round(W[i + off]['s'] * 30); i += 1
    b['end'] = P['frames30']; out[L] = b
    print(L, b)
open('web/beats.js', 'w').write('export const BEATS = ' + json.dumps(out) + ';\n')
