# RENTPEAK — TODO & ROADMAP (Revisi Total)

> Dibuat berdasarkan kondisi kode aktual + permintaan spesifik
> Stack: Next.js 16 · TypeScript · Prisma · PostgreSQL · Tailwind CSS v4

---

## ⚠️ MASALAH KRITIS YANG HARUS DIPERBAIKI DULUAN

Sebelum menambah fitur baru, ini yang rusak/belum connect:

### M1 — Register tidak bisa dipakai karena NIK wajib di schema Prisma

**Masalah:** `prisma/schema.prisma` field `NIK` adalah `@unique` dan tidak boleh null.  
Tapi kamu mau user cukup daftar dengan nama+email+password dulu, NIK diisi nanti di profil.  
**Fix:** Ubah field `NIK` di schema jadi `NIK String? @unique @db.VarChar(20)` (tambah tanda `?`)  
Lalu jalankan: `npx prisma db push`  
File: `prisma/schema.prisma` baris field NIK di model User

### M2 — API Register masih cek NIK wajib ada

**Masalah:** `src/app/api/auth/register/route.ts` masih cek NIK di body dan reject kalau tidak ada.  
**Fix:** Hapus NIK dari required fields. Register hanya butuh: `nama`, `email`, `password`.  
`no_telp` dan `NIK` tidak dikirim saat register — akan diisi di halaman profil.

### M3 — Login tidak simpan `userName` ke localStorage

**Masalah:** Landing page ambil `localStorage.getItem("userName")` tapi login tidak menyimpannya.  
Akibatnya nama user di navbar tidak pernah muncul.  
**Fix:** Di `src/app/login/page.tsx` setelah login berhasil, tambahkan:  
`localStorage.setItem("userName", data.user.nama)`

### M4 — Keranjang ada tapi halaman checkout/booking belum ada

**Masalah:** `barang/[id]/page.tsx` sudah bisa tambah ke keranjang (localStorage), tapi tidak ada halaman `/keranjang` untuk melihat isi keranjang, dan tidak ada flow checkout → bayar → booking.  
**Fix:** Buat halaman keranjang dan checkout (lihat Sprint 2).

### M5 — Booking API tidak buat record Pembayaran

**Masalah:** `api/booking/route.ts` hanya buat Booking, tidak buat Pembayaran.  
Karena ini simulasi, pembayaran harus langsung dibuat dengan status BERHASIL ketika user submit checkout.  
**Fix:** Setelah `booking.create`, langsung `pembayaran.create` dengan `status: "BERHASIL"` (simulasi).

### M6 — Tidak ada halaman login khusus Admin/Pegawai

**Masalah:** Login admin/pegawai masih di `/login` yang sama dengan customer.  
Kamu minta login admin/pegawai dibuat di **dashboard admin** saja (buat akun baru).  
**Fix:** Buat halaman `/admin/login` terpisah untuk staff. Landing page `/login` hanya untuk customer.  
Di dashboard admin, ada menu "Kelola Staff" untuk buat/hapus akun pegawai.

### M7 — Tidak ada halaman profil user

**Masalah:** Tidak ada halaman untuk user melengkapi data NIK, no_telp dll.  
**Fix:** Buat halaman `/profil` — tampilkan data user, form edit NIK + no_telp.

### M8 — Stok berkurang saat booking, bukan saat bayar

**Masalah:** Di `api/booking/route.ts`, stok langsung dikurangi di dalam transaction yang sama saat booking dibuat. Ini salah — stok hanya boleh berkurang setelah pembayaran berhasil.  
**Fix:** Karena simulasi, booking + pembayaran dilakukan sekaligus, jadi stok berkurang di saat yang sama. Tapi logikanya: stok berkurang bersamaan dengan `status pembayaran: BERHASIL` (dalam satu transaction).

---

## STRUKTUR FOLDER TARGET (PENAMAAN HARUS SPESIFIK)

```
src/
├── app/
│   ├── (customer)/                    ← Route group, tidak muncul di URL
│   │   ├── layout.tsx                 ← Layout dengan navbar customer
│   │   ├── page.tsx                   ← Halaman katalog / landing
│   │   ├── barang/
│   │   │   └── [barang-id]/
│   │   │       └── page.tsx           ← Detail barang + tambah keranjang
│   │   ├── keranjang/
│   │   │   └── page.tsx               ← Lihat isi keranjang + hapus item
│   │   ├── checkout/
│   │   │   └── page.tsx               ← Konfirmasi + pilih metode bayar
│   │   ├── pembayaran-berhasil/
│   │   │   └── page.tsx               ← Halaman sukses + kode booking
│   │   ├── riwayat-peminjaman/
│   │   │   └── page.tsx               ← List semua booking milik user
│   │   └── profil/
│   │       └── page.tsx               ← Lihat & edit data diri (NIK, telp)
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx               ← Login CUSTOMER saja
│   │   └── daftar/
│   │       └── page.tsx               ← Register customer (ganti dari /register)
│   ├── (admin)/
│   │   ├── layout.tsx                 ← Layout sidebar admin
│   │   ├── login/
│   │   │   └── page.tsx               ← Login khusus Admin & Pegawai
│   │   └── dashboard/
│   │       ├── page.tsx               ← Statistik + inventaris barang
│   │       ├── kelola-staff/
│   │       │   └── page.tsx           ← Buat akun pegawai, ubah role, hapus
│   │       └── laporan/
│   │           └── page.tsx           ← Laporan keuangan + export
│   ├── (pegawai)/
│   │   ├── layout.tsx                 ← Layout sidebar pegawai
│   │   └── dashboard/
│   │       ├── page.tsx               ← Daftar booking MENUNGGU + proses
│   │       └── pengembalian/
│   │           └── page.tsx           ← Proses pengembalian barang
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   └── register/route.ts
│       ├── user/
│       │   └── profil/route.ts        ← GET & PATCH data user sendiri
│       ├── barang/
│       │   ├── route.ts               ← GET semua, POST (admin)
│       │   └── [barang-id]/
│       │       └── route.ts           ← GET, PUT, DELETE satu barang
│       ├── keranjang/                 ← Tidak perlu API, pakai localStorage
│       ├── booking/
│       │   ├── route.ts               ← POST buat booking baru
│       │   └── [booking-id]/
│       │       └── route.ts           ← GET detail, PATCH cancel
│       ├── peminjaman/
│       │   └── riwayat/route.ts       ← GET semua booking milik user login
│       ├── admin/
│       │   ├── stats/route.ts         ← GET statistik dashboard
│       │   ├── staff/route.ts         ← GET list, POST buat akun staff
│       │   └── staff/[user-id]/route.ts ← DELETE / PATCH role staff
│       ├── pegawai/
│       │   ├── booking-aktif/route.ts ← GET booking MENUNGGU+AKTIF
│       │   ├── verifikasi/
│       │   │   └── [booking-id]/route.ts ← PATCH verifikasi + serah barang
│       │   └── pengembalian/
│       │       └── [booking-id]/route.ts ← PATCH proses pengembalian
│       ├── laporan-rusak/
│       │   └── route.ts
│       └── notifikasi/
│           ├── route.ts
│           └── [notif-id]/baca/route.ts
├── components/
│   ├── ui/
│   │   └── index.tsx                  ← Button, Input, Badge, Modal, Toast, Skeleton
│   ├── layout/
│   │   ├── CustomerNavbar.tsx         ← Navbar untuk halaman customer
│   │   ├── AdminSidebar.tsx           ← Sidebar admin
│   │   └── PegawaiSidebar.tsx         ← Sidebar pegawai
│   └── features/
│       ├── NotificationBell.tsx
│       ├── BarangCard.tsx             ← Card barang di katalog
│       └── BookingCard.tsx            ← Card booking di riwayat
├── hooks/
│   └── useAuth.ts                     ← Decode JWT dari localStorage
└── lib/
    ├── prisma.ts                      ← Prisma singleton
    ├── auth.ts                        ← verifyToken, requireRole
    └── utils.ts                       ← formatRupiah, formatTanggal, hitungDurasi
```

---

## SPRINT 1 — PERBAIKAN KRITIS (Harus selesai sebelum lanjut)

### Task 1.1 — Fix schema Prisma (NIK nullable)

- [ ] Edit `prisma/schema.prisma`: ubah `NIK String @unique` → `NIK String? @unique`
- [ ] Jalankan `npx prisma db push` di terminal
- [ ] Tidak perlu migrasi baru, cukup push

### Task 1.2 — Fix API Register (hapus NIK dari required)

- [ ] Edit `src/app/api/auth/register/route.ts`
- [ ] Hapus `NIK` dari destructuring body dan dari `prisma.user.create`
- [ ] Register hanya terima: `nama`, `email`, `password`
- [ ] Validasi: cek apakah email sudah terdaftar saja (hapus cek NIK)

### Task 1.3 — Fix Login (simpan userName)

- [ ] Edit `src/app/login/page.tsx`
- [ ] Setelah `res.ok`, tambahkan: `localStorage.setItem("userName", data.user.nama)`
- [ ] Juga tambahkan di response API login: pastikan `data.user.nama` ada

### Task 1.4 — Buat `src/lib/utils.ts`

- [ ] Fungsi `formatRupiah(angka: number): string` — format ke Rp 50.000
- [ ] Fungsi `formatTanggal(date: string | Date): string` — format ke "12 Jan 2026"
- [ ] Fungsi `hitungDurasi(tglMulai: string, tglSelesai: string): number` — return jumlah hari

### Task 1.5 — Pisahkan halaman login

- [ ] Rename `src/app/login/` → tetap `/login` (untuk customer)
- [ ] Buat `src/app/admin/login/page.tsx` — halaman login terpisah untuk staff
- [ ] Di `src/app/login/page.tsx`: hapus redirect ke `/admin` dan `/pegawai`
  - Setelah login berhasil, customer selalu redirect ke `/`
  - Jika user ternyata ADMIN/PEGAWAI yang salah masuk lewat sini, redirect ke `/admin/login`
- [ ] Di `src/app/admin/login/page.tsx`:
  - Form sama (email + password)
  - Setelah login: role ADMIN → `/admin/dashboard`, role PEGAWAI → `/pegawai/dashboard`
  - Jika role CUSTOMER → tampilkan error "Akun ini bukan akun staff"

---

## SPRINT 2 — FLOW PEMINJAMAN CUSTOMER (Core Feature)

Ini fitur terpenting — user harus bisa sewa barang end-to-end.

### Task 2.1 — Halaman Keranjang (`/keranjang`)

File: `src/app/(customer)/keranjang/page.tsx`

- [ ] Baca data dari `localStorage.getItem("rentpeak_cart")` dan parse JSON
- [ ] Tampilkan tiap item: nama barang, tanggal pinjam-kembali, harga/hari, total per item
- [ ] Tombol hapus per item (update localStorage)
- [ ] Tampilkan total keseluruhan semua item
- [ ] Tombol "Lanjut ke Checkout" → redirect ke `/checkout`
- [ ] Jika keranjang kosong: tampilkan empty state + tombol "Lihat Katalog" → `/`
- [ ] Jika belum login dan klik checkout: redirect ke `/login?redirect=/checkout`
- [ ] Guard: cek token, jika tidak ada → arahkan ke login

### Task 2.2 — Halaman Checkout (`/checkout`)

File: `src/app/(customer)/checkout/page.tsx`

- [ ] Baca keranjang dari localStorage, tampilkan ringkasan pesanan (read-only)
- [ ] Tampilkan total biaya
- [ ] Pilihan metode pembayaran (simulasi):
  - Radio button: "Transfer Bank" / "Bayar di Tempat"
- [ ] Tombol "Konfirmasi & Bayar" → kirim POST ke `/api/booking`
- [ ] Body request: `{ tanggal_pinjam, tanggal_kembali, items: [{barang_id, jumlah}], metode_pembayaran }`
  - **Catatan:** Karena satu keranjang bisa multi-item tapi harus 1 booking, pakai tanggal dari item pertama
  - Atau: validate semua item harus punya tanggal yang sama
- [ ] Loading state saat submit
- [ ] Jika berhasil: hapus keranjang dari localStorage, redirect ke `/pembayaran-berhasil?id={bookingId}`
- [ ] Jika gagal: tampilkan pesan error

### Task 2.3 — Fix API Booking (`POST /api/booking`)

File: `src/app/api/booking/route.ts`

- [ ] Terima tambahan field `metode_pembayaran` di body
- [ ] Pindahkan pengurangan stok ke SETELAH record Pembayaran dibuat
- [ ] Dalam satu `prisma.$transaction`:
  1. Cek stok semua barang
  2. Hitung total biaya per item (simpan subtotal yang benar di BookingDetail)
  3. Buat record `Booking` dengan status MENUNGGU
  4. Buat record `Pembayaran` dengan status BERHASIL (simulasi)
  5. Kurangi `stok_tersedia` setiap barang
- [ ] Return: `{ pesan, data: { bookingId, kodeBooking } }`
- [ ] Buat kode booking unik: `"BP-" + Date.now().toString(36).toUpperCase()`

### Task 2.4 — Halaman Sukses Pembayaran (`/pembayaran-berhasil`)

File: `src/app/(customer)/pembayaran-berhasil/page.tsx`

- [ ] Ambil `?id=` dari URL search params
- [ ] Fetch detail booking dari `GET /api/booking/[booking-id]` (buat API ini dulu — lihat Task 2.5)
- [ ] Tampilkan: kode booking, nama barang, tanggal, total biaya, instruksi "Tunjukkan kode ini ke pegawai"
- [ ] Tombol "Lihat Riwayat Peminjaman" → `/riwayat-peminjaman`
- [ ] Tombol "Kembali ke Katalog" → `/`

### Task 2.5 — API Booking Detail & Riwayat

File baru: `src/app/api/booking/[booking-id]/route.ts`

- [ ] `GET`: ambil satu booking by id, include details + barang + pembayaran
  - Verifikasi: booking harus milik user yang login (cek `customer_id === decoded.id`)
- [ ] `PATCH`: cancel booking (hanya jika status MENUNGGU dan `customer_id` cocok)

File baru: `src/app/api/peminjaman/riwayat/route.ts`

- [ ] `GET`: ambil semua booking milik `decoded.id`, include details + barang, order by terbaru

### Task 2.6 — Halaman Riwayat Peminjaman (`/riwayat-peminjaman`)

File: `src/app/(customer)/riwayat-peminjaman/page.tsx`

- [ ] Protected: redirect ke login jika tidak authenticated
- [ ] Fetch dari `GET /api/peminjaman/riwayat`
- [ ] Tampilkan list booking sebagai cards:
  - Kode booking, tanggal booking, tanggal pinjam-kembali
  - Daftar barang yang disewa
  - Total biaya
  - Badge status (MENUNGGU=kuning, AKTIF=biru, SELESAI=hijau, DIBATALKAN=merah)
- [ ] Tombol "Batalkan" jika status masih MENUNGGU

---

## SPRINT 3 — HALAMAN PROFIL USER

### Task 3.1 — API Profil

File baru: `src/app/api/user/profil/route.ts`

- [ ] `GET`: return data user dari token (id, nama, email, NIK, no_telp)
  - Query: `prisma.user.findUnique({ where: { id: decoded.id } })`
  - Jangan return `password`!
- [ ] `PATCH`: update NIK dan/atau no_telp
  - Validasi NIK: 16 digit angka, unik (cek tidak ada user lain dengan NIK sama)
  - Hanya field `NIK` dan `no_telp` yang boleh diupdate lewat endpoint ini

### Task 3.2 — Halaman Profil (`/profil`)

File: `src/app/(customer)/profil/page.tsx`

- [ ] Protected: redirect ke login jika tidak authenticated
- [ ] Tampilkan data diri: nama, email (readonly), NIK, no_telp
- [ ] Form edit: NIK (16 digit) + no_telp
- [ ] Jika NIK belum diisi: tampilkan banner peringatan kuning "Lengkapi data dirimu agar bisa melakukan peminjaman"
- [ ] Tombol simpan → PATCH `/api/user/profil`
- [ ] Success/error feedback dengan Toast

### Task 3.3 — Navbar: Tambah dropdown user

File: `src/app/(customer)/page.tsx` (bagian navbar)

- [ ] Nama user di kanan atas → klik → dropdown menu:
  - "Profil Saya" → `/profil`
  - "Riwayat Peminjaman" → `/riwayat-peminjaman`
  - "Keranjang" (dengan badge count) → `/keranjang`
  - "Keluar" → logout + reload
- [ ] Icon keranjang dengan badge jumlah item di navbar (baca dari localStorage)

---

## SPRINT 4 — DASHBOARD ADMIN (Lengkap)

### Task 4.1 — Rename & Restruktur folder admin

- [ ] Pindahkan `src/app/admin/page.tsx` → `src/app/(admin)/dashboard/page.tsx`
- [ ] Buat `src/app/(admin)/layout.tsx` dengan sidebar admin
- [ ] Buat `src/app/(admin)/login/page.tsx` (lihat Sprint 1 Task 1.5)
- [ ] Update semua Link di sidebar yang sudah ada

### Task 4.2 — Halaman Kelola Staff (`/admin/dashboard/kelola-staff`)

File: `src/app/(admin)/dashboard/kelola-staff/page.tsx`

Ini menggantikan kebutuhan "buat akun admin/pegawai di dashboard":

- [ ] Fetch daftar semua user dengan role PEGAWAI dari `GET /api/admin/staff`
- [ ] Tampilkan tabel: nama, email, no_telp, tanggal dibuat, role
- [ ] Tombol "+ Tambah Akun Pegawai" → modal form:
  - Field: nama, email, password, no_telp
  - Kirim POST ke `/api/admin/staff`
  - Role otomatis jadi PEGAWAI
- [ ] Tombol "Hapus" per baris → konfirmasi modal → DELETE `/api/admin/staff/[user-id]`

### Task 4.3 — API Kelola Staff

File baru: `src/app/api/admin/staff/route.ts`

- [ ] `GET`: list semua user dengan role PEGAWAI (Admin only)
- [ ] `POST`: buat akun baru dengan role PEGAWAI (Admin only)
  - Hash password dengan bcrypt sebelum simpan
  - Cek email unik

File baru: `src/app/api/admin/staff/[user-id]/route.ts`

- [ ] `DELETE`: hapus akun pegawai (Admin only, tidak bisa hapus diri sendiri)

### Task 4.4 — Halaman Laporan (`/admin/dashboard/laporan`)

File: `src/app/(admin)/dashboard/laporan/page.tsx`

- [ ] Filter periode: dropdown bulan + tahun
- [ ] Fetch dari `GET /api/admin/stats` (sudah ada — tambahkan data booking list)
- [ ] Tabel booking sesuai filter: kode, customer, barang, total, status
- [ ] Summary: total transaksi, total pendapatan periode tersebut
- [ ] Tombol "Export CSV" (buat helper download dari data array)

### Task 4.5 — Tambah Tab "Semua Booking" di Dashboard Admin

Di `src/app/(admin)/dashboard/page.tsx`:

- [ ] Tambah section baru di bawah tabel inventaris
- [ ] Fetch semua booking (semua status) dari API baru `GET /api/admin/booking-list`
- [ ] Tabel: kode booking, nama customer, status, tanggal, total
- [ ] Filter by status (dropdown)

---

## SPRINT 5 — DASHBOARD PEGAWAI (Lengkap)

### Task 5.1 — Rename & Restruktur folder pegawai

- [ ] Pindahkan `src/app/pegawai/page.tsx` → `src/app/(pegawai)/dashboard/page.tsx`
- [ ] Buat `src/app/(pegawai)/layout.tsx` dengan sidebar pegawai

### Task 5.2 — Fix API verifikasi (rename endpoint)

- [ ] Pindahkan `src/app/api/pegawai/bookings/[id]/verifikasi/route.ts`
      → `src/app/api/pegawai/verifikasi/[booking-id]/route.ts`
- [ ] Pindahkan `src/app/api/pegawai/bookings/route.ts`
      → `src/app/api/pegawai/booking-aktif/route.ts`
- [ ] Update semua fetch URL di `pegawai/page.tsx` yang sudah ada

### Task 5.3 — Halaman Pengembalian Barang (`/pegawai/dashboard/pengembalian`)

File: `src/app/(pegawai)/dashboard/pengembalian/page.tsx`

- [ ] Fetch booking dengan status AKTIF (sudah ada barangnya, perlu dikembalikan)
- [ ] Kartu per booking: nama customer, barang yang dipinjam, tanggal kembali, apakah terlambat
- [ ] Badge merah "TERLAMBAT" jika tanggal_kembali sudah lewat
- [ ] Tombol "Proses Pengembalian" → modal:
  - Tampilkan daftar barang
  - Per barang: pilihan kondisi (Baik / Rusak)
  - Jika ada yang rusak: textarea untuk deskripsi kerusakan
  - Tombol "Konfirmasi Pengembalian"
- [ ] Submit → PATCH `/api/pegawai/pengembalian/[booking-id]`

### Task 5.4 — API Pengembalian Barang

File baru: `src/app/api/pegawai/pengembalian/[booking-id]/route.ts`

`PATCH`:

- [ ] Cek booking ada dan status AKTIF
- [ ] Dalam satu `prisma.$transaction`:
  1. Update status booking → SELESAI
  2. Tambah kembali stok (`stok_tersedia: { increment: jumlah }`) untuk setiap barang
  3. Update status Jaminan → DIKEMBALIKAN
  4. Jika ada barang rusak: buat record `LaporanBarangRusak` per barang rusak
- [ ] Return sukses

### Task 5.5 — Notifikasi ke pegawai saat ada booking baru

Di `src/app/api/booking/route.ts` setelah booking berhasil dibuat:

- [ ] Ambil semua user dengan role PEGAWAI
- [ ] Buat record Notifikasi untuk setiap pegawai: `pesan: "Pesanan baru dari {nama_customer}"`
- [ ] Notifikasi akan muncul di `NotificationBell` di dashboard pegawai

---

## SPRINT 6 — POLISH & KONEKSI ANTAR HALAMAN

### Task 6.1 — Guard semua halaman protected

- [ ] `/profil` → redirect ke `/login` jika tidak authenticated
- [ ] `/keranjang` → redirect ke `/login?redirect=/keranjang`
- [ ] `/checkout` → redirect ke `/login?redirect=/checkout`
- [ ] `/riwayat-peminjaman` → redirect ke `/login`
- [ ] `/admin/dashboard/*` → redirect ke `/admin/login` jika tidak authenticated atau role bukan ADMIN
- [ ] `/pegawai/dashboard/*` → redirect ke `/admin/login` jika role bukan PEGAWAI atau ADMIN

### Task 6.2 — Landing page: tombol keranjang di navbar

- [ ] Tambah icon keranjang di navbar dengan badge count (baca dari localStorage)
- [ ] Klik icon → ke `/keranjang`

### Task 6.3 — Halaman daftar: rename URL

- [ ] Rename `src/app/register/` → `src/app/(auth)/daftar/`
  - Atau tetap di `/register` tapi pindahkan ke route group
- [ ] Update semua link yang mengarah ke `/register` → `/daftar`

### Task 6.4 — Konsistensi error handling

- [ ] Semua API route: jangan return raw `error` object di produksi
- [ ] Pattern standar: `{ pesan: "Pesan yang bisa dibaca manusia" }`
- [ ] Semua halaman: ganti semua `alert()` yang mungkin masih tersisa dengan Toast

---

## CHECKLIST STATUS SAAT INI

| File                                                    | Status       | Catatan                                             |
| ------------------------------------------------------- | ------------ | --------------------------------------------------- |
| `prisma/schema.prisma`                                  | ⚠️ Fix       | NIK harus nullable                                  |
| `src/lib/auth.ts`                                       | ✅ Selesai   | verifyToken & requireRole sudah benar               |
| `src/lib/prisma.ts`                                     | ✅ Selesai   |                                                     |
| `src/hooks/useAuth.ts`                                  | ✅ Selesai   | decode JWT sudah benar                              |
| `src/components/ui/index.tsx`                           | ✅ Selesai   | Button, Input, Badge, Modal, Toast, Skeleton        |
| `src/components/auth/ProtectedRoute.tsx`                | ✅ Selesai   |                                                     |
| `src/components/features/NotificationBell.tsx`          | ✅ Selesai   |                                                     |
| `src/app/(customer)/page.tsx`                           | ✅ Bagus     | Katalog, search, filter sudah ada                   |
| `src/app/login/page.tsx`                                | ⚠️ Fix       | Tidak simpan userName, harus pisah dari staff login |
| `src/app/register/page.tsx`                             | ⚠️ Fix       | NIK masih required di form                          |
| `src/app/barang/[id]/page.tsx`                          | ✅ Bagus     | Detail + add to cart sudah benar                    |
| `src/app/admin/page.tsx`                                | ✅ Bagus     | Stats + CRUD barang sudah benar                     |
| `src/app/pegawai/page.tsx`                              | ✅ Bagus     | Verifikasi booking sudah benar                      |
| `src/app/api/auth/login/route.ts`                       | ✅ Selesai   |                                                     |
| `src/app/api/auth/register/route.ts`                    | ⚠️ Fix       | NIK masih required                                  |
| `src/app/api/barang/route.ts`                           | ✅ Selesai   | GET & POST                                          |
| `src/app/api/barang/[id]/route.ts`                      | ✅ Selesai   | GET, PUT, DELETE                                    |
| `src/app/api/booking/route.ts`                          | ⚠️ Fix       | Tidak buat Pembayaran, subtotal tidak benar         |
| `src/app/api/admin/stats/route.ts`                      | ✅ Selesai   |                                                     |
| `src/app/api/pegawai/bookings/route.ts`                 | ✅ Selesai   |                                                     |
| `src/app/api/pegawai/bookings/[id]/verifikasi/route.ts` | ✅ Selesai   |                                                     |
| `/keranjang`                                            | ❌ Belum ada |                                                     |
| `/checkout`                                             | ❌ Belum ada |                                                     |
| `/pembayaran-berhasil`                                  | ❌ Belum ada |                                                     |
| `/riwayat-peminjaman`                                   | ❌ Belum ada |                                                     |
| `/profil`                                               | ❌ Belum ada |                                                     |
| `/admin/login`                                          | ❌ Belum ada |                                                     |
| `/admin/dashboard/kelola-staff`                         | ❌ Belum ada |                                                     |
| `/admin/dashboard/laporan`                              | ❌ Belum ada |                                                     |
| `/pegawai/dashboard/pengembalian`                       | ❌ Belum ada |                                                     |
| `api/booking/[booking-id]`                              | ❌ Belum ada |                                                     |
| `api/peminjaman/riwayat`                                | ❌ Belum ada |                                                     |
| `api/user/profil`                                       | ❌ Belum ada |                                                     |
| `api/admin/staff`                                       | ❌ Belum ada |                                                     |
| `api/pegawai/pengembalian/[booking-id]`                 | ❌ Belum ada |                                                     |

---

## URUTAN PENGERJAAN YANG DISARANKAN

1. **Sprint 1** (perbaikan kritis) — wajib selesai dulu, semua depend ke sini
2. **Sprint 2 Task 2.1-2.3** (keranjang + checkout + fix booking API) — core flow peminjaman
3. **Sprint 2 Task 2.4-2.6** (halaman sukses + riwayat) — lengkapi flow customer
4. **Sprint 3** (profil user) — agar user bisa isi NIK
5. **Sprint 4** (admin lengkap) — kelola staff + laporan
6. **Sprint 5** (pegawai pengembalian) — proses pengembalian
7. **Sprint 6** (polish) — guard, navbar, konsistensi
