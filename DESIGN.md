# DESIGN.md: Sistem Informasi Vihara MNSBDI

> Arah ini **diusulkan oleh agen** (Claude) pada 14 Oktober 2026 karena belum ada panduan resmi dari pengurus.
> Arah buatan agen cenderung aman dan kurang berkarakter. Kalau MNSBDI punya logo, warna resmi, atau contoh
> materi cetak, ganti bagian Palet dan Identitas di bawah dengan itu.

## Identitas

- **Produk:** alat kerja pengurus vihara (data umat, event, keuangan, inventaris) dan portal kecil untuk umat.
- **Pengguna:** pengurus sukarelawan, sering memakai HP, umumnya bukan orang teknis. Usia beragam, jadi keterbacaan lebih penting daripada gaya.
- **Karakter:** tenang, rapi, dapat dipercaya, dengan kehangatan vihara. Seperti buku kas sekretariat bersampul ungu tua dengan judul cetak serif, bukan aplikasi startup.
- **Design read:** alat administrasi untuk pengurus vihara, bahasa visual hangat dan berwibawa, dial ENERGY 2 / RHYTHM 1 / MOTION 1.
- **Revisi 16 Okt 2026:** pengurus menilai versi pertama terlalu datar. Ditambahkan zona navigasi ungu tua, kanvas kertas hangat, panel yang terangkat, serif untuk judul, dan emas sebagai segel identitas.

## Palet

Semua warna dipakai lewat token di `src/app/globals.css` (`bg-canvas`, `text-ink-2`, `bg-brand`, dst.). Token sudah otomatis berganti untuk mode gelap, jadi kode halaman tidak perlu `dark:` untuk warna dasar.

| Token | Peran | Alasan |
|---|---|---|
| `canvas` | latar halaman | krem kertas hangat; panel putih tampak terangkat di atasnya |
| `surface` | panel, tabel, modal | putih bersih untuk data |
| `line` | garis dan border | tipis, cukup untuk memisahkan baris |
| `ink` / `ink-2` / `ink-3` | teks utama / sekunder / keterangan | ketiganya lolos WCAG AA di `canvas` dan `surface` |
| `brand` | ungu MNSBDI: tombol utama, navigasi aktif, satu angka fokus per layar | satu-satunya warna identitas |
| `gold` | status yang perlu perhatian (stok menipis, belum lunas, draf) | emas khas vihara, dipakai jarang supaya tetap terbaca sebagai peringatan |
| `gold-line` | segel "MN", garis pembuka judul, ikon menu aktif, CTA di zona ungu | emas sebagai identitas, bukan teks |
| `nav` / `nav-ink` / `nav-ink-2` | sidebar admin, header portal umat, band beranda, panel login | ungu tua memisahkan bingkai aplikasi dari area kerja |
| `ok` / `danger` | status sukses / bahaya | hanya untuk status, tidak untuk dekorasi |

Larangan: gradien, glow, latar keunguan gelap (`#160e29`, `#13092b`), dan warna hex yang ditulis langsung di halaman.

## Tipografi

- **Judul (h1, h2, angka fokus): Newsreader** (serif, self-hosted lewat next/font). Alasannya: mengingatkan pada buku paritta cetak, terasa formal dan tenang; hanya dipakai untuk judul agar tetap ringan.
- **Isi:** font sistem (`-apple-system`, Segoe UI, Roboto). Alasannya: cepat dan terbaca di HP murah.
- Bobot: 400 isi, 500 label, 600 judul dan tombol, 700 hanya untuk H1 halaman dan angka fokus. **Tidak memakai** `font-black` dan `font-extrabold`.
- Tidak memakai huruf kapital dengan tracking lebar. Label ditulis dengan huruf biasa.
- Ukuran: isi tabel `text-sm`, keterangan `text-xs`, H1 `text-xl`.
- Angka (uang, jumlah) memakai `tabular-nums`.

## Bentuk

- Radius: kontrol (tombol, input, badge) `rounded-lg`; panel `rounded-xl`; modal `rounded-2xl`. Tidak memakai pil, kecuali avatar bulat.
- Elevasi tiga tingkat: kanvas, panel (`shadow-panel`, satu langkah di atas kanvas), lalu modal/kartu login (`shadow-raised`). Tombol utama memakai `shadow-button` agar terasa bisa ditekan.
- Tidak memakai `backdrop-blur`. Overlay modal cukup hitam transparan.
- Ikon (lucide, dependensi yang sudah ada) dipakai hanya bila membantu memindai, seperti navigasi dan tombol aksi. Tidak ada ikon hiasan di samping judul.
- Teks UI tanpa emoji dan simbol hiasan (➔, ⭐, ✓, ✕).

## Motif identitas

- **Garis emas pendek** di atas setiap judul halaman.
- **Segel "MN"** emas di atas ungu tua.
- Satu **angka fokus** per layar dalam serif besar berwarna `brand` (komponen `FocalNumber`). Angka lain tetap `ink`.

## Komponen

Komponen bersama ada di `src/components/ui/kit.tsx`: `Button`, `Modal` (bisa ditutup dengan Escape, fokus terkunci, tombol tutup 44px), `Badge`, `PageHeader`, `Panel`, `Field`, `inputClass`, `selectClass`, `StateMessage`. Halaman baru wajib memakai komponen ini.

## Gerak

Gerak hanya berupa hover dan transisi warna 120ms. Tidak ada animasi masuk, pulse, atau animasi melayang.
