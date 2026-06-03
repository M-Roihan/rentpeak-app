import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, requireRole, AuthError } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const decoded = verifyToken(req);
    requireRole(decoded, ["ADMIN"]);

    const url = new URL(req.url);
    const bulan = url.searchParams.get("bulan");
    const tahun = url.searchParams.get("tahun");

    let whereClause: any = {};

    if (bulan && tahun) {
      // Create a date range for the specified month
      const startDate = new Date(parseInt(tahun), parseInt(bulan) - 1, 1);
      const endDate = new Date(parseInt(tahun), parseInt(bulan), 1);
      
      whereClause.tanggal_booking = {
        gte: startDate,
        lt: endDate
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: { select: { nama: true } },
        details: { include: { barang: { select: { nama: true } } } },
        pembayaran: true
      },
      orderBy: { tanggal_booking: "desc" }
    });

    // Kalkulasi summary per periode ini secara dinamis
    const totalTransaksi = bookings.length;
    const bookingSelesai = bookings.filter(b => b.status === "SELESAI").length;
    const bookingDibatalkan = bookings.filter(b => b.status === "DIBATALKAN").length;
    const totalPendapatan = bookings
      .filter(b => b.pembayaran?.status === "BERHASIL" && b.status !== "DIBATALKAN")
      .reduce((sum, b) => sum + Number(b.total_biaya), 0);

    return NextResponse.json({ 
      data: bookings,
      summary: {
        totalTransaksi,
        bookingSelesai,
        bookingDibatalkan,
        totalPendapatan
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    const status = error instanceof AuthError ? error.status : 500;
    return NextResponse.json({ pesan: error.message || "Terjadi kesalahan server" }, { status });
  }
}
