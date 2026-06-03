import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, requireRole } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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
    const formData = await request.formData();
    
    const nama = formData.get("nama") as string;
    const kategori = formData.get("kategori") as string;
    const harga_per_hari = formData.get("harga_per_hari") as string;
    const stok_total = formData.get("stok_total") as string;
    const stok_tersedia = formData.get("stok_tersedia") as string | null;
    const kondisi = formData.get("kondisi") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const foto = formData.get("foto") as File | null;

    let foto_url = undefined;
    if (foto && foto.size > 0) {
      const bytes = await foto.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = Date.now() + "-" + foto.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {}
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      foto_url = `/uploads/${fileName}`;
    }

    const barang = await prisma.barang.update({
      where: { id },
      data: {
        nama: nama,
        kategori: kategori,
        harga_per_hari: Number(harga_per_hari),
        stok_total: parseInt(stok_total),
        // Konversi opsional jika edit dikosongi
        stok_tersedia: stok_tersedia ? parseInt(stok_tersedia) : parseInt(stok_total),
        kondisi: kondisi,
        deskripsi: deskripsi,
        ...(foto_url && { foto_url })
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
