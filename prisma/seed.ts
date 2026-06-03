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
        nama: "Tenda Dome 4 Orang Eiger",
        kategori: "Tenda",
        harga_per_hari: 75000,
        stok_total: 5,
        stok_tersedia: 5,
        deskripsi: "Tenda waterproof premium kapasitas 4 orang, cocok untuk naik gunung di cuaca ekstrem.",
        kondisi: "Baik",
        foto_url: "/images/barang/tenda4.jpg",
      },
      {
        nama: "Tenda Family 6 Orang",
        kategori: "Tenda",
        harga_per_hari: 120000,
        stok_total: 3,
        stok_tersedia: 3,
        deskripsi: "Tenda besar dua kamar cocok untuk family gathering atau camping santai pinggir danau.",
        kondisi: "Baik",
        foto_url: "/images/barang/tenda6.jpg",
      },
      {
        nama: "Carrier Osprey 65L",
        kategori: "Tas Gunung",
        harga_per_hari: 65000,
        stok_total: 8,
        stok_tersedia: 8,
        deskripsi: "Tas carrier andalan dengan sistem ventilasi back-system super nyaman.",
        kondisi: "Baik",
        foto_url: "/images/barang/tas.jpg",
      },
      {
        nama: "Carrier Consina 40L",
        kategori: "Tas Gunung",
        harga_per_hari: 40000,
        stok_total: 10,
        stok_tersedia: 10,
        deskripsi: "Tas carrier ukuran sedang untuk pendakian tektok atau durasi singkat 1-2 hari.",
        kondisi: "Baik",
        foto_url: "/images/barang/taskecil.jpg",
      },  
      {
        nama: "Kompor Portable Kovar",
        kategori: "Peralatan Masak",
        harga_per_hari: 20000,
        stok_total: 15,
        stok_tersedia: 15,
        deskripsi: "Kompor gas portable outdoor anti angin, wajib bawa untuk ngopi di gunung.",
        kondisi: "Baik",
        foto_url: "/images/barang/kompor.jpg",
      },
      {
        nama: "Nesting Set Cooking 4 in 1",
        kategori: "Peralatan Masak",
        harga_per_hari: 25000,
        stok_total: 12,
        stok_tersedia: 12,
        deskripsi: "Panci dan wajan set aluminium anti lengket, praktis dan ringan.",
        kondisi: "Baik",
        foto_url: "/images/barang/setcooking.jpg",
      },
      {
        nama: "Sleeping Bag Polar",
        kategori: "Tidur & Istirahat",
        harga_per_hari: 25000,
        stok_total: 15,
        stok_tersedia: 15,
        deskripsi: "Sleeping bag dengan lapisan dalam polar hangat, tahan hingga suhu 5 derajat celcius.",
        kondisi: "Baik",
        foto_url: "/images/barang/sleepingbag.jpg",
      },
      {
        nama: "Matras Spon Hitam",
        kategori: "Tidur & Istirahat",
        harga_per_hari: 10000,
        stok_total: 20,
        stok_tersedia: 20,
        deskripsi: "Matras ringan standar untuk alas tidur di dalam tenda agar tidak dingin.",
        kondisi: "Baik",
        foto_url: "/images/barang/matras.jpg",
      },
      {
        nama: "Lampu Tenda LED",
        kategori: "Penerangan",
        harga_per_hari: 15000,
        stok_total: 12,
        stok_tersedia: 12,
        deskripsi: "Lampu LED rechargeable untuk penerangan di dalam tenda.",
        kondisi: "Baik",
        foto_url: "/images/barang/lampu.jpg",
      },
      {
        nama: "Headlamp Waterproof",
        kategori: "Penerangan",
        harga_per_hari: 20000,
        stok_total: 10,
        stok_tersedia: 10,
        deskripsi: "Senter kepala jarak jauh untuk pendakian malam (summit attack).",
        kondisi: "Baik",
        foto_url: "/images/barang/headlamp.jpg",
      },
      {
        nama: "Sepatu Trekking SNI",
        kategori: "Sepatu & Pakaian",
        harga_per_hari: 40000,
        stok_total: 6,
        stok_tersedia: 6,
        deskripsi: "Sepatu gunung safety anti slip untuk melintasi jalanan berbatu atau lumpur.",
        kondisi: "Baik",
        foto_url: "/images/barang/boots.jpg",
      },
      {
        nama: "Trekking Pole",
        kategori: "Aksesoris",
        harga_per_hari: 15000,
        stok_total: 14,
        stok_tersedia: 14,
        deskripsi: "Tongkat daki untuk mengurangi beban lutut saat perjalanan naik dan turun gunung.",
        kondisi: "Baik",
        foto_url: "/images/barang/pole.jpg",
      }
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
