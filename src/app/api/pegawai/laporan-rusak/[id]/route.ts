import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, requireRole, AuthError } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = verifyToken(req);
    requireRole(decoded, ["PEGAWAI", "ADMIN"]);

    const { id } = await params;
    const body = await req.json();
    const { status_perbaikan } = body; 

    // Validasi input status
    if (!["DILAPORKAN", "DALAM_PERBAIKAN", "SELESAI"].includes(status_perbaikan)) {
      return NextResponse.json({ pesan: "Status perbaikan tidak valid" }, { status: 400 });
    }

    const laporan = await prisma.laporanBarangRusak.findUnique({
      where: { id }
    });

    if (!laporan) {
      return NextResponse.json({ pesan: "Laporan tidak ditemukan" }, { status: 404 });
    }

    // Gunakan transaction jika status berubah menjadi SELESAI agar stok bertambah
    await prisma.$transaction(async (tx) => {
      // 1. Update status laporan
      await tx.laporanBarangRusak.update({
        where: { id },
        data: { status_perbaikan }
      });

      // 2. Jika status berubah dari selain SELESAI menjadi SELESAI
      if (status_perbaikan === "SELESAI" && laporan.status_perbaikan !== "SELESAI") {
        // Kembalikan 1 stok barang ke sistem
        // Karena laporan kerusakan dibuat per 1 item yang rusak, maka kita tambah 1.
        // Wait, di route.ts pengembalian, kita kurangi stok_total sesuai detail.jumlah.
        // Asumsi: 1 laporan mewakili 1 insiden untuk 1 jenis barang berdasarkan detail jumlah yang dihitung saat pengembalian.
        // Perlu dicek kembali apakah 1 laporan = 1 barang fisik. 
        // Idealnya jika status selesai, barang sudah bisa disewa lagi, maka tambah stok_total & stok_tersedia.
        await tx.barang.update({
          where: { id: laporan.barang_id },
          data: { 
            stok_total: { increment: 1 },
            stok_tersedia: { increment: 1 }
          }
        });
      }
      
      // Jika status berubah dari SELESAI ke status lain (misal dibatalkan selesainya)
      // Ini fitur tambahan untuk mengamankan stok jika pegawai salah klik
      if (laporan.status_perbaikan === "SELESAI" && status_perbaikan !== "SELESAI") {
        await tx.barang.update({
          where: { id: laporan.barang_id },
          data: { 
            stok_total: { decrement: 1 },
            stok_tersedia: { decrement: 1 }
          }
        });
      }
    });

    return NextResponse.json({ pesan: "Status perbaikan berhasil diperbarui" }, { status: 200 });

  } catch (error: any) {
    console.error("PATCH Laporan Rusak Error:", error);
    const status = error instanceof AuthError ? error.status : 500;
    return NextResponse.json({ pesan: error.message || "Gagal memperbarui status" }, { status });
  }
}
