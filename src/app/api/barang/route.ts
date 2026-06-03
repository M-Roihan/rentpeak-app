import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken'; 
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    // 1. CEK SATPAM: Periksa apakah user bawa Token di Headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ pesan: "Akses ditolak! Silakan login dulu." }, { status: 401 });
    }

    // 2. AMBIL TOKENNYA (Bentuknya: "Bearer eyJhbGciOi...")
    const token = authHeader.split(' ')[1];

    // 3. BUKA TOKENNYA: Siapa ini yang nyoba masuk?
    let decoded: any;
    try {   
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (err) {
      return NextResponse.json({ pesan: "Token palsu atau sudah kadaluarsa!" }, { status: 401 });
    }

    // 4. CEK JABATAN: Apakah dia Admin?
    if (decoded.peran !== 'ADMIN') {
      return NextResponse.json({ pesan: "Dilarang masuk! Hanya ADMIN yang boleh nambah barang." }, { status: 403 });
    }

    // ==============================================================
    // KALAU LOLOS 4 CEGATAN DI ATAS, BARU BOLEH NAMBAH BARANG
    // ==============================================================

    const formData = await req.formData();
    const nama = formData.get("nama") as string;
    const kategori = formData.get("kategori") as string;
    const harga_per_hari = formData.get("harga_per_hari") as string;
    const stok_total = formData.get("stok_total") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const kondisi = formData.get("kondisi") as string;
    const foto = formData.get("foto") as File | null;

    if (!nama || !kategori || !harga_per_hari || !stok_total || !kondisi) {
      return NextResponse.json({ pesan: "Data barang belum lengkap!" }, { status: 400 });
    }

    let foto_url = null;
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

    const barangBaru = await prisma.barang.create({
      data: {
        nama,
        kategori,
        harga_per_hari: Number(harga_per_hari),
        stok_total: Number(stok_total),
        stok_tersedia: Number(stok_total),
        deskripsi: deskripsi || "",
        kondisi,
        foto_url: foto_url
      }
    });

    return NextResponse.json({ pesan: "Mantap, Barang berhasil ditambahkan!", data: barangBaru }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ pesan: "Terjadi kesalahan server", error }, { status: 500 });
  }
}

// export async function GET() { ... biarkan kodingan GET yang lama di sini ... }

// Fungsi GET untuk menampilkan semua data barang
export async function GET() {
  try {
    const semuaBarang = await prisma.barang.findMany({
      // Bikin datanya rapi berurutan berdasarkan nama (A-Z)
      orderBy: {
        nama: 'asc'
      }
    });

    return NextResponse.json({ 
      pesan: "Berhasil mengambil data barang", 
      data: semuaBarang 
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ pesan: "Gagal mengambil data", error }, { status: 500 });
  }
}