import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, requireRole } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autentikasi dan Otorisasi Pegawai
    const decoded = verifyToken(req);
    requireRole(decoded, ["PEGAWAI", "ADMIN"]);
    
    const { id } = await params;
    const body = await req.json();
    const { nik, jenis_jaminan, file_name } = body;

    // 1. Cek keberadaan booking dan data customernya
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { customer: true }
    });

    if (!booking) {
      return NextResponse.json({ pesan: "Booking tidak ditemukan" }, { status: 404 });
    }

    if (booking.status !== "MENUNGGU") {
      return NextResponse.json({ pesan: "Booking sudah diproses sebelumnya" }, { status: 400 });
    }

    // 2. Validasi NIK yang diinput harus cocok dengan data pendaftar (customer)
    if (booking.customer.NIK !== nik) {
      return NextResponse.json({ pesan: "NIK tidak cocok dengan identitas pemesan. Serah terima dibatalkan." }, { status: 400 });
    }

    // 3. Gunakan $transaction untuk memastikan status berubah HANYA jika jaminan berhasil disimpan
    // Catatan: Karena simulasi, file_name adalah path mock gambar jaminan (tidak memproses binary upload S3 disini)
    const [updatedBooking, jaminan] = await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: { status: "AKTIF" }
      }),
      prisma.jaminan.create({
        data: {
          booking_id: id,
          pegawai_id: decoded.id, // ID pegawai yang memproses (dari JWT)
          foto_path: `/uploads/jaminan/${file_name || 'dummy-jaminan.jpg'}`, 
          jenis_jaminan: jenis_jaminan || "KTP",
          status: "DISIMPAN"
        }
      })
    ]);

    return NextResponse.json({ 
      data: updatedBooking, 
      pesan: "Verifikasi berhasil. Barang diserahkan ke pelanggan." 
    }, { status: 200 });

  } catch (error: any) {
    console.error("PATCH /api/pegawai/bookings/[id]/verifikasi Error:", error);
    return NextResponse.json(
      { pesan: error.message || "Terjadi kesalahan sistem saat verifikasi" }, 
      { status: error.status || 500 }
    );
  }
}
