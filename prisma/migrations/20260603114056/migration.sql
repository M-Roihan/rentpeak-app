-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'PEGAWAI', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('MENUNGGU', 'AKTIF', 'SELESAI', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('BERHASIL', 'GAGAL', 'PENDING');

-- CreateEnum
CREATE TYPE "JaminanStatus" AS ENUM ('DISIMPAN', 'DIKEMBALIKAN');

-- CreateEnum
CREATE TYPE "PerbaikanStatus" AS ENUM ('DILAPORKAN', 'DALAM_PERBAIKAN', 'SELESAI');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "NIK" VARCHAR(20),
    "password" VARCHAR(255) NOT NULL,
    "peran" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "no_telp" VARCHAR(15),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barang" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "kategori" VARCHAR(50) NOT NULL,
    "harga_per_hari" DECIMAL(10,2) NOT NULL,
    "stok_total" INTEGER NOT NULL,
    "stok_tersedia" INTEGER NOT NULL,
    "deskripsi" TEXT,
    "kondisi" VARCHAR(50) NOT NULL,

    CONSTRAINT "Barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "tanggal_booking" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_pinjam" DATE NOT NULL,
    "tanggal_kembali" DATE NOT NULL,
    "total_biaya" DECIMAL(12,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'MENUNGGU',
    "bukti_booking" VARCHAR(255),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingDetail" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "barang_id" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "BookingDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "metode_pembayaran" VARCHAR(50) NOT NULL,
    "jumlah_bayar" DECIMAL(12,2) NOT NULL,
    "tanggal_bayar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jaminan" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "pegawai_id" TEXT NOT NULL,
    "foto_path" VARCHAR(255) NOT NULL,
    "jenis_jaminan" VARCHAR(50) NOT NULL,
    "status" "JaminanStatus" NOT NULL DEFAULT 'DISIMPAN',
    "tanggal_input" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jaminan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaporanBarangRusak" (
    "id" TEXT NOT NULL,
    "barang_id" TEXT NOT NULL,
    "pegawai_id" TEXT NOT NULL,
    "deskripsi_rusak" TEXT NOT NULL,
    "foto_bukti" VARCHAR(255),
    "status_perbaikan" "PerbaikanStatus" NOT NULL DEFAULT 'DILAPORKAN',
    "tanggal_laporan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaporanBarangRusak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifikasi" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "jenis" VARCHAR(50) NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sudah_dibaca" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_NIK_key" ON "User"("NIK");

-- CreateIndex
CREATE UNIQUE INDEX "Pembayaran_booking_id_key" ON "Pembayaran"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "Jaminan_booking_id_key" ON "Jaminan"("booking_id");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingDetail" ADD CONSTRAINT "BookingDetail_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingDetail" ADD CONSTRAINT "BookingDetail_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jaminan" ADD CONSTRAINT "Jaminan_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jaminan" ADD CONSTRAINT "Jaminan_pegawai_id_fkey" FOREIGN KEY ("pegawai_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaporanBarangRusak" ADD CONSTRAINT "LaporanBarangRusak_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaporanBarangRusak" ADD CONSTRAINT "LaporanBarangRusak_pegawai_id_fkey" FOREIGN KEY ("pegawai_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
