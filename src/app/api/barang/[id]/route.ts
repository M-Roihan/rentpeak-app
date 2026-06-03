import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, requireRole } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const barang = await prisma.barang.findUnique({
      where: { id: id }
    });

    if (!barang) {
      return NextResponse.json({ pesan: "Barang tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ data: barang }, { status: 200 });
  } catch (error) {
    console.error("GET /api/barang/[id] Error:", error);
    return NextResponse.json({ pesan: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

// Tambahan Endpoint PUT/PATCH untuk mengupdate barang
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = verifyToken(request);
    requireRole(decoded, ["ADMIN"]);

    const { id } = await params;
    const body = await request.json();

    const barang = await prisma.barang.update({
      where: { id },
      data: {
        nama: body.nama,
        kategori: body.kategori,
        harga_per_hari: body.harga_per_hari,
        stok_total: parseInt(body.stok_total),
        // Konversi opsional jika edit dikosongi
        stok_tersedia: body.stok_tersedia !== undefined ? parseInt(body.stok_tersedia) : parseInt(body.stok_total),
        kondisi: body.kondisi,
        deskripsi: body.deskripsi
      }
    });

    return NextResponse.json({ data: barang, pesan: "Berhasil mengupdate data barang" }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/barang/[id] Error:", error);
    return NextResponse.json({ pesan: error.message || "Gagal mengupdate barang" }, { status: error.status || 500 });
  }
}

// Seringkali frontend memanggil PATCH untuk partial update
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return PUT(request, ctx); 
}

// Tambahan Endpoint DELETE untuk menghapus barang
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = verifyToken(request);
    requireRole(decoded, ["ADMIN"]);

    const { id } = await params;

    // Cek apakah barang memiliki relasi dengan booking yang masih aktif
    const activeBookings = await prisma.bookingDetail.count({
      where: {
        barang_id: id,
        booking: {
          status: {
            in: ["MENUNGGU", "AKTIF"]
          }
        }
      }
    });

    if (activeBookings > 0) {
      return NextResponse.json({ 
        pesan: "Barang tidak bisa dihapus karena masih ada pesanan yang aktif / belum selesai." 
      }, { status: 400 });
    }

    await prisma.barang.delete({
      where: { id }
    });

    return NextResponse.json({ pesan: "Berhasil menghapus barang secara permanen" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/barang/[id] Error:", error);
    return NextResponse.json({ pesan: error.message || "Gagal menghapus barang" }, { status: error.status || 500 });
  }
}
