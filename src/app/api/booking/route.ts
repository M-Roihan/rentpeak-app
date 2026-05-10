import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    // 1. Cek Login (Hanya user login yang bisa sewa)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ pesan: "Silakan login dulu" }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const body = await req.json();
    const { tanggal_pinjam, tanggal_kembali, items } = body; 
    // items = [{ barang_id: "...", jumlah: 2 }, ...]

    // 2. Hitung total biaya & Validasi stok (Gunakan Transaction agar aman)
    const result = await prisma.$transaction(async (tx) => {
      let total = 0;

      // Cek setiap barang yang mau disewa
      for (const item of items) {
        const barang = await tx.barang.findUnique({ where: { id: item.barang_id } });
        
        if (!barang || barang.stok_tersedia < item.jumlah) {
          throw new Error(`Stok ${barang?.nama || 'Barang'} tidak mencukupi!`);
        }

        // Hitung subtotal (harga * jumlah * durasi hari)
        const tgl1 = new Date(tanggal_pinjam);
        const tgl2 = new Date(tanggal_kembali);
        const durasi = Math.ceil((tgl2.getTime() - tgl1.getTime()) / (1000 * 3600 * 24));
        total += Number(barang.harga_per_hari) * item.jumlah * durasi;

        // Kurangi stok tersedia
        await tx.barang.update({
          where: { id: item.barang_id },
          data: { stok_tersedia: { decrement: item.jumlah } }
        });
      }

      // 3. Simpan data Booking Utama
      const booking = await tx.booking.create({
        data: {
          customer_id: decoded.id,
          tanggal_pinjam: new Date(tanggal_pinjam),
          tanggal_kembali: new Date(tanggal_kembali),
          total_biaya: total,
          status: "MENUNGGU",
          // Simpan detail barang yang disewa
          details: {
            create: items.map((it: any) => ({
              barang_id: it.barang_id,
              jumlah: it.jumlah,
              subtotal: 0 // Bisa dihitung lebih detail per item jika perlu
            }))
          }
        }
      });

      return booking;
    });

    return NextResponse.json({ pesan: "Booking Berhasil!", data: result }, { status: 201 });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ pesan: error.message || "Gagal booking" }, { status: 500 });
  }
}