export function formatRupiah(angka: number): string {
  return "Rp " + angka.toLocaleString("id-ID");
}

export function formatTanggal(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function hitungDurasi(tglMulai: string, tglSelesai: string): number {
  const mulai = new Date(tglMulai);
  const selesai = new Date(tglSelesai);
  
  // Reset jam ke 00:00:00 agar perhitungan akurat berbasis hari
  mulai.setHours(0, 0, 0, 0);
  selesai.setHours(0, 0, 0, 0);
  
  const selisihWaktu = selesai.getTime() - mulai.getTime();
  const selisihHari = Math.ceil(selisihWaktu / (1000 * 60 * 60 * 24));
  
  return selisihHari > 0 ? selisihHari : 1;
}
