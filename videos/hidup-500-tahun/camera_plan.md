# Camera plan — Hidup 500 Tahun

## Desain karakter
- **Preset baru `lanky`** (yang terakhir dipakai: bean). Desainnya:
  - wajah bulat seperti video no-sleep;
  - rambut menyamping, alis tipis;
  - kaki lebih panjang (+0,08) dan lengan lebih ramping.
- **Gaya rambut baru `bald`** untuk kakek: botak, rambut putih di samping, kerutan di dahi.

## Lokasi (offset x)
street 0, party 40, campus 80, house 120, reunion 160, office 200, earth 240, warung 280, park 320.

## Pemeran
| Peran | Tampilan | Muncul di |
|---|---|---|
| Hero | jaket biru | semua shot kecuali 6–8 |
| Tamu A/B | — | pesta |
| Profesor | botak, kacamata | — |
| Sales | jas mustard | — |
| Bos | jas gelap, kacamata | — |
| Kakek | kardigan cokelat, botak, kacamata, tongkat | kantor dan warung |
| Penjual gorengan | — | warung |
| Anak kecil | skala 0,68 | taman |
| Keturunan reuni | 20 tokoh, skala 0,72–1,0 | reuni |
| Kerumunan | 6 tokoh | shot 7b |

## Dialog dengan lip-sync
Mulut hanya bergerak saat segmen suara (`voiced`) terdengar, dan ekspresi berganti 3–5 kali per kalimat.
- **Kalimat 4:** hero. smug → happy → cheesy (menunjuk bar HIDUP 50%) → toothy.
- **Kalimat 8:** sales. cheesy → toothy → excited → scheming.
- **Kalimat 12:** bos. annoyed → angry → irritated.
- **Kalimat 13:** kakek. nervous → grimace → worried → tired, plus gemetar di "lutut".
- **Kalimat 17:** kakek mengeluh. Mulutnya baru bergerak mulai kata "kakek".

## Framing (22)
Detailnya ada di `src/shots.js`. Transisi cream dip di setiap pergantian lokasi (shot 2–9); dari Bumi ke kerumunan hard cut.

## Cahaya dan efek
| Lokasi | Cahaya | Efek |
|---|---|---|
| Jalan | siang → tegang di "tunggu" | confetti di "lima ratus" |
| Pesta | hangat | confetti dan kilau |
| Kelas | dingin → tegang | debu dan guncangan saat skripsi jatuh |
| Rumah | siang → ceria | — |
| Reuni | golden hour | confetti |
| Kantor | dingin → tegang | — |
| Angkasa | gelap → merah di "kepenuhan" | guncangan dan percikan |
| Kerumunan | gurun dan bahaya | — |
| Warung | sunset | — |
| Taman | golden hour | kilau dan confetti |
