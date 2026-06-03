"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatRupiah, formatTanggal } from "@/lib/utils";

function PembayaranBerhasilContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) {
      router.replace("/");
      return;
    }

    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/");
          return;
        }

        const res = await fetch(`/api/booking/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const json = await res.json();

        if (res.ok && json.data) {
          setBooking(json.data);
        } else {
          setErrorMsg(json.pesan || "Booking tidak ditemukan.");
        }
      } catch (error) {
        setErrorMsg("Gagal mengambil data booking.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, router]);

  const handleCopy = () => {
    if (booking?.bukti_booking) {
      navigator.clipboard.writeText(booking.bukti_booking);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (errorMsg || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Oops! Ada Masalah</h2>
          <p className="text-slate-500 mb-6">{errorMsg || "Booking tidak ditemukan"}</p>
          <Link href="/" className="block w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 font-sans text-slate-800">
      <div className="max-w-lg mx-auto">
        {/* Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: '"Sora", sans-serif' }}>Pembayaran Berhasil! 🎉</h1>
          <p className="text-slate-500 text-lg">Pesananmu sudah kami terima.</p>
        </div>

        {/* Card Detail */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-6">
          <div className="p-6 sm:p-8 bg-blue-600 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-white opacity-10 rounded-full"></div>
            
            <p className="text-blue-100 text-sm font-medium mb-1 relative z-10 uppercase tracking-wider">Kode Booking</p>
            <div 
              onClick={handleCopy}
              className="inline-flex flex-col items-center cursor-pointer group relative z-10"
              title="Klik untuk menyalin"
            >
              <h2 className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-widest">{booking.bukti_booking}</h2>
              <span className={`text-xs mt-2 px-3 py-1 rounded-full bg-white/20 text-white font-medium transition-all ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {copied ? 'Tersalin! ✓' : 'Salin Kode'}
              </span>
            </div>
          </div>
          
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Barang yang Disewa</p>
              <ul className="space-y-2">
                {booking.details.map((detail: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-start">
                    <span className="font-medium text-slate-800">{detail.barang?.nama || 'Barang'}</span>
                    <span className="text-slate-500 font-medium text-sm whitespace-nowrap ml-4">x{detail.jumlah}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Tanggal Pinjam</p>
                <p className="font-medium text-slate-800">{formatTanggal(booking.tanggal_pinjam)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Tanggal Kembali</p>
                <p className="font-medium text-slate-800">{formatTanggal(booking.tanggal_kembali)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Metode Bayar</p>
                <p className="font-medium text-slate-800 uppercase">
                  {booking.pembayaran?.metode_pembayaran || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  {booking.pembayaran?.status || 'BERHASIL'}
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t-2 border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-600">Total Biaya</span>
              <span className="font-bold text-2xl text-blue-600" style={{ fontFamily: '"Sora", sans-serif' }}>
                {formatRupiah(booking.total_biaya)}
              </span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8 flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800 leading-relaxed font-medium">
            Tunjukkan kode booking ini kepada pegawai saat mengambil barang. <br className="hidden sm:block" />
            <span className="font-bold">Bawa identitas asli (KTP/SIM)</span> sebagai jaminan selama masa penyewaan.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/riwayat-peminjaman" className="block w-full py-4 bg-blue-600 text-white text-center font-bold text-lg rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all">
            Lihat Riwayat Peminjaman
          </Link>
          <Link href="/" className="block w-full py-4 bg-white border-2 border-slate-200 text-slate-600 text-center font-bold text-lg rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all">
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PembayaranBerhasilPage() {
  // Gunakan Suspense boundary karena useSearchParams membutuhkan environment client-side
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PembayaranBerhasilContent />
    </Suspense>
  );
}
