"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button, Badge, Modal, Toast, Skeleton } from "@/components/ui";

export default function PengembalianPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // === MODAL STATE ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // Array { barang_id, kondisi: "BAIK" | "RUSAK", deskripsi_rusak }
  const [kondisiList, setKondisiList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/pegawai/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Hanya ambil yang AKTIF
        const aktifBookings = data.data.filter((b: any) => b.status === "AKTIF");
        setBookings(aktifBookings);
      } else {
        setToast({ msg: data.pesan || "Gagal memuat pesanan", type: "error" });
      }
    } catch (error) {
      setToast({ msg: "Terjadi kesalahan jaringan", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openModal = (booking: any) => {
    setSelectedBooking(booking);
    
    // Inisialisasi kondisi semua barang menjadi BAIK
    const initialKondisi = booking.details.map((detail: any) => ({
      barang_id: detail.barang_id,
      nama_barang: detail.barang?.nama || 'Barang',
      kondisi: "BAIK",
      deskripsi_rusak: ""
    }));
    
    setKondisiList(initialKondisi);
    setIsModalOpen(true);
  };

  const handleKondisiChange = (barang_id: string, field: string, value: string) => {
    setKondisiList(prev => prev.map(item => {
      if (item.barang_id === barang_id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSubmitPengembalian = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      // Payload tanpa nama_barang
      const payloadKondisi = kondisiList.map(item => ({
        barang_id: item.barang_id,
        kondisi: item.kondisi,
        deskripsi_rusak: item.deskripsi_rusak
      }));

      const res = await fetch(`/api/pegawai/pengembalian/${selectedBooking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ kondisi_barang: payloadKondisi })
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ msg: "Pengembalian berhasil diproses!", type: "success" });
        setIsModalOpen(false);
        fetchBookings(); // Refresh list agar pesanan hilang dari list AKTIF
      } else {
        setToast({ msg: data.pesan || "Gagal memproses pengembalian", type: "error" });
      }
    } catch (error) {
      setToast({ msg: "Terjadi kesalahan server", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["PEGAWAI", "ADMIN"]}>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
        
        {toast && <Toast type={toast.type} message={toast.msg} onDismiss={() => setToast(null)} />}

        {/* SIDEBAR */}
        <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col shadow-2xl z-20">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-2xl font-black text-white tracking-tighter" style={{ fontFamily: '"Sora", sans-serif' }}>
              RENT<span className="text-blue-500">PEAK.</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 mt-1 tracking-[0.2em] uppercase">Employee Portal</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 mt-4">
            <Link href="/pegawai" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl font-medium transition-all text-slate-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              Pesanan Masuk
            </Link>
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-900/50 font-semibold transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              Pengembalian Barang
            </div>
            <Link href="/pegawai/laporan-rusak" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl font-medium transition-all text-slate-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Laporan Kerusakan
            </Link>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl font-medium transition-all text-slate-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Ke Katalog Publik
            </Link>
          </nav>
          
          <div className="p-6 border-t border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-inner">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <div>
                 <p className="text-sm font-bold text-white">Akun Pegawai</p>
                 <p className="text-xs text-green-400 flex items-center mt-0.5"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span> Online</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-white px-8 py-5 flex items-center justify-between shadow-sm sticky top-0 z-10 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: '"Sora", sans-serif' }}>Proses Pengembalian Barang</h2>
            <div className="md:hidden font-black text-slate-900 tracking-tighter">RENT<span className="text-blue-600">PEAK.</span></div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
            <div className="flex items-center justify-between mb-8">
              <p className="text-slate-500 font-medium">Berikut adalah daftar pesanan yang sedang dipinjam dan harus dikembalikan.</p>
              <Button size="sm" variant="secondary" onClick={fetchBookings}>Segarkan Data</Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                 {[1,2,3].map(i => (
                   <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                     <Skeleton className="w-1/3 h-6 mb-4" />
                     <Skeleton className="w-full h-8 mb-2" />
                     <Skeleton className="w-full h-24 rounded-xl mb-4" />
                     <Skeleton className="w-full h-10 rounded-lg" />
                   </div>
                 ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 border-dashed p-12 text-center max-w-lg mx-auto mt-10">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                <h3 className="text-xl font-bold text-slate-700">Tidak Ada Barang Dipinjam</h3>
                <p className="text-slate-500 mt-2">Semua pesanan aktif sudah dikembalikan atau tidak ada pesanan saat ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {bookings.map((booking) => {
                  const isTerlambat = new Date() > new Date(booking.tanggal_kembali);

                  return (
                    <div key={booking.id} className={`bg-white rounded-2xl p-6 border ${isTerlambat ? 'border-red-300 shadow-red-100' : 'border-slate-100'} shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden`}>
                      
                      {isTerlambat && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}
                      {!isTerlambat && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                      
                      <div className="flex justify-between items-start mb-4 border-b border-slate-50 pb-4">
                        <div>
                          {isTerlambat ? (
                            <Badge variant="danger">TERLAMBAT</Badge>
                          ) : (
                            <Badge variant="primary">AKTIF</Badge>
                          )}
                          <p className="text-xs text-slate-400 mt-2 font-mono" title={booking.id}>ID: {booking.id.split("-")[0].toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tgl Kembali</p>
                          <p className={`font-bold ${isTerlambat ? 'text-red-600' : 'text-slate-800'}`}>
                            {new Date(booking.tanggal_kembali).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-5 flex-1">
                        <h3 className="font-black text-xl text-slate-900 mb-1">{booking.customer.nama}</h3>
                        <p className="text-sm text-slate-500 mb-4">{booking.customer.email} • {booking.customer.no_telp}</p>
                        
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Peralatan Disewa</p>
                          <div className="space-y-2">
                            {booking.details.map((detail: any) => (
                              <div key={detail.id} className="flex justify-between items-start text-sm">
                                <span className="font-medium text-slate-700 leading-tight">
                                  {detail.barang?.nama || 'Barang'} <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md ml-1">x{detail.jumlah}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-5 border-t border-slate-100">
                        <Button className="w-full shadow-lg shadow-blue-200" onClick={() => openModal(booking)}>
                          Proses Pengembalian
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL PENGEMBALIAN */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cek Kondisi Barang Kembali">
        {selectedBooking && (
          <div className="space-y-5">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <div>
                <p className="text-sm text-amber-800 font-medium leading-relaxed">Mohon cek secara teliti kondisi setiap barang. Jika ditemukan kerusakan, pastikan menahan KTP/Jaminan pelanggan untuk denda sesuai kebijakan.</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {kondisiList.map((item, index) => (
                <div key={index} className="border border-slate-200 p-4 rounded-xl shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-3 text-lg">{item.nama_barang}</h4>
                  
                  <div className="flex gap-4 mb-3">
                    <label className={`flex-1 flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${item.kondisi === 'BAIK' ? 'border-green-500 bg-green-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <input 
                        type="radio" 
                        name={`kondisi-${item.barang_id}`} 
                        value="BAIK" 
                        checked={item.kondisi === "BAIK"}
                        onChange={() => handleKondisiChange(item.barang_id, "kondisi", "BAIK")}
                        className="hidden" 
                      />
                      <span className={`font-bold ${item.kondisi === 'BAIK' ? 'text-green-700' : 'text-slate-500'}`}>⭕ Kondisi Baik</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${item.kondisi === 'RUSAK' ? 'border-red-500 bg-red-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <input 
                        type="radio" 
                        name={`kondisi-${item.barang_id}`} 
                        value="RUSAK" 
                        checked={item.kondisi === "RUSAK"}
                        onChange={() => handleKondisiChange(item.barang_id, "kondisi", "RUSAK")}
                        className="hidden" 
                      />
                      <span className={`font-bold ${item.kondisi === 'RUSAK' ? 'text-red-700' : 'text-slate-500'}`}>⭕ Barang Rusak</span>
                    </label>
                  </div>

                  {item.kondisi === "RUSAK" && (
                    <div className="mt-4 p-3 bg-red-50/50 rounded-lg border border-red-100">
                      <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Jelaskan Kerusakan</label>
                      <textarea 
                        className="w-full p-3 text-sm border border-red-200 rounded-md outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900"
                        placeholder="Contoh: Kain tenda sobek selebar 10cm di sisi kanan..."
                        rows={3}
                        value={item.deskripsi_rusak}
                        onChange={(e) => handleKondisiChange(item.barang_id, "deskripsi_rusak", e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button 
                size="lg"
                className="w-full text-lg shadow-xl shadow-blue-200" 
                onClick={handleSubmitPengembalian} 
                isLoading={isSubmitting}
              >
                Selesaikan Pengembalian
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ProtectedRoute>
  );
}
