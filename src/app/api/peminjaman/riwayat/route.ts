import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, AuthError } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const decoded = verifyToken(req);

    const bookings = await prisma.booking.findMany({
      where: { customer_id: decoded.id },
      include: {
        details: { 
          include: { 
            barang: { select: { nama: true, kategori: true } } 
          } 
        },
        pembayaran: { select: { metode_pembayaran: true, status: true } }
      },
      orderBy: { tanggal_booking: "desc" }
    });

    return NextResponse.json({ data: bookings }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    const status = error instanceof AuthError ? error.status : 500;
    return NextResponse.json({ pesan: error.message || "Terjadi kesalahan server" }, { status });
  }
}
