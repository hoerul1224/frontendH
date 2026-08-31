# myPDG+ (Frontend)

Aplikasi kesehatan perwira PT Perta Daya Gas — mencatat dan memantau data kesehatan pekerja (DCU, MCU, Mini MCU, Konsultasi, Body Composition) dengan tiga tingkat akses (Tenaga Kesehatan, Petugas DCU, Pekerja).

## Tech Stack

- React (Vite)
- React Router untuk routing & protected routes
- Axios untuk HTTP request
- Context API untuk state management autentikasi
- Recharts untuk visualisasi grafik (DCU, Body Composition)
- CSS custom (tanpa framework)

## Fitur

- Register & Login Perwira
- Role-based UI dengan tiga tingkat akses:
  - **Tenaga Kesehatan** — akses penuh: kelola semua data kesehatan seluruh perwira + Manajemen User
  - **Petugas DCU** — kelola data DCU dan Body Composition seluruh perwira
  - **Pekerja** — lihat data kesehatan pribadi, isi Identitas dan Body Composition sendiri
- Dashboard personal dengan status pemeriksaan harian, kelaikan kerja, diagnosis MCU, dan detail DCU terakhir
- Menu Health: DCU (grafik + riwayat), MCU, Mini MCU (dengan keterangan lab otomatis), Riwayat Konsultasi, Body Composition
- Menu PDG Health (khusus Tenaga Kesehatan/Petugas DCU): kelola data seluruh perwira dengan pencarian autocomplete
- Menu Profile: Identitas (bisa diedit) dan Ganti