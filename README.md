# FardTV

Katalog film & streaming berbasis TMDB. Dark mode, tanpa iklan, multi-server player. Deploy-ready untuk Vercel.

## Menjalankan Lokal

```bash
npm install
npm run dev      # development
npm run build && npm run start   # production
```

Buka [http://localhost:3000](http://localhost:3000).

## Deploy ke Vercel

1. Push repo ini ke GitHub
2. Import di [vercel.com/new](https://vercel.com/new) — framework terdeteksi otomatis (Next.js), nama project bisa diisi `fardhanflix`
3. Tambahkan Environment Variables di dashboard Vercel:

| Key | Value |
|---|---|
| `TMDB_API_KEY` | API key (v3) dari TMDB |
| `TMDB_READ_ACCESS_TOKEN` | API Read Access Token (v4, JWT panjang) |
| `NEXT_PUBLIC_TMDB_IMAGE_BASE` | `https://image.tmdb.org/t/p` |

4. Deploy

## Mendapatkan TMDB API Key

1. Buat akun di [themoviedb.org](https://www.themoviedb.org/)
2. **Settings > API**
3. Request API key (pilih "Developer")
4. Salin **API Read Access Token** (JWT panjang) — dipakai untuk `TMDB_READ_ACCESS_TOKEN`

## Server Player

Multi-server embed dengan fallback. Klik nama server di atas player untuk ganti jika satu server down:

| # | Provider | Catatan |
|---|----------|---------|
| 1 | VidFast | Paling stabil |
| 2 | VidLink | Stabil |
| 3 | VidSrc.pm | |
| 4 | VidSrc.to | |
| 5 | VidSrc.cc | |
| 6 | 2Embed | |
| 7 | NontonGo | Konten Indonesia/Asia |
| 8 | AutoEmbed | |
| 9 | MoviesAPI | |
| 10 | Smashy | |

Player **tanpa sandbox** — hampir semua provider embed menolak iframe sandboxed ("Playback blocked").

## Struktur

```
app/          — Next.js App Router (halaman)
components/   — UI components (player, card, carousel, dst.)
lib/tmdb.ts   — TMDB API helper (id-ID + fallback en-US)
_old-laravel/ — arsip project Laravel lama (tidak dipakai)
```
