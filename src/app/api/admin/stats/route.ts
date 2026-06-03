import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const decoded = verifyToken(req);
    requireRole(decoded, ["ADMIN"]);

    // 1. Total Booking Aktif
    const totalBookingAktif = await prisma.booking.count({
      where: { status: "AKTIF" }
    });

    // 2. Pendapatan Bulan Ini (Total dari booking SELESAI & AKTIF bulan ini)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 1);
    
    const bookingsThisMonth = await prisma.booking.findMany({
      where: {
        tanggal_booking: {
          gte: startOfMonth,
          lt: endOfMonth
        },
        status: {
          in: ["AKTIF", "SELESAI"]
        }
      },
      select: { total_biaya: true }
    });

    const pendapatan = bookingsThisMonth.reduce((acc, curr) => acc + Number(curr.total_biaya), 0);

    // 3. Total Barang Tersedia
    const barangTersediaAggr = await prisma.barang.aggregate({
      _sum: { stok_tersedia: true }
    });
    const barangTersedia = barangTersediaAggr._sum.stok_tersedia || 0;

    // 4. Laporan Rusak Pending
    const laporanRusakPending = await prisma.laporanBarangRusak.count({
      where: { status_perbaikan: "DILAPORKAN" }
    });

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
