# Portal kandidat RMS

Aplikasi mandiri yang mengikuti shared UI aplikasi internal. Masuk dengan OTP email dari `/login`. Portal kandidat dan exam memakai sesi kandidat yang sama. Sesi akun internal dikelola terpisah.

## Menjalankan

Dari root FE: `pnpm dev:candidate` (port 5175). Build: `pnpm build:candidate`.
Buka `http://localhost:5175/jobs` untuk melihat lowongan dan mengirim lamaran.
Buka `/login` atau tautan undangan `/portal/{candidateId}`. Setelah verifikasi email, kandidat baru dapat mengisi profil. Profil baru muncul di Candidate Pool HR setelah lamaran pertama. Expected salary dapat diisi pada masing-masing lamaran.

Jalankan `pnpm dev:exam` (port 5174) agar tautan exam lokal dapat dibuka.
Untuk mengganti alamat API atau exam, gunakan `.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:5160/api
VITE_EXAM_URL_TEMPLATE=http://localhost:5174/portal/{candidateId}/stages/{stageId}/test
```

Build produksi perlu `VITE_EXAM_URL_TEMPLATE` yang mengarah ke host exam. Jika URL belum disetel, portal menampilkan arahan untuk melihat undangan HR. Portal tidak memanggil GET test atau POST submit test.

Setel `VITE_CANDIDATE_PORTAL_URL` di aplikasi exam ke URL portal kandidat. Kedua aplikasi harus memakai host API yang sama. Untuk cookie sesi lintas origin, gunakan HTTPS dan host dalam situs yang sama serta daftarkan origin portal dan exam di `Cors:AllowedOrigins` API. Saat pengembangan gunakan `localhost` secara konsisten.

## Routing deployment dan email

Semua route SPA harus fallback ke index.html. Email backend saat ini masih menggunakan `App:FrontendUrl`, termasuk tautan exam. Jangan mengubah konfigurasi tersebut secara global hanya untuk aplikasi ini.
Pada host undangan yang sudah ada, arahkan `/portal/{candidateId}`, `/portal/{candidateId}/sessions/{id}` dan `/portal/{candidateId}/sessions/{id}/submission` ke aplikasi kandidat. Route `/portal/{candidateId}/stages/{id}/test` tetap menjadi milik aplikasi exam. Konfigurasi reverse proxy/hosting perlu disepakati saat deployment. Dev lokal dapat membuka route kandidat pada port 5175 langsung.

## Kontrak dan perilaku

- GET tasks untuk ringkasan, pipeline, sesi, nama interviewer dan status permintaan reschedule.
- POST confirm/reschedule/submission dengan kontrak request lama.
- Take-home tetap menggunakan deadline dan tautan pada InterviewSession. Instruksi dikirim melalui email.
- Batas tautan take-home mengikuti database/API yang ada.
- Waktu jadwal ditampilkan WIB; input usulan mengikuti zona perangkat dan dikirim sebagai UTC.
- Data diperbarui ketika kembali ke halaman, setelah aksi, atau lewat tombol Perbarui.

## Verifikasi

`pnpm --filter @rms/candidate build` dan `pnpm --filter @rms/candidate lint`.
Browser smoke test: jalankan server lalu `node apps/candidate/tests/portal.browser.mjs` dengan Playwright tersedia. Opsional: `PLAYWRIGHT_MODULE` (lokasi modul), `CHROME_PATH`, `PORTAL_URL`, `SCREENSHOT_DIR`. Test menggunakan mock HTTP, bukan menulis database atau mengirim email.

Pengujian API dengan database dan email nyata tetap diperlukan di lingkungan integrasi tim, terutama dua permintaan serentak. Tidak ada perubahan mekanisme konfirmasi interviewer.
