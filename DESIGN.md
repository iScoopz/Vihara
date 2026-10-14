# DESIGN.md: Sistem Informasi Vihara MNSBDI

> Arah ini **diusulkan oleh agen** (Claude) pada 14 Oktober 2026 karena belum ada panduan resmi dari pengurus.
> Arah buatan agen cenderung aman dan kurang berkarakter. Kalau MNSBDI punya logo, warna resmi, atau contoh
> materi cetak, ganti bagian Palet dan Identitas di bawah dengan itu.

## Identitas

- **Produk:** alat kerja pengurus vihara (data umat, event, keuangan, inventaris) dan portal kecil untuk umat.
- **Pengguna:** pengurus sukarelawan, sering memakai HP, umumnya bukan orang teknis. Usia beragam, jadi keterbacaan lebih penting daripada gaya.
- **Karakter:** tenang, rapi, dapat dipercaya. Seperti buku catatan sekretariat yang tertata, bukan aplikasi startup.
- **Design read:** alat administrasi untuk pengurus vihara, bahasa visual netral dan tenang, dial ENERGY 1 / RHYTHM 1 / MOTION 1.

## Palet

Semua warna dipakai lewat token di `src/app/globals.css` (`bg-canvas`, `text-ink-2`, `bg-brand`, dst.). Token sudah otomatis berganti untuk mode gelap, jadi kode halaman tidak perlu `dark:` untuk warna dasar.

| Token | Peran | Alasan |
|---|---|---|
| `canvas` | latar halaman | abu sangat muda, memisahkan panel tanpa garis tebal |
| `surface` | panel, tabel, modal | putih bersih untuk data |
| `line` | garis dan border | tipis, cukup untuk memisahkan baris |
| `ink` / `ink-2` / `ink-3` | teks utama / sekunder / keterangan | ketiganya lolos WCAG AA di `canvas` dan `surface` |
| `brand` | ungu MNSBDI: tombol utama, navigasi aktif, satu angka fokus per layar | satu-satunya warna identitas |
| `gold` | status yang perlu perhatian (stok menipis, belum lunas, draf) | emas khas vihara, dipakai jarang supaya tetap terbaca sebagai peringatan |
| `ok` / `danger` | status sukses / bahaya | hanya untuk status, tidak untuk dekorasi |

Larangan: gradien, glow, latar keunguan gelap (`#160e29`, `#13092b`), dan warna hex yang ditulis langsung di halaman.

## Tipografi

- Font sistem (`-apple-system`, Segoe UI, Roboto). Alasannya: cepat, terbaca di HP murah, dan tidak perlu unduhan font.
- Bobot: 400 isi, 500 label, 600 judul dan tombol, 700 hanya untuk H1 halaman dan angka fokus. **Tidak memakai** `font-black` dan `font-extrabold`.
- Tidak memakai huruf kapital dengan tracking lebar. Label ditulis dengan huruf biasa.
- Ukuran: isi tabel `text-sm`, keterangan `text-xs`, H1 `text-xl`.
- Angka (uang, jumlah) memakai `tabular-nums`.

## Bentuk

- Radius: kontrol (tombol, input, badge) `rounded-lg`; panel `rounded-xl`; modal `rounded-2xl`. Tidak memakai pil, kecuali avatar bulat.
- Panel cukup memakai border `line` tanpa bayangan. Bayangan hanya untuk modal (elevasi di atas halaman).
- Tidak memakai `backdrop-blur`. Overlay modal cukup hitam transparan.
- Ikon (lucide, dependensi yang sudah ada) dipakai hanya bila membantu memindai, seperti navigasi dan tombol aksi. Tidak ada ikon hiasan di samping judul.
- Teks UI tanpa emoji dan simbol hiasan (➔, ⭐, ✓, ✕).

## Motif identitas

Satu **angka fokus** per layar, ditulis besar dengan warna `brand` dan `tabular-nums`, misalnya jumlah umat yang belum daftar atau total terkumpul. Angka lain tetap memakai warna `ink`.

## Komponen

Komponen bersama ada di `src/components/ui/kit.tsx`: `Button`, `Modal` (bisa ditutup dengan Escape, fokus terkunci, tombol tutup 44px), `Badge`, `PageHeader`, `Panel`, `Field`, `inputClass`, `selectClass`, `StateMessage`. Halaman baru wajib memakai komponen ini.

## Gerak

Gerak hanya berupa hover dan transisi warna 120ms. Tidak ada animasi masuk, pulse, atau animasi melayang.
