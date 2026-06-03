import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, requireRole, AuthError } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const decoded = verifyToken(req);
    requireRole(decoded, ["PEGAWAI", "ADMIN"]);

    const laporan = await prisma.laporanBarangRusak.findMany({
      include: {
        barang: {
          select: { nama: true, kategori: true }
        },
        pegawai: {
          select: { nama: true }
        }
      },
      orderBy: {
        tanggal_laporan: 'desc'
      }
    });

    return NextResponse.json({ data: laporan }, { status: 200 });
  } catch (error: any) {
    console.error("GET Laporan Rusak Error:", error);
    const status = error instanceof AuthError ? error.status : 500;
    return NextResponse.json({ pesan: error.message || "Gagal mengambil data laporan" }, { status });
  }
}
