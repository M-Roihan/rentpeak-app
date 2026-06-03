import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, AuthError } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ "booking-id": string }> }) {
  try {
    const decoded = verifyToken(req);
    const { "booking-id": bookingId } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        details: { include: { barang: true } },
        pembayaran: true,
        customer: { select: { nama: true, email: true, NIK: true } }
      }
    });

    if (!booking) {
      return NextResponse.json({ pesan: "Booking tidak ditemukan" }, { status: 404 });
    }

    if (booking.customer_id !== decoded.id) {
      return NextResponse.json({ pesan: "Akses ditolak. Anda hanya dapat melihat booking milik sendiri." }, { status: 403 });
    }

    return NextResponse.json({ data: booking }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    const status = error instanceof AuthError ? error.status : 500;
    return NextResponse.json({ pesan: error.message || "Terjadi kesalahan server" }, { status });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ "booking-id": string }> }) {
  try {
    const decoded = verifyToken(req);
    const { "booking-id": bookingId } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { details: true }
    });

    if (!booking) {
      return NextResponse.json({ pesan: "Booking tidak ditemukan" }, { status: 404 });
    }

    if (booking.customer_id !== decoded.id) {
      return NextResponse.json({ pesan: "Akses ditolak" }, { status: 403 });
    }

    if (booking.status !== "MENUNGGU") {
      return NextResponse.json({ pesan: "Hanya booking dengan status MENUNGGU yang bisa dibatalkan" }, { status: 400 });
    }

    // Gunakan transaction untuk update status dan kembalikan stok
    await prisma.$transaction(async (tx) => {
      // Update status booking menjadi DIBATALKAN
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "DIBATALKAN" }
      });

      // Kembalikan stok barang yang dibatalkan
      for (const detail of booking.details) {
        await tx.barang.update({
          where: { id: detail.barang_id },
          data: { stok_tersedia: { increment: detail.jumlah } }
        });
      }
    });

    return NextResponse.json({ pesan: "Booking berhasil dibatalkan" }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    const status = error instanceof AuthError ? error.status : 500;
    return NextResponse.json({ pesan: error.message || "Terjadi kesalahan server" }, { status });
  }
}
