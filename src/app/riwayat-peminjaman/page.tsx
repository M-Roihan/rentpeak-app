"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatRupiah, formatTanggal } from "@/lib/utils";

type Booking = {
  id: string;
  bukti_booking: string;
  status: "MENUNGGU" | "AKTIF" | "SELESAI" | "DIBATALKAN";
  tanggal_pinjam: string;
  tanggal_kembali: string;
  total_biaya: number;
  pembayaran: {
    metode_pembayaran: string;
    status: string;
  };
  details: {
    barang: {
      nama: string;
      kategori: string;
    };
    jumlah: number;
  }[];
};

export default function RiwayatPeminjamanPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const router = useRouter();

  const fetchRiwayat = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/peminjaman/riwayat", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const json = await res.json();
      if (res.ok) {
        setBookings(json.data);
      }
    } catch (error) {
      console.error("Gagal mengambil riwayat:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, [router]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBatalkan = async (id: string) => {
    const isConfirm = window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?");
    if (!isConfirm) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/booking/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (res.ok) {
        showToast("Pesanan berhasil dibatalkan", "success");
        fetchRiwayat(); // Refresh data
      } else {
        showToast(json.pesan || "Gagal membatalkan pesanan", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan koneksi", "error");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MENUNGGU":
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200">MENUNGGU VERIFIKASI</span>;
      case "AKTIF":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200">AKTIF / DIPINJAM</span>;
      case "SELESAI":
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">SELESAI</span>;
      case "DIBATALKAN":
        return <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full border border-slate-300">DIBATALKAN</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans pb-16">
      {/* Navbar Minimalis */}
      <nav className="bg-[#F9F8F6]/90 backdrop-blur-xl border-b border-stone-200/60 sticky top-0 z-10 shadow-sm transition-all duration-300">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center text-stone-600 hover:text-emerald-700 transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali
          </Link>
          <div className="font-black text-stone-900 text-xl tracking-tight" style={{ fontFamily: '"Sora", sans-serif' }}>
            RENT<span className="text-emerald-600">PEAK.</span>
          </div>
        </div>
      </nav>

      {/* Toast Notification inline custom component */}
      {toast && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg z-50 flex items-center transition-all ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 mt-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-8" style={{ fontFamily: '"Sora", sans-serif' }}>Riwayat Peminjaman</h1>

        {loading ? (
          /* State Loading Skeleton */
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 animate-pulse">
                <div className="flex justify-between mb-6">
                  <div className="h-4 bg-stone-200 rounded w-1/4"></div>
                  <div className="h-6 bg-stone-200 rounded-full w-24"></div>
                </div>
                <div className="h-4 bg-stone-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-stone-200 rounded w-1/3 mb-6"></div>
                <div className="h-8 bg-stone-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          /* State Kosong */
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-12 text-center flex flex-col items-center mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-stone-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-stone-700 mb-2">Belum ada riwayat peminjaman</h3>
            <p className="text-stone-500 mb-6">Kamu belum pernah menyewa barang apapun.</p>
            <Link href="/" className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors">
              Mulai Menyewa
            </Link>
          </div>
        ) : (
          /* List Booking */
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden hover:border-emerald-200 transition-all">
                
                {/* Header Card (Kode + Status) */}
                <div className="bg-[#F9F8F6] p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200 gap-3 sm:gap-0">
                  <div className="font-mono text-sm font-medium text-stone-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {booking.bukti_booking || "Tidak ada kode"}
                  </div>
                  <div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                {/* Body Card */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Detail Item & Tanggal */}
                    <div className="md:col-span-2">
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Item yang Disewa</h4>
                      <div className="space-y-3">
                        {booking.details.map((detail, idx) => (
                          <div key={idx} className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-stone-800">{detail.barang.nama}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                {detail.barang.kategori}
                              </span>
                            </div>
                            <div className="text-stone-500 font-medium text-sm bg-stone-50 px-2.5 py-1 rounded-md border border-stone-100">
                              x{detail.jumlah}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 pt-4 border-t border-stone-100 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Durasi Sewa</p>
                          <p className="text-sm font-medium text-stone-800">
                            {formatTanggal(booking.tanggal_pinjam)}
                            <br className="block sm:hidden" />
                            <span className="hidden sm:inline mx-1.5 text-stone-300">→</span>
                            <span className="sm:hidden block my-1">sampai</span>
                            {formatTanggal(booking.tanggal_kembali)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Metode Bayar</p>
                          <p className="text-sm font-medium text-stone-800 uppercase">
                            {booking.pembayaran?.metode_pembayaran || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Total Biaya & Aksi */}
                    <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6">
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Biaya</p>
                        <p className="text-2xl font-bold text-emerald-600" style={{ fontFamily: '"Sora", sans-serif' }}>
                          {formatRupiah(booking.total_biaya)}
                        </p>
                      </div>

                      {/* Tombol Batal Muncul Jika MENUNGGU */}
                      {booking.status === "MENUNGGU" && (
                        <button
                          onClick={() => handleBatalkan(booking.id)}
                          className="mt-6 w-full py-2.5 px-4 rounded-xl text-sm font-bold border-2 border-red-500 text-red-500 hover:bg-red-50 transition-colors flex justify-center items-center gap-2 group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Batalkan Pesanan
                        </button>
                      )}
                    </div>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
