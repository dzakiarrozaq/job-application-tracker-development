# 🚀 PushToOffer

> **A Personal Developer Tool for Job Hunting**

PushToOffer adalah aplikasi pelacakan lamaran kerja (*Job Application Tracker*) modern yang dirancang khusus untuk membantu para *developer* dan profesional memantau setiap tahapan seleksi karir mereka dengan rapi, otomatis, dan elegan.

## ✨ Fitur Utama

- **📊 Dynamic Kanban Board**: Pindahkan kartu lamaran Anda antar tahapan seleksi (Applied, Interview, Offer, Rejected) semudah *drag-and-drop*.
- **🤖 Smart Automations**: Kartu lamaran akan otomatis melompat ke kolom "Wawancara" saat Anda menambahkan jadwal tes/wawancara.
- **📅 Interactive Calendar**: Pantau jadwal tes, wawancara, atau pertemuan *tech-test* Anda dalam kalender interaktif bulanan.
- **📈 Insightful Dashboard**: Pantau rasio keberhasilan (Total Lamaran vs Tawaran Kerja) Anda dengan visualisasi grafik yang memanjakan mata.
- **🔐 Google Authentication**: Masuk dan daftar dengan aman dan super cepat menggunakan akun Google (didukung oleh *NextAuth*).
- **💌 Auto Welcome Email**: Sistem akan mengirimkan email sambutan otomatis (menggunakan *Resend*) kepada pendaftar baru.
- **🌓 Dark Mode / Light Mode**: Tampilan UI premium yang ramah di mata untuk mode gelap maupun terang.

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan arsitektur modern (*Production-Ready*):
- **Framework**: Next.js 15 (App Router, Server Components & Server Actions)
- **Styling**: Tailwind CSS & Framer Motion
- **Database**: PostgreSQL (Drizzle ORM)
- **Authentication**: Auth.js / NextAuth v5 (Google OAuth)
- **Email Service**: Resend API

## 🚀 Cara Menjalankan di Komputer Lokal

1. **Kloning repositori ini**
   ```bash
   git clone https://github.com/username-anda/pushtooffer.git
   cd pushtooffer
   ```

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Buat file `.env` di direktori utama, dan isi dengan kredensial berikut:
   ```env
   AUTH_SECRET="buat_string_acak_disini"
   DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
   GOOGLE_CLIENT_ID="google_client_id_anda"
   GOOGLE_CLIENT_SECRET="google_client_secret_anda"
   RESEND_API_KEY="resend_api_key_anda"
   ```

4. **Jalankan Migrasi Database**
   ```bash
   npm run db:push
   ```

5. **Jalankan Server Development**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser Anda!

---
*Dibuat dengan ❤️ untuk memudahkan perjalanan karir Anda.*
