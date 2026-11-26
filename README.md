# Undangan Ulang Tahun — Erlan Nauval Aqilah ke-18

Website undangan digital (**mobile-first**) untuk pesta ulang tahun ke-18.
Dibuat sebagai proyek **AI-Assisted Programming** dengan penyesuaian konten, warna, tipografi, dan perbaikan bug tata letak.

## Fitur

- **Cover / Hero Cover** — nama tamu **dinamis dari URL** (`?name=`), tombol **Buka Undangan** dengan transisi.
- **Informasi acara & Hitung Mundur** — countdown hari/jam/menit/detik real-time.
- **Simpan ke Kalender** — tautan Google Calendar otomatis dari data acara.
- **Navigasi lokasi** — peta Google Maps (embed) + tombol arah.
- **Amplop digital** — tombol salin nomor rekening (copy to clipboard).
- **Galeri foto** — minimal 4 foto dengan animasi saat digulir.
- **Dress code**.
- **Formulir RSVP & Buku Tamu** — konfirmasi kehadiran + ucapan, tersimpan di database.
- **Kontrol audio** — tombol melayang play/pause musik; musik mulai otomatis saat undangan dibuka.
- **Desain responsif** mobile-first (360–414px tanpa overflow horizontal).

## Struktur proyek

```
.
├── index.html          # Halaman undangan
├── style.css           # Gaya halaman
├── script.js           # Logika (nama tamu, countdown, RSVP, audio, dll.)
├── config.js           # Data acara & pengaturan database
├── db.js               # Lapisan penyimpanan (supabase / ntfy)
├── db/
│   └── schema.sql      # Skema tabel Supabase
└── assets/
    ├── bootstrap.min.css
    ├── 1.svg … 6.svg   # Ilustrasi galeri
    ├── musik.mp3        # Musik latar
    └── fonts/           # Font lokal (Playfair Display, Lora, Great Vibes)
```

## Menjalankan di lokal

Cukup buka `index.html`, atau jalankan server statis:

```bash
python -m http.server 8080
```

lalu buka `http://localhost:8080`.

## Konfigurasi

Data acara & database ada di **`config.js`**:

```js
acara: {
  name: 'Erlan Nauval Aqilah',
  age: 18,
  dateText: 'Senin, 21 Juni 2027',
  startIso: '2027-06-21T07:00:00+07:00',
  timeText: '07.00 - 11.55 WIB',
  venue: 'Rumah Erlan, Perumahan Griya Serpong, Kademangan, Setu',
  bank: 'BCA 1234567890 a.n. Erlan Nauval Aqilah',
  mapQuery: 'Gedung DPR Jakarta'
}
```

## Database (Supabase)

1. Buat proyek di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, tempel isi `db/schema.sql`, lalu **Run**.
3. Buka **Project Settings → API**, salin **Project URL** dan **anon / publishable key** ke `config.js`:

```js
database: {
  mode: 'supabase',
  url: 'https://xxxxx.supabase.co',
  anonKey: 'ISI_ANON_KEY_DARI_SUPABASE',
  ...
}
```

> Anon/publishable key **aman** dipakai di frontend; keamanan data dijaga oleh Row Level Security (policy sudah ada di `schema.sql`). Jangan pakai **service_role/secret key** di sini.

## Deploy

### Vercel
1. Push repo ke GitHub (sudah).
2. Import repo di [vercel.com](https://vercel.com) — framework preset **Other**, tanpa build command.
3. Deploy, lalu bagikan URL-nya.

### GitHub Pages
1. Repo → **Settings → Pages**.
2. Source: branch `main`, folder `/ (root)`.
3. Situs tersedia di `https://<username>.github.io/<repo>/`.

## Contoh link tamu

```
https://<domain>/?name=Budi%20Santoso,S.Kom.,Keluarga
```

## Teknologi

HTML5, CSS3 (Bootstrap lokal + CSS kustom), **JavaScript vanilla**, Google Fonts (self-host `woff2`), Supabase.