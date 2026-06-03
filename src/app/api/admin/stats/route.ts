import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const decoded = verifyToken(req);
    requireRole(decoded, ["ADMIN"]);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

    // Jalankan semua query secara paralel menggunakan Promise.all
    const [
      totalBookingAktif,
      pendapatanAggr,
      barangTersediaAggr,
      laporanRusakPending
    ] = await Promise.all([
      // 1. Total Booking Aktif
      prisma.booking.count({
        where: { status: "AKTIF" }
      }),
      
      // 2. Pendapatan Bulan Ini (Total dari booking SELESAI & AKTIF bulan ini)
      prisma.booking.aggregate({
        where: {
          tanggal_booking: {
            gte: startOfMonth,
            lt: endOfMonth
          },
          status: {
            in: ["AKTIF", "SELESAI"]
          }
        },
        _sum: { total_biaya: true }
      }),
      
      // 3. Total Barang Tersedia
      prisma.barang.aggregate({
        _sum: { stok_tersedia: true }
      }),
      
      // 4. Laporan Rusak Pending
      prisma.laporanBarangRusak.count({
        where: { status_perbaikan: "DILAPORKAN" }
      })
    ]);

    const pendapatan = Number(pendapatanAggr._sum.total_biaya || 0);
    const barangTersedia = Number(barangTersediaAggr._sum.stok_tersedia || 0);

    return NextResponse.json({
      data: {
        totalBookingAktif,
        pendapatanBulanIni: pendapatan,
        barangTersedia,
        laporanRusakPending
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("GET /api/admin/stats Error:", error);
    return NextResponse.json({ pesan: error.message }, { status: error.status || 500 });
  }
}
