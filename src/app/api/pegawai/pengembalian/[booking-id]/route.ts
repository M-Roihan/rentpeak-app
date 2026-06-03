import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, requireRole, AuthError } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ "booking-id": string }> }) {
  try {
    const decoded = verifyToken(req);
    // Endpoint ini hanya untuk Pegawai dan Admin
    requireRole(decoded, ["PEGAWAI", "ADMIN"]);

    const { "booking-id": bookingId } = await params;
    const body = await req.json();
    const { kondisi_barang } = body; 
    // kondisi_barang: [{ barang_id: string, kondisi: "BAIK" | "RUSAK", deskripsi_rusak?: string }]

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        details: true,
        jaminan: true
      }
    });

    if (!booking) {
      return NextResponse.json({ pesan: "Booking tidak ditemukan" }, { status: 404 });
    }

    if (booking.status !== "AKTIF") {
      return NextResponse.json({ pesan: "Hanya booking berstatus AKTIF yang dapat diproses pengembaliannya" }, { status: 400 });
    }

    // Gunakan transaction agar jika satu proses gagal, semuanya dibatalkan
    await prisma.$transaction(async (tx) => {
      // 1. Update status booking menjadi SELESAI
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "SELESAI" }
      });

      // 2. Kembalikan stok untuk setiap barang yang disewa
      for (const detail of booking.details) {
        await tx.barang.update({
          where: { id: detail.barang_id },
          data: { stok_tersedia: { increment: detail.jumlah } }
        });
      }

      // 3. Update status jaminan (jika ada) menjadi DIKEMBALIKAN
      if (booking.jaminan) {
        await tx.jaminan.update({
          where: { id: booking.jaminan.id },
          data: { status: "DIKEMBALIKAN" }
        });
      }

      // 4. Proses laporan barang rusak jika ada
      if (kondisi_barang && Array.isArray(kondisi_barang)) {
        for (const item of kondisi_barang) {
          if (item.kondisi === "RUSAK") {
            // Buat laporan barang rusak
            await tx.laporanBarangRusak.create({
              data: {
                barang_id: item.barang_id,
                pegawai_id: decoded.id,
                deskripsi_rusak: item.deskripsi_rusak || "Dilaporkan rusak saat pengembalian (tidak ada deskripsi)",
                status_perbaikan: "DILAPORKAN"
              }
            });

            // Ubah kondisi barang master menjadi RUSAK agar staf bisa menindaklanjuti
            await tx.barang.update({
              where: { id: item.barang_id },
              data: { kondisi: "RUSAK" }
            });
          }
        }
      }
    });

    return NextResponse.json({ pesan: "Pengembalian berhasil diproses" }, { status: 200 });

  } catch (error: any) {
    console.error(error);
    const status = error instanceof AuthError ? error.status : 500;
    return NextResponse.json({ pesan: error.message || "Terjadi kesalahan saat memproses pengembalian" }, { status });
  }
}
