# Playwright E2E RMS — Tahap 0 dan 1

Suite ini menjalankan tiga frontend dan API terhadap database SQL Server khusus E2E. Port E2E terpisah dari server pengembangan: internal `5183`, exam `5184`, candidate `5185`, dan API `5161`. smtp4dev tetap dijalankan terpisah pada port `5000`/`2525`. Jangan gunakan connection string database pengembangan.

## Persiapan lokal

1. Gunakan SQL Server Docker di `127.0.0.1:14331` dengan database khusus bernama `RmsDBTest`. Nilai `RMS_E2E_CONNECTION_STRING` wajib menunjuk ke database tersebut; runner menolak `RmsDB` dan nama lain. Contoh PowerShell (isi password sendiri):

   ```powershell
   $env:RMS_E2E_CONNECTION_STRING = 'Data Source=127.0.0.1,14331;Database=RmsDBTest;User ID=sa;Password=<password>;Encrypt=False;TrustServerCertificate=True'
   ```

2. Dari folder `BE-RMS-MII/WEBAPI`, jalankan `smtp4dev --smtpport 2525 --urls http://localhost:5000`. SMTP dan web/API smtp4dev harus tersedia sebelum tes dimulai.
3. Dari `RMS-MII`, instal dependency dengan `pnpm install` dan browser dengan `pnpm exec playwright install chromium`. Pastikan SDK .NET dan `dotnet ef` tersedia.
4. Dari `RMS-MII`, jalankan `pnpm e2e:build-api`, lalu `pnpm e2e:db` untuk menerapkan migration **hanya pada `RmsDBTest`**. Konfigurasi build `E2E` memakai output terpisah, sehingga backend pengembangan boleh tetap berjalan.
5. Jalankan `pnpm e2e` dari `RMS-MII`. Runner menolak server lain yang sudah memakai port E2E. Server pengembangan pada port 5160/5173/5174/5175 boleh tetap berjalan.

Untuk tes login internal pada Tahap 1, isi `RMS_E2E_INTERNAL_PASSWORD` dengan password akun seed di `RmsDBTest`. Username default adalah `hr_manager` dan `budi_santoso`; bila akun uji berbeda, isi `RMS_E2E_HR_USERNAME` dan `RMS_E2E_INTERVIEWER_USERNAME`. Contoh:

```powershell
$env:RMS_E2E_INTERNAL_PASSWORD = '<password-akun-seed>'
pnpm e2e
```

Backend dijalankan dengan `Seed__ResetToCheckpointOnStartup=false`. Seeder normal masih berjalan pada database E2E untuk menyiapkan data dasar. Perintah `e2e:db` tidak melakukan reset. Jangan menjalankan `--seed-reset` atau `--reset-checkpoint` terhadap database pengembangan.

## Yang diperiksa sekarang

Smoke test memeriksa endpoint lowongan publik, API inbox smtp4dev, halaman login internal, halaman lowongan kandidat, dan halaman tautan exam tidak valid.

Tes sesi memeriksa login dan pemulihan sesi HR/interviewer, context browser terpisah, OTP kandidat yang diambil dari smtp4dev, cookie portal dan CORS, serta penolakan akses privat tanpa sesi. Setiap kandidat uji memakai email unik; fixture tidak menghapus pesan smtp4dev. Tes autentikasi menonaktifkan trace dan screenshot karena form memasukkan password dan OTP. Alur lamaran, tes, dan interview akan ditambahkan pada tahap berikutnya.

Laporan HTML muncul di `playwright-report/`; trace dan screenshot kegagalan di `test-results/`. Keduanya diabaikan Git.
