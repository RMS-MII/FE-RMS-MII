# Portal kandidat RMS

Aplikasi mandiri yang mengikuti shared UI aplikasi internal. Akses langsung lewat CandidateId; tidak memakai akun/token internal.

## Menjalankan

Dari root FE: `pnpm dev:candidate` (port 5175). Build: `pnpm build:candidate`.
Buka `/portal/{candidateId}` menggunakan ID kandidat dari database. Aplikasi tidak menyertakan data demo saat dijalankan normal.

Konfigurasi `.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:5160/api
# Opsional, isi setelah route halaman disepakati dengan pemilik web exam:
# VITE_EXAM_URL_TEMPLATE=https://exam.example/portal/{candidateId}/stages/{stageId}/test
```

Tanpa URL exam, portal menampilkan arahan untuk melihat undangan HR. Portal tidak memanggil GET test atau POST submit test.

## Routing deployment dan email

Semua route SPA harus fallback ke index.html. Email backend saat ini masih menggunakan `App:FrontendUrl`, termasuk tautan exam. Jangan mengubah konfigurasi tersebut secara global hanya untuk aplikasi ini.
Pada host undangan yang sudah ada, arahkan `/portal/{candidateId}`, `/portal/{candidateId}/sessions/{id}` dan `/portal/{candidateId}/sessions/{id}/submission` ke aplikasi kandidat. Route `/portal/{candidateId}/stages/{id}/test` tetap menjadi milik aplikasi exam. Konfigurasi reverse proxy/hosting perlu disepakati saat deployment. Dev lokal dapat membuka route kandidat pada port 5175 langsung.

## Kontrak dan perilaku

- GET tasks untuk ringkasan, pipeline, sesi, nama interviewer dan status permintaan reschedule.
- POST confirm/reschedule/submission dengan kontrak request lama.
- Take-home tetap menggunakan deadline dan tautan pada InterviewSession. Instruksi dikirim melalui email.
- Batas tautan 100 karakter mengikuti database/API yang ada. Tidak ada migrasi schema.
- Waktu jadwal ditampilkan WIB; input usulan mengikuti zona perangkat dan dikirim sebagai UTC.
- Data diperbarui ketika kembali ke halaman, setelah aksi, atau lewat tombol Perbarui.

## Verifikasi

`pnpm --filter @rms/candidate build` dan `pnpm --filter @rms/candidate lint`.
Browser smoke test: jalankan server lalu `node apps/candidate/tests/portal.browser.mjs` dengan Playwright tersedia. Opsional: `PLAYWRIGHT_MODULE` (lokasi modul), `CHROME_PATH`, `PORTAL_URL`, `SCREENSHOT_DIR`. Test menggunakan mock HTTP, bukan menulis database atau mengirim email.

Pengujian API dengan database dan email nyata tetap diperlukan di lingkungan integrasi tim, terutama dua permintaan serentak. Tidak ada perubahan mekanisme konfirmasi interviewer.
