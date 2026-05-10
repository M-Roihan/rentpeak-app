import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding...");

  const password = await bcrypt.hash("password123", 10);

  await prisma.bookingDetail.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.barang.deleteMany();
  await prisma.user.deleteMany();

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
