import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Pastikan user sudah login
    const decoded = verifyToken(request);
    const { id } = await params;

    const notifikasi = await prisma.notifikasi.findUnique({
      where: { id }
    });

    if (!notifikasi || notifikasi.user_id !== decoded.id) {
      return NextResponse.json({ pesan: "Notifikasi tidak ditemukan atau akses ditolak" }, { status: 404 });
    }

    // Update status menjadi sudah dibaca
    const updated = await prisma.notifikasi.update({
      where: { id },
      data: { sudah_dibaca: true }
    });

    return NextResponse.json({ data: updated, pesan: "Notifikasi ditandai dibaca" }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/notifikasi/[id]/baca Error:", error);
    return NextResponse.json({ pesan: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
