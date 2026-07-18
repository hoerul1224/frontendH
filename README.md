# Ticketing System (Frontend)

Aplikasi frontend untuk sistem ticketing/helpdesk, dengan autentikasi dan dashboard berbeda untuk customer dan admin.

## Tech Stack

- React (Vite)
- React Router untuk routing & protected routes
- Axios untuk HTTP request
- Context API untuk state management autentikasi
- CSS custom (tanpa framework)

## Fitur

- Register & Login
- Role-based UI: tampilan berbeda untuk customer dan admin
- Customer: membuat tiket, menambah komentar
- Admin: dashboard dengan statistik tiket, filter status, mengubah status tiket, menghapus tiket
- Protected routes (redirect ke login kalau belum autentikasi)

## Instalasi Lokal

1. Clone repo ini
   \`\`\`
   git clone https://github.com/hoerul1224/frontendH.git
   cd frontend-product
   \`\`\`

2. Install dependencies
   \`\`\`
   npm install
   \`\`\`

3. Jalankan aplikasi
   \`\`\`
   npm run dev
   \`\`\`

Aplikasi akan berjalan di `http://localhost:5173`

> Catatan: aplikasi ini butuh backend API berjalan (lihat [repo backend](https://github.com/hoerul1224/backendH)) supaya bisa berfungsi penuh.

## Live Demo

`https://your-app.vercel.app` *(update setelah deploy)*

## Author

Hoerul Holmes