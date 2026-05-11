import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding...");

  const password = await bcrypt.hash("password123", 10);

  // Hapus data lama
  await prisma.bookingDetail.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.barang.deleteMany();
  await prisma.user.deleteMany();

  // Admin
  await prisma.user.create({
    data: {
      nama: "Super Admin",
      email: "admin@rentpeak.com",
      password,
      NIK: "1234567890123456",
      peran: "ADMIN",
    },
  });

  console.log("✅ Admin berhasil dibuat");

  // Seed barang
  await prisma.barang.createMany({
    data: [
      {
        nama: "Tenda Camping 4 Orang",
        kategori: "Camping",
        harga_per_hari: 75000,
        stok_total: 5,
        stok_tersedia: 5,
        deskripsi: "Tenda waterproof kapasitas 4 orang",
        kondisi: "Baik",
      },
      {
        nama: "Carrier 60L",
        kategori: "Tas Gunung",
        harga_per_hari: 50000,
        stok_total: 8,
        stok_tersedia: 8,
        deskripsi: "Tas carrier untuk hiking dan camping",
        kondisi: "Baik",
      },
      {
        nama: "Kompor Portable",
        kategori: "Peralatan Masak",
        harga_per_hari: 30000,
        stok_total: 10,
        stok_tersedia: 10,
        deskripsi: "Kompor gas portable outdoor",
        kondisi: "Baik",
      },
      {
        nama: "Sleeping Bag",
        kategori: "Camping",
        harga_per_hari: 25000,
        stok_total: 15,
        stok_tersedia: 15,
        deskripsi: "Sleeping bag hangat untuk gunung",
        kondisi: "Baik",
      },
      {
        nama: "Lampu Camping LED",
        kategori: "Penerangan",
        harga_per_hari: 15000,
        stok_total: 12,
        stok_tersedia: 12,
        deskripsi: "Lampu LED rechargeable untuk camping",
        kondisi: "Baik",
      },
    ],
  });

  console.log("✅  barang berhasil ditambahkan");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
