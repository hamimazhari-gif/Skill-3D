# animated-3d-story-video — paket skill

Cara pakai (di sesi Claude Code baru):
1. Upload file zip ini.
2. Upload rekaman narasi (satu file per bahasa, mis. `Indonesia.wav`, `Inggris.wav`).
3. Tempel / upload teks narasinya (per bahasa).
4. Tulis: "Pasang skill ini dan buatkan videonya."

Claude akan memasang skill, membagi narasi menjadi shot (18-25 framing per menit), menyelaraskan waktu dengan audio,
membangun dunia 3D dengan pencahayaan sesuai cerita (waktu, cuaca, suasana) + akting karakter (ekspresi, pose, lompat, gemetar, dll.), menambah teks per kata, efek yang dipilih sesuai cerita (mis. percikan,
asap, debu, hujan, salju, petir, konfeti, kilatan, getaran kamera), memeriksa still, merender semua versi bahasa, membuat thumbnail + judul,
lalu mengirim hasilnya.

Isi:
- `SKILL.md` — aturan gaya, akting, alur kerja (dibaca Claude).
- `starter/` — proyek Remotion + three.js lengkap (kit 3D, karakter ekspresif, efek visual, props, alat bantu, sound effect), sudah memakai gaya terbaru (video "Bumi berhenti berputar").
- `example/bumi-berhenti-berputar/` — contoh terbaru + `style_reference.png` (gaya tokoh yang disetujui).
- `example/sejarah-uang/` — video pertama: naskah, rencana kamera, narasi, judul, thumbnail, PDF.

Gaya tokoh yang selalu dipakai (disetujui pengguna):
- Tokoh diberi bayangan: terang dari kiri atas, bayangan lembut di kanan bawah, bayangan kepala di dada.
- Baju tampak 3D: kilauan putih vertikal di kiri, kilau di dada, bayangan gelap di kedua tepi badan, lengan dan kaki.
- Tokoh menjatuhkan bayangan ke lantai/dinding dan ikut warna cahaya adegan.
- Tanpa lingkaran merah di wajah (tanpa pipi merah / rona).
- Marah atau kesal: tanda urat merah khas komik di dahi + alis tebal miring.
- Banyak ekspresi bergigi (meringis, menjerit, tertawa lebar, menggertakkan gigi).
- Badan panjang dengan kaki kurus panjang.
- Desain tokoh (bentuk kepala, rambut, proporsi, warna) berbeda di setiap video.
