import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    // Autentikasi dan Otorisasi
    const decoded = verifyToken(req);
    requireRole(decoded, ["PEGAWAI", "ADMIN"]);

    // Mengambil data booking dengan status MENUNGGU dan AKTIF
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ["MENUNGGU", "AKTIF"]
        }
      },
      include: {
        customer: {
          select: { nama: true, email: true, no_telp: true, NIK: true }
        },
        details: {
          include: {
            barang: {
              select: { nama: true, kategori: true }
            }
          }
        }
      },
      orderBy: {
        tanggal_booking: 'desc'
      }
    });

    return NextResponse.json({ data: bookings }, { status: 200 });

  } catch (error: any) {
    console.error("GET /api/pegawai/bookings Error:", error);
    return NextResponse.json(
      { pesan: error.message || "Terjadi kesalahan server" }, 
      { status: error.status || 500 }
    );
  }
}
