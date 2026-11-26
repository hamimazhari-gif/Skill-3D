# Rencana kamera, cahaya & efek — Ganoderma

## Desain karakter
- Preset baru **`stout`** (riwayat: classic, egg, pill, bean, reed → stout): kepala bulat (aturan tetap), rambut jambul, anggota badan lebih tebal, kaki pendek.
- **Pak Hasan**: kemeja biru, topi hijau, kumis hitam. **Kakek Rahmat**: caping, rambut putih, kacamata, kumis putih.
- Pose baru: `pointL` (menunjuk dengan tangan kiri), `pointDown`; `setSit(2)` untuk berjongkok (kaki tertutup pakis).

## Lokasi
| Lokasi | x | Shot |
|---|---|---|
| kebun (kebun sawit Pak Hasan, pondok, tumpukan tunggul di sudut) | 0 | semua kecuali penampang |
| akar (penampang tanah: dua sawit, akar, busuk dalam batang, parit) | 40 | 6, 11 (sisipan), 15 (sisipan) |

## Rencana cahaya
| Beat | Cahaya |
|---|---|
| Shot 1 | malam tenang, bulan, cahaya jendela pondok + lampu minyak di tangan Hasan |
| Shot 2 | fajar, tense pada "busuk" |
| Shot 3–4 | "bulan kemudian": mendung, tense pada "sakit" |
| Shot 5–7 | siang; merah bahaya pada "Ganoderma" dan "sarangnya" |
| Shot 8–13 | siang cerah (lima langkah) |
| Shot 14–15 | golden hour, joyful pada "selamat", tense pada "terlambat", hangat pada "bagikan" |
| Penampang | siang + mystery; bahaya pada "terlambat" |

## Rencana VFX
| Kata | Efek |
|---|---|
| keras | pohon tumbang, debu, kilatan biru, getaran, boom |
| busuk | serpihan busuk |
| sakit / berikutnya | daun menguning bertahap (emissive kuning) |
| menggantung / tombak | pelepah jatuh menggantung kecokelatan, daun tombak tumbuh |
| cokelat / kipas | jamur kipas muncul satu per satu, glints |
| menggerogoti / menular / bersentuhan | busuk naik di dalam batang, akar memerah, percikan merah di titik sentuh |
| sarangnya | spora cokelat mengepul, kilatan merah |
| buang | jamur dikerok ke karung, spora |
| parit / memutus | parit melingkar tergali, celah gelap memutus akar, debu |
| dibongkar / tinggalkan | pohon terangkat dengan bola akar, X merah di tunggul |
| bersihkan / biarkan | tumpukan dicacah (serpihan, debu), bibit baru + glints |
| selamat | glints emas, kilatan hangat |

## Musik
`tools/music.py ... "1:sad,8:hope,14:warm"`: suram sejak malam → harapan saat Kakek mengajar → hangat saat kebun selamat.

## Teks layar
*Tanpa angin, tanpa hujan…*, *Beberapa bulan kemudian…*, kartu GEJALA, kartu GANODERMA, *Menular lewat akar yang bersentuhan*, *Sarangnya: tunggul tua yang membusuk*, LANGKAH 1–5, *Musuh paling berbahaya kadang tidak terlihat*, *Bagikan ke petani sawit yang kamu kenal 🌴* + ikon BAGIKAN.
