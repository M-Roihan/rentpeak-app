import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, requireRole, AuthError } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ "user-id": string }> }) {
  try {
    const decoded = verifyToken(req);
    requireRole(decoded, ["ADMIN"]);

    const { "user-id": userId } = await params;

    if (decoded.id === userId) {
      return NextResponse.json({ pesan: "Tidak dapat menghapus akun Anda sendiri" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ pesan: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    if (user.peran !== "PEGAWAI") {
      return NextResponse.json({ pesan: "Hanya akun dengan peran PEGAWAI yang dapat dihapus" }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ pesan: "Akun pegawai berhasil dihapus" }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    const status = error instanceof AuthError ? error.status : 500;
    return NextResponse.json({ pesan: error.message || "Terjadi kesalahan server" }, { status });
  }
}
