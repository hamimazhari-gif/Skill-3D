# Rencana kamera, cahaya & efek — Pak Darto dan bonggol pisang

## Desain karakter
- Preset **`bean`** (belum pernah dipakai; riwayat: classic, egg, pill → bean). Kepala bulat (aturan tetap), rambut jambul, badan panjang, kaki kurus.
- **Pak Darto**: kemeja hijau tua, celana cokelat, rambut hitam jambul.
- **Kakek Rahmat**: kemeja cokelat, rambut putih, kacamata, kumis putih tebal (baru), caping jerami (topi baru `caping`). Di teras malam tanpa caping.
- Fitur baru di `char.js`: topi `caping`, `mustache`, pose `vsign`, `setSit()` (duduk, kaki disembunyikan di balik meja/tumpukan).

## Lokasi (offset x)
| Lokasi | x | Shot |
|---|---|---|
| kebun (bedengan + bibit dalam polybag, pagar bambu, gubuk, pohon pisang) | 0 | 1, 2, 12–15 |
| tepi (pinggir kebun, tumpukan batang pisang, tumpukan bonggol) | 40 | 3–5 |
| teras (rumah Kakek, meja rendah, lampu minyak, papan resep, kalender) | 80 | 6–10 |
| pagi (halaman gubuk Darto, bangku, ayam, kalender) | 120 | 11 |

## Rencana cahaya
| Lokasi / beat | Waktu, cuaca, sumber cahaya | Preset |
|---|---|---|
| kebun shot 1–2 | gagal panen, suasana murung | overcast + MOODS.sad (pucat) |
| tepi shot 3–5 | "suatu sore" | sunset, pucat → hangat pada "emasnya" |
| teras shot 6–10 | "malam itu" | night (bulan), lampu minyak + lampu dinding (flame + fireLight), lebih ceria pada "jadi" |
| pagi shot 11 | dua minggu kemudian, pagi | dawn → day + joyful pada "asam" |
| kebun shot 12 | pagi, masih pucat | day dengan saturasi rendah |
| kebun shot 13–14 | "daun menghijau" | perlahan ke day + joyful |
| kebun shot 15 | penutup hangat | goldenHour + joyful |

## Rencana VFX
| Kata | Kejadian | Efek |
|---|---|---|
| habis | dompet kosong | kepulan debu kecil dari dompet |
| emasnya | bonggol = emas | bonggol menyala emas (emissive), glints, kilatan kuning, kamera bergetar kecil |
| menunjuk / bonggol | zoom cepat | glints emas + "ting" |
| cacah | mencacah | serpihan krem tiap ayunan golok, getaran kecil |
| air | gula masuk ember | percikan, tongkat mengaduk |
| jeriken | dituang | percikan |
| buka (×3) | buang gas | kepulan gas kecil, tutup naik-turun, kalender berganti hari |
| tape | bau tape | garis aroma bergelombang, glints |
| membuka (pagi) | tutup terlepas | kepulan, garis aroma, getaran kecil |
| menyiram | menyiram | aliran air + percikan |
| menghijau | daun hijau | glints hijau, kilatan lembut |
| akar / kuat | akar tumbuh | glints di toples |
| tidak jadi / menjual | cabut papan | debu, papan dilempar, getaran |
| penyelamat / bagikan | penutup | bonggol bercahaya + glints, konfeti |

## Musik & suara
- Musik latar dibuat dengan kode (`tools/music.py`, tanpa lisensi): sedih (A minor, piano pelan) 0–32 dtk → penuh harapan (C mayor) mulai malam di teras → hangat dan cerah mulai pagi (61,8 dtk), akord C panjang di akhir. Volume ±15 dB di bawah suara.
- SFX dari `public/sfx/`: whoosh di pergantian lokasi, pop pada barang, buzz pada "kerdil"/"mengecewakan", boom + chime pada "emasnya", ding ("ting!") pada "bonggol", klik pada "tutup" dan "simpan".

## Teks layar (permintaan pengguna)
Kartu bertepi tinta di atas layar: *Hampir menyerah…*, *"Emasnya kau buang di situ."*, LANGKAH 1–4, TANDA JADI, CARA PAKAI, kalimat penutup 🍌🌱, ditambah ikon SIMPAN dan BAGIKAN. Caption per kata tetap ada di 63% tinggi layar.

## Framing (40, lihat `src/shots.js`)
Close-up pembuka → makro bibit → track barisan → dompet + karung → close-up menangis → crane sore → low over pile → close-up → track Kakek → low angle → two-shot → close-up Kakek → Darto melompat → zoom cepat bonggol → crane teras → papan resep → meja → makro cacah → gula → makro ember → two-shot jeriken → kalender → makro gas → close-up dua jari → kalender 14 → tape → close-up Darto → crane pagi ke kalender → makro tutup → close-up berbinar → gelas ke ember → makro siram → crane time-lapse → makro akar → cabut papan → jeriken MOL → makro bonggol bercahaya → low angle two-shot → pull back + crane.
