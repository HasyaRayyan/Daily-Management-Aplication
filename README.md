# 📱 Daily Management — Personal Financial Tracker

**Daily Management** adalah aplikasi pelacak keuangan pribadi minimalis yang dibangun menggunakan **React (Vite)**, **Tailwind CSS**, dan **Capacitor CLI**. Aplikasi ini dirancang menggunakan konsep *cross-platform*, sehingga dapat berjalan dengan sangat responsif di web browser sekaligus siap dikompilasi menjadi aplikasi mobile native Android (`.apk`).

---

## 🎯 Fitur Utama

- **Dashboard Finansial Reaktif:** Menampilkan informasi Total Saldo (Net Balance), Total Pendapatan, dan Total Pengeluaran yang terbarui secara otomatis secara *real-time*.
- **Manajemen Transaksi (CRUD):** Kemudahan mencatat transaksi baru dilengkapi detail deskripsi, nominal (rupiah), serta kategori tipe arus kas (Pendapatan/Pengeluaran).
- **Desain Minimalis Modern:** Menggunakan tema *Absolute Cinema* (Gelap) dengan aksen warna *Emerald Green* yang kontras dan nyaman di mata untuk pembeda jenis transaksi.
- **Penyimpanan Lokal (Local Persistence):** Data transaksi tersimpan aman di perangkat pengguna sehingga tidak hilang ketika aplikasi ditutup atau di-refresh.

---

## 🛠️ Tech Stack & Dependensi

- **Core:** React.js (v18+)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (PostCSS & Autoprefixer)
- **Mobile Native Bridge:** Capacitor Core & CLI

---

## 📂 Struktur Folder Proyek

```text
Daily-Management-Aplication/
├── android/               # Direktori native project Android (Capacitor)
├── dist/                  # Folder output hasil build produksi web statis (Vite)
├── node_modules/          # Package dependensi proyek
├── src/
│   ├── assets/            # Aset gambar, icon, dan logo aplikasi
│   ├── App.jsx            # Komponen utama & pusat logika aplikasi
│   ├── index.css          # Injeksi directive Tailwind & style global
│   └── main.jsx           # Entry point utama React DOM
├── capacitor.config.ts    # Konfigurasi integrasi Capacitor
├── tailwind.config.js     # Kustomisasi tema warna dan utilitas Tailwind
├── package.json           # Manifest skrip otomatisasi dan daftar library
└── README.md              # Dokumentasi proyek
