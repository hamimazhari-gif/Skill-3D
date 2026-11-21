# Skill-3D

Proyek video animasi 3D: **Three.js** (via React Three Fiber) untuk adegan 3D, **Remotion** untuk caption, audio, dan rendering video.

## Kebutuhan
- Node.js 18+ (disarankan 20/22)
- Browser untuk render diunduh otomatis oleh Remotion saat render pertama. FFmpeg sudah dibundel oleh Remotion.

## Mulai
```bash
npm install
npm run dev            # buka Remotion Studio (preview + edit props) di http://localhost:3000
npm run render         # render 1920x1080 -> out/video.mp4
npm run render:vertical  # render 1080x1920 (Reels/TikTok/Shorts) -> out/video-vertical.mp4
npm run render:still   # thumbnail PNG -> out/thumbnail.png
npm run render:server  # render di server/VM tanpa GPU (WebGL software, lebih lambat)
npm run lint           # cek TypeScript
```

## Struktur
```
src/
  index.ts              # entry point Remotion
  Root.tsx              # daftar komposisi (Main 16:9, Vertical 9:16), durasi, fps, props
  Main.tsx              # menyusun layer: 3D + judul + caption + audio
  scenes/Scene3D.tsx    # adegan Three.js (<ThreeCanvas> dari @remotion/three)
  components/Title.tsx  # judul animasi
  components/Captions.tsx  # caption gaya TikTok (kata aktif disorot)
  data/captions.ts      # teks caption + waktu (ms)
  fonts.ts              # font Inter lokal
public/
  audio/music.mp3       # musik demo (nada sintetis, ganti dengan milik Anda)
  fonts/                # file font Inter (SIL OFL)
remotion.config.ts      # pengaturan render (GL renderer, concurrency, dll.)
```

## Aturan penting animasi 3D di Remotion
- Animasikan **hanya** dari `useCurrentFrame()` (pakai `interpolate()` / `spring()`).
  Jangan pakai `useFrame()` R3F, `Date.now()`, atau `Math.random()` tanpa seed — hasil render akan berkedip/tidak sinkron.
- Selalu gunakan `<ThreeCanvas>` dari `@remotion/three`, bukan `<Canvas>` dari R3F.
- Model 3D (`.glb`/`.gltf`) taruh di `public/models/` lalu muat dengan `useGLTF(staticFile("models/nama.glb"))` dari `@react-three/drei`.
- Hindari aset yang diunduh dari internet saat render (mis. `<Environment preset="...">`) — taruh di `public/` supaya render stabil.

## Audio & caption
- Ganti `public/audio/music.mp3` dengan musik/voice-over Anda. Komponen `Audio` dari `@remotion/media`; volume bisa dianimasikan per frame (lihat `Main.tsx`).
- Edit `src/data/captions.ts` untuk teks dan waktu tiap kata. Bisa juga dari file `.srt` dengan `parseSrt()` dari `@remotion/captions`.
- Transkripsi otomatis voice-over: `npm i @remotion/install-whisper-cpp` (lihat https://www.remotion.dev/docs/install-whisper-cpp).

## Ubah durasi / resolusi
Edit `durationInFrames`, `fps`, `width`, `height` di `src/Root.tsx`. Props (judul, warna, musik on/off) bisa diubah langsung di Remotion Studio.

## Lisensi Remotion
Remotion gratis untuk individu dan perusahaan kecil (≤3 orang); perusahaan lebih besar butuh lisensi. Lihat https://www.remotion.dev/license.
