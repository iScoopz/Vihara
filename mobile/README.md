# Vihara MNSBDI (aplikasi HP)

Aplikasi Expo (React Native) untuk umat dan pengurus Vihara MNSBDI. Memakai database Supabase yang sama dengan web, jadi data selalu sama.

- **Umat:** lihat kegiatan dan kalender, daftar atau batal daftar, lihat riwayat, ubah nomor HP, alamat, dan kontak darurat.
- **Pengurus:** semua kegiatan termasuk draf, presensi (Hadir dan Lunas) per kegiatan, dan direktori data umat (hanya baca, dengan tombol telepon dan WhatsApp).

Hapus data, ubah biaya, dan pengelolaan lain tetap lewat web pengurus.

## Menjalankan di HP dengan Expo Go

1. Pasang **Expo Go** dari Play Store atau App Store. Versinya harus mendukung Expo SDK 58.
2. Di folder ini:

   ```bash
   npm install
   npx expo start
   ```

3. Pindai kode QR yang muncul di terminal: dengan aplikasi Kamera (iPhone) atau dengan Expo Go (Android). HP dan komputer harus di jaringan Wi-Fi yang sama. Kalau tidak bisa, jalankan `npx expo start --tunnel`.

Masuk memakai email dan kata sandi yang sama dengan web. Akun yang belum aktif bisa diaktifkan di halaman aktivasi web (tombol "Aktifkan akun" di aplikasi).

## Membuat APK (Android) dengan EAS

Butuh akun Expo gratis di https://expo.dev. Akun ini milik pengurus yang akan mengurus aplikasi; build berjalan di server Expo, tidak perlu Android Studio.

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Build pertama akan menanyakan pembuatan project EAS dan keystore Android: jawab ya, Expo menyimpannya di akun tadi. Setelah selesai, EAS memberi tautan unduh file `.apk` yang bisa dipasang langsung di HP Android. Profil `preview` ada di `eas.json`.

Untuk Play Store nanti: `eas build -p android --profile production` (menghasilkan `.aab`) dan akun Google Play Console. Untuk iPhone dibutuhkan akun Apple Developer berbayar.

## Konfigurasi

URL Supabase dan anon key ada di `app.json` bagian `expo.extra`. Keduanya memang publik; keamanan data diatur oleh Row Level Security di Supabase (`supabase/migrations/20261016_auth_rls.sql` di repo web). Jangan pernah menaruh service role key di aplikasi.

## Pemeriksaan

```bash
npx tsc --noEmit
npx expo-doctor
npx expo export --platform web
```
