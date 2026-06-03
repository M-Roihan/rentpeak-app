"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button, Badge, Modal, Input, Toast, Skeleton } from "@/components/ui";

export default function PegawaiDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // === MODAL STATE ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // Form Verifikasi
  const [nikInput, setNikInput] = useState("");
  const [jenisJaminan, setJenisJaminan] = useState("KTP");
  const [fotoJaminan, setFotoJaminan] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mengambil daftar booking
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/pegawai/bookings", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(data.data);
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
    setNikInput("");
    setJenisJaminan("KTP");
    setFotoJaminan(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoJaminan(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitVerifikasi = async () => {
    if (!nikInput) {
      setToast({ msg: "NIK wajib diisi", type: "error" });
      return;
    }
    if (!fotoJaminan) {
      setToast({ msg: "Foto jaminan wajib diunggah", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/pegawai/bookings/${selectedBooking.id}/verifikasi`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nik: nikInput,
          jenis_jaminan: jenisJaminan,
          file_name: fotoJaminan.name
        })
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ msg: "Verifikasi berhasil! Status pemesanan kini AKTIF.", type: "success" });
        setIsModalOpen(false);
        fetchBookings(); // Refresh list agar badge berubah
      } else {
        setToast({ msg: data.pesan || "Gagal melakukan verifikasi", type: "error" });
      }
    } catch (error) {
      setToast({ msg: "Terjadi kesalahan komunikasi dengan server", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["PEGAWAI", "ADMIN"]}>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
        
        {/* Toast Notifikasi */}
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
            <Link href="/pegawai" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-900/50 font-semibold transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              Pesanan Masuk
            </Link>
            <Link href="/pegawai/pengembalian" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl font-medium transition-all text-slate-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              Pengembalian Barang
            </Link>
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
          {/* Header Topbar */}
          <header className="bg-white px-8 py-5 flex items-center justify-between shadow-sm sticky top-0 z-10 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: '"Sora", sans-serif' }}>Kelola Kedatangan Pesanan</h2>
            {/* Logo untuk Mobile */}
            <div className="md:hidden font-black text-slate-900 tracking-tighter">RENT<span className="text-blue-600">PEAK.</span></div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
            
            <div className="flex items-center justify-between mb-8">
              <p className="text-slate-500 font-medium">Berikut adalah daftar pesanan yang menunggu diambil oleh pelanggan.</p>
              <Button size="sm" variant="secondary" onClick={fetchBookings}>Segarkan Data</Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                 {[1,2,3].map(i => (
                   <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                     <Skeleton className="w-1/3 h-6 mb-4" />
                     <Skeleton className="w-full h-8 mb-2" />
                     <Skeleton className="w-2/3 h-4 mb-6" />
                     <Skeleton className="w-full h-24 rounded-xl mb-4" />
                     <Skeleton className="w-full h-10 rounded-lg" />
                   </div>
                 ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 border-dashed p-12 text-center max-w-lg mx-auto mt-10">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                <h3 className="text-xl font-bold text-slate-700">Tidak Ada Pesanan</h3>
                <p className="text-slate-500 mt-2">Belum ada pelanggan yang melakukan pemesanan (status MENUNGGU atau AKTIF) saat ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden">
                    
                    {/* Hiasan background strip untuk AKTIF */}
                    {booking.status === "AKTIF" && <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>}
                    
                    <div className="flex justify-between items-start mb-4 border-b border-slate-50 pb-4">
                      <div>
                        <Badge variant={booking.status === "MENUNGGU" ? "warning" : "success"}>
                          {booking.status}
                        </Badge>
                        <p className="text-xs text-slate-400 mt-2 font-mono" title={booking.id}>ID: {booking.id.split("-")[0].toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tgl Pengambilan</p>
                        <p className="font-bold text-slate-800">{new Date(booking.tanggal_pinjam).toLocaleDateString("id-ID")}</p>
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
                                {detail.barang.nama} <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md ml-1">x{detail.jumlah}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between mt-auto pt-5 border-t border-slate-100">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Tagihan</p>
                        <p className="text-xl font-black text-blue-600">Rp {Number(booking.total_biaya).toLocaleString("id-ID")}</p>
                      </div>
                      {booking.status === "MENUNGGU" && (
                        <Button size="sm" onClick={() => openModal(booking)} className="shadow-lg shadow-blue-200">
                          Proses Kedatangan
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL VERIFIKASI KEDATANGAN */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Verifikasi & Serah Terima Barang">
        {selectedBooking && (
          <div className="space-y-5">
            {/* Rincian Customer */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                {selectedBooking.customer.nama}
              </h4>
              <div className="text-sm text-slate-600 ml-7 space-y-0.5">
                <p>Email: {selectedBooking.customer.email}</p>
                <p>No. Telp: {selectedBooking.customer.no_telp}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 my-4"></div>

            {/* Input Form Verifikasi */}
            <div className="space-y-4">
              <Input 
                label="Validasi NIK Identitas" 
                placeholder="Cocokkan 16 digit NIK..." 
                value={nikInput}
                onChange={(e) => setNikInput(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pilih Jenis Jaminan Fisik</label>
                <select 
                  value={jenisJaminan} 
                  onChange={(e) => setJenisJaminan(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                >
                  <option value="KTP">Kartu Tanda Penduduk (KTP) Asli</option>
                  <option value="SIM">Surat Izin Mengemudi (SIM) Asli</option>
                  <option value="PASPOR">Buku Paspor Asli</option>
                  <option value="MOTOR">STNK / Titip Sepeda Motor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Unggah Foto / Scan Jaminan</label>
                <div className="flex flex-col items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-blue-300 border-dashed rounded-xl cursor-pointer bg-blue-50/30 hover:bg-blue-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <p className="text-sm text-blue-600"><span className="font-bold">Klik untuk foto</span> fisik dokumen</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                {previewUrl && (
                  <div className="mt-4 flex items-center justify-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <img src={previewUrl} alt="Preview Jaminan" className="h-40 rounded-lg object-contain" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                size="lg"
                className="w-full text-lg shadow-xl shadow-blue-200" 
                onClick={handleSubmitVerifikasi} 
                isLoading={isSubmitting}
                disabled={!nikInput || !fotoJaminan}
              >
                Konfirmasi & Serahkan Barang
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ProtectedRoute>
  );
}
