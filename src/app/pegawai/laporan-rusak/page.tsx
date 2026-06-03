"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button, Badge, Modal, Toast, Skeleton } from "@/components/ui";

export default function LaporanRusakPage() {
  const [laporanList, setLaporanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // === MODAL STATE ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<any>(null);
  const [statusInput, setStatusInput] = useState("DALAM_PERBAIKAN");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/pegawai/laporan-rusak", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLaporanList(data.data);
      } else {
        setToast({ msg: data.pesan || "Gagal memuat daftar laporan", type: "error" });
      }
    } catch (error) {
      setToast({ msg: "Terjadi kesalahan jaringan", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const openModal = (laporan: any) => {
    setSelectedLaporan(laporan);
    setStatusInput(laporan.status_perbaikan === "DILAPORKAN" ? "DALAM_PERBAIKAN" : "SELESAI");
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/pegawai/laporan-rusak/${selectedLaporan.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status_perbaikan: statusInput })
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ msg: "Status laporan berhasil diperbarui!", type: "success" });
        setIsModalOpen(false);
        fetchLaporan(); // Refresh data
      } else {
        setToast({ msg: data.pesan || "Gagal memperbarui status", type: "error" });
      }
    } catch (error) {
      setToast({ msg: "Terjadi kesalahan server", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DILAPORKAN": return <Badge variant="danger">Baru Dilaporkan</Badge>;
      case "DALAM_PERBAIKAN": return <Badge variant="warning">Dalam Perbaikan</Badge>;
      case "SELESAI": return <Badge variant="success">Selesai / Bisa Disewa</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
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
            <Link href="/pegawai/pengembalian" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl font-medium transition-all text-slate-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              Pengembalian Barang
            </Link>
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-900/50 font-semibold transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Laporan Kerusakan
            </div>
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
            <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: '"Sora", sans-serif' }}>Kelola Barang Rusak</h2>
            <div className="md:hidden font-black text-slate-900 tracking-tighter">RENT<span className="text-blue-600">PEAK.</span></div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
            <div className="flex items-center justify-between mb-8">
              <p className="text-slate-500 font-medium">Daftar barang rusak yang dilaporkan saat pengembalian dan butuh tindak lanjut perbaikan.</p>
              <Button size="sm" variant="secondary" onClick={fetchLaporan}>Segarkan Data</Button>
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
            ) : laporanList.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 border-dashed p-12 text-center max-w-lg mx-auto mt-10">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"></path></svg>
                <h3 className="text-xl font-bold text-slate-700">Tidak Ada Laporan Kerusakan</h3>
                <p className="text-slate-500 mt-2">Semua barang dalam kondisi baik atau sudah selesai diperbaiki.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {laporanList.map((laporan) => (
                  <div key={laporan.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden">
                    
                    {/* Hiasan background strip berdasarkan status */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${laporan.status_perbaikan === 'DILAPORKAN' ? 'bg-red-500' : laporan.status_perbaikan === 'DALAM_PERBAIKAN' ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                    
                    <div className="flex justify-between items-start mb-4 border-b border-slate-50 pb-4">
                      <div>
                        {getStatusBadge(laporan.status_perbaikan)}
                        <p className="text-xs text-slate-400 mt-2 font-mono" title={laporan.id}>ID: {laporan.id.split("-")[0].toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tgl Laporan</p>
                        <p className="font-bold text-slate-800 text-sm">
                          {new Date(laporan.tanggal_laporan).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-5 flex-1">
                      <h3 className="font-black text-lg text-slate-900 mb-1">{laporan.barang.nama}</h3>
                      <p className="text-xs text-slate-500 mb-4 bg-slate-100 inline-block px-2 py-1 rounded-md">{laporan.barang.kategori}</p>
                      
                      <div className="bg-red-50/50 rounded-xl p-4 border border-red-100">
                        <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          Deskripsi Kerusakan
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed italic">{laporan.deskripsi_rusak}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-3 text-right">Pelapor: {laporan.pegawai.nama}</p>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <Button 
                        className="w-full shadow-md" 
                        variant={laporan.status_perbaikan === 'SELESAI' ? 'secondary' : 'primary'}
                        onClick={() => openModal(laporan)}
                      >
                        {laporan.status_perbaikan === 'SELESAI' ? 'Ubah Status' : 'Update Status Perbaikan'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL UPDATE STATUS */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Status Perbaikan">
        {selectedLaporan && (
          <div className="space-y-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-bold text-slate-900">{selectedLaporan.barang.nama}</h4>
              <p className="text-sm text-slate-600 mt-1 italic">"{selectedLaporan.deskripsi_rusak}"</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Status Baru</label>
              <select 
                value={statusInput} 
                onChange={(e) => setStatusInput(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
              >
                <option value="DILAPORKAN">Baru Dilaporkan (Menunggu Perbaikan)</option>
                <option value="DALAM_PERBAIKAN">Sedang Dalam Perbaikan (Diservis)</option>
                <option value="SELESAI">Selesai Diperbaiki (Kembali ke Katalog)</option>
              </select>
            </div>
            
            {statusInput === "SELESAI" && selectedLaporan.status_perbaikan !== "SELESAI" && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium">
                  <strong>Pemberitahuan:</strong> Menyimpan dengan status SELESAI akan secara otomatis mengembalikan stok barang ini agar dapat disewakan kembali oleh pelanggan.
                </p>
              </div>
            )}

            <div className="pt-4">
              <Button 
                size="lg"
                className="w-full text-lg shadow-xl" 
                onClick={handleUpdateStatus} 
                isLoading={isSubmitting}
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ProtectedRoute>
  );
}
