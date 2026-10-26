# 🚗 AGAN TRAVEL MALANG

**Sistem Manajemen Booking & Keuangan** - Aplikasi web internal untuk mengelola reservasi penumpang, tracking admin, dan keuangan travel Malang-Surabaya.

## ✨ Fitur Utama

### 🔐 Autentikasi & Otorisasi
- **6 Akun User** dengan Role-Based Access Control (RBAC)
  - `master` / `master123` - Admin Master Data (Full Access)
  - `admin1` / `admin123` - Finance Admin
  - `admin2` / `admin123` - Finance Admin
  - `admin3` / `admin123` - Booking Admin
  - `admin4` / `admin123` - Booking Admin
  - `admin5` / `admin123` - Booking Admin
- Password hashing yang aman
- Route protection (403 Forbidden untuk akses tidak sah)
- Permission granular (booking, finance, user, report, activity)

### 📋 Manajemen Booking
- ID Booking otomatis (format: `AGT-YYYYMMDD-XXX`)
- Admin Handle otomatis (tercatat siapa yang menangani)
- Data penumpang lengkap (nama, WhatsApp, jumlah, area, asal, tujuan)
- Status booking: Pending, Confirmed, Completed, Cancelled
- Status pembayaran: Belum Bayar, DP, Lunas, Refund
- Filter & search (area, admin, status, tanggal)

### 👥 Data Penumpang
- Tab Malang & Surabaya
- Statistik penumpang per area
- Pencarian berdasarkan nama/WhatsApp

### 📊 Tracking Admin
- Statistik workload per admin
- Distribusi status booking
- Grafik booking per admin
- Perbandingan Malang vs Surabaya

### 💰 Modul Keuangan (Finance Admin Only)
- **Dashboard Keuangan**: Pemasukan, pengeluaran, saldo, piutang
- **Keuangan Harian**: Transaksi per hari dengan filter
- **Keuangan Bulanan**: Ringkasan per bulan
- **Pemasukan**: Pembayaran reservasi, DP, pelunasan, dll
- **Pengeluaran**: BBM, tol, parkir, maintenance, dll
- **Pembayaran Belum Lunas (Piutang)**: Tracking tagihan
- **Laporan Keuangan**: Per admin, per area, periode custom
- **Export Excel & PDF**

### 📝 Activity Log
- Pencatatan semua aktivitas penting
- Filter berdasarkan modul & hasil (SUCCESS/DENIED)
- Audit trail untuk keamanan

### 👤 User Management (Master Only)
- Tambah/Edit/Hapus user
- Aktivasi/Nonaktifkan akun
- Atur role & permission
- Lihat last login

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Export**: XLSX (Excel), jsPDF + jspdf-autotable (PDF)
- **Date Handling**: date-fns
- **Storage**: LocalStorage (simulasi database)

## 📦 Instalasi

```bash
# Clone repository
git clone https://github.com/rensgrunkz/travel_app.git
cd travel_app

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 🏗️ Build untuk Production

```bash
npm run build
```

Output akan berada di folder `dist/`

## 📁 Struktur Folder

```
travel_app/
├── src/
│   ├── components/
│   │   └── Layout.tsx          # Sidebar & navigation
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── DataContext.tsx     # Data management
│   ├── data/
│   │   └── seed.ts             # Initial data & users
│   ├── pages/
│   │   ├── Login.tsx           # Halaman login
│   │   ├── Dashboard.tsx       # Dashboard utama
│   │   ├── Bookings.tsx        # Manajemen booking
│   │   ├── Passengers.tsx      # Data penumpang
│   │   ├── Tracking.tsx        # Tracking admin
│   │   ├── ActivityLog.tsx     # Log aktivitas
│   │   ├── Finance.tsx         # Modul keuangan
│   │   └── UserManagement.tsx  # Manajemen user
│   ├── types/
│   │   └── index.ts            # TypeScript definitions
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
└── README.md
```

## 🔒 Access Matrix

| Modul | Master | Admin 1-2 | Admin 3-5 |
|-------|--------|-----------|-----------|
| Dashboard | ✅ | ✅ | ✅ |
| Booking | ✅ | ✅ | ✅ |
| Penumpang | ✅ | ✅ | ✅ |
| Tracking | ✅ | ✅ | ✅ |
| Activity Log | ✅ | ✅ | ✅ |
| **Keuangan** | ✅ | ✅ | ❌ |
| **Laporan Keuangan** | ✅ | ✅ | ❌ |
| **Export Excel/PDF** | ✅ | ✅ | ❌ |
| **User Management** | ✅ | ❌ | ❌ |
| **Permission** | ✅ | ❌ | ❌ |

## 🎯 Prioritas Bisnis

1. **BOOKING** - Siapa penumpangnya dan kapan reservasinya
2. **TRACKING** - Admin mana yang menangani booking
3. **KEUANGAN** - Pemasukan, pengeluaran, pembayaran, piutang

## 📊 Database Schema (LocalStorage)

- `users` - Data user & permissions
- `bookings` - Data reservasi
- `booking_payments` - Riwayat pembayaran
- `transactions` - Transaksi keuangan
- `activity_logs` - Log aktivitas

## 🚀 Fitur Keamanan

- ✅ Password hashing (bukan plain text)
- ✅ Route protection di frontend
- ✅ Permission check di setiap halaman
- ✅ Access Denied page (403)
- ✅ Activity logging untuk audit
- ✅ Session management
- ✅ Role-based menu visibility

## 📱 Responsive Design

Aplikasi fully responsive untuk:
- Desktop
- Laptop
- Tablet
- Smartphone

## 🔧 Development

```bash
# Type checking
npm run typecheck

# Development server
npm run dev

# Production build
npm run build
```

## 📝 Catatan Penting

- Data disimpan di **LocalStorage** browser (simulasi database)
- Untuk production, disarankan menggunakan backend API + database real (PostgreSQL/MySQL)
- Password hashing menggunakan simple hash untuk demo (gunakan bcrypt di production)
- Seed data otomatis dimuat saat pertama kali akses

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Developed for **AGAN TRAVEL MALANG**

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2026
