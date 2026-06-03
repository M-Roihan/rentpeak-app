import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, requireRole, AuthError } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const decoded = verifyToken(req);
    requireRole(decoded, ["ADMIN"]);

    const pegawai = await prisma.user.findMany({
      where: { peran: "PEGAWAI" },
      select: {
        id: true,
        nama: true,
        email: true,
        no_telp: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ data: pegawai }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    const status = error instanceof AuthError ? error.status : 500;
    return NextResponse.json({ pesan: error.message || "Terjadi kesalahan server" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const decoded = verifyToken(req);
    requireRole(decoded, ["ADMIN"]);

    const body = await req.json();
    const { nama, email, password, no_telp } = body;

    if (!nama || !email || !password) {
      return NextResponse.json({ pesan: "Nama, email, dan password wajib diisi" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ pesan: "Password minimal 8 karakter" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ pesan: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        peran: "PEGAWAI",
        no_telp: no_telp || null,
        // NIK: null (secara default karena diubah opsional)
      },
      select: {
        id: true,
        nama: true,
        email: true,
        no_telp: true,
        peran: true,
        createdAt: true
      }
    });

    return NextResponse.json({ pesan: "Akun pegawai berhasil dibuat", data: newUser }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    const status = error instanceof AuthError ? error.status : 500;
    return NextResponse.json({ pesan: error.message || "Terjadi kesalahan server" }, { status });
  }
}
