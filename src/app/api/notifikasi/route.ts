import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const decoded = verifyToken(req);

    // Ambil maksimal 20 notifikasi terbaru yang belum dibaca (atau bisa semua)
    const notifikasi = await prisma.notifikasi.findMany({
      where: {
        user_id: decoded.id,
        sudah_dibaca: false
      },
      orderBy: { waktu: "desc" },
      take: 20
    });

    return NextResponse.json({ data: notifikasi }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/notifikasi Error:", error);
    return NextResponse.json({ pesan: error.message || "Gagal mengambil notifikasi" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, pesan, jenis } = body;
    
    if (!user_id || !pesan) {
      return NextResponse.json({ pesan: "Data (user_id, pesan) tidak lengkap" }, { status: 400 });
    }

    const newNotif = await prisma.notifikasi.create({
      data: {
        user_id,
        pesan,
        jenis: jenis || "INFO"
      }
    });

    return NextResponse.json({ data: newNotif, pesan: "Notifikasi berhasil dibuat" }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/notifikasi Error:", error);
    return NextResponse.json({ pesan: error.message || "Gagal membuat notifikasi" }, { status: 500 });
  }
}
