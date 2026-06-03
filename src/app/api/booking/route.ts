import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function hitungHari(tgl1: string, tgl2: string): number {
  const diff = new Date(tgl2).getTime() - new Date(tgl1).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export async function POST(req: Request) {
  try {
    // 1. Cek Login menggunakan helper
    const decoded = verifyToken(req);

    const body = await req.json();
    const { tanggal_pinjam, tanggal_kembali, metode_pembayaran, items } = body; 

    // 2. Hitung total biaya, validasi stok, dan buat booking (Gunakan Transaction agar aman)
    const result = await prisma.$transaction(async (tx) => {
      let total = 0;
      const calculatedItems = [];

      // a. Fetch semua barang sekaligus untuk menghemat query
      const barangIds = items.map((i: any) => i.barang_id);
      const daftarBarang = await tx.barang.findMany({
        where: { id: { in: barangIds } }
      });

      // Validasi stok semua item DULU (sebelum ada yang diubah)
      for (const item of items) {
        const barang = daftarBarang.find((b: any) => b.id === item.barang_id);
        
        if (!barang || barang.stok_tersedia < item.jumlah) {
          throw new Error(`Stok ${barang?.nama || 'Barang'} tidak mencukupi!`);
        }

        // b. Hitung subtotal per item dengan benar
        const durasi = hitungHari(tanggal_pinjam, tanggal_kembali);
        const subtotal = Number(barang.harga_per_hari) * item.jumlah * durasi;
        total += subtotal;

        calculatedItems.push({
          barang_id: item.barang_id,
          jumlah: item.jumlah,
          subtotal: subtotal
        });
      }

      // 3. Generate kode booking unik
      const kodeBooking = "BP-" + Date.now().toString(36).toUpperCase();

      // d. Buat record Booking dengan total_biaya yang benar
      const booking = await tx.booking.create({
        data: {
          customer_id: decoded.id,
          tanggal_pinjam: new Date(tanggal_pinjam),
          tanggal_kembali: new Date(tanggal_kembali),
          total_biaya: total,
          status: "MENUNGGU",
          bukti_booking: kodeBooking,
          // c. Simpan subtotal yang benar di BookingDetail.subtotal
          details: {
            create: calculatedItems.map((it: any) => ({
              barang_id: it.barang_id,
              jumlah: it.jumlah,
              subtotal: it.subtotal
            }))
          }
        }
      });

      // e. Buat record Pembayaran (WAJIB ADA)
      await tx.pembayaran.create({
        data: {
          booking_id: booking.id,
          metode_pembayaran: metode_pembayaran,
          jumlah_bayar: total,
          status: "BERHASIL"
        }
      });

      // f. Kurangi stok setelah Pembayaran dibuat
      for (const item of items) {
        await tx.barang.update({
          where: { id: item.barang_id },
          data: { stok_tersedia: { decrement: item.jumlah } }
        });
      }

      return booking;
    });

    // 5. Response
    return NextResponse.json({ 
      pesan: "Booking berhasil!", 
      data: { id: result.id, kodeBooking: result.bukti_booking } 
    }, { status: 201 });

  } catch (error: any) {
    console.error(error);
    const status = error.status || 500;
    return NextResponse.json({ pesan: error.message || "Gagal booking" }, { status });
  }
}