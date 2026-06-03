import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, AuthError } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const decoded = verifyToken(req);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nama: true,
        email: true,
        NIK: true,
        no_telp: true,
        peran: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ pesan: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    const status = error instanceof AuthError ? error.status : 500;
    return NextResponse.json({ pesan: error.message || "Terjadi kesalahan server" }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const decoded = verifyToken(req);
    const body = await req.json();
    const { NIK, no_telp } = body;

    // Validasi NIK jika dikirim dari client
    if (NIK) {
      const nikRegex = /^\d{16}$/;
      if (!nikRegex.test(NIK)) {
        return NextResponse.json({ pesan: "NIK harus terdiri dari 16 digit angka" }, { status: 400 });
      }

      // Cek apakah NIK unik (belum digunakan oleh orang lain)
      const existingUser = await prisma.user.findFirst({
        where: {
          NIK: NIK,
          NOT: {
            id: decoded.id
          }
        }
      });

      if (existingUser) {
        return NextResponse.json({ pesan: "NIK sudah terdaftar oleh pengguna lain" }, { status: 400 });
      }
    }

    // Update data profil (password tidak ikut ter-update dan tidak dikembalikan di response)
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        NIK: NIK !== undefined ? NIK : undefined,
        no_telp: no_telp !== undefined ? no_telp : undefined
      },
      select: {
        id: true,
        nama: true,
        email: true,
        NIK: true,
        no_telp: true,
        peran: true,
        createdAt: true
      }
    });

    return NextResponse.json({ 
      pesan: "Profil berhasil diperbarui", 
      data: updatedUser 
    }, { status: 200 });

  } catch (error: any) {
    console.error(error);
    const status = error instanceof AuthError ? error.status : 500;
    return NextResponse.json({ pesan: error.message || "Gagal mengupdate profil" }, { status });
  }
}
