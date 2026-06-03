"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button, Input, Modal, Badge, Toast, Skeleton } from "@/components/ui";

export default function AdminDashboard() {
  const [barang, setBarang] = useState([]);
  const [stats, setStats] = useState({ totalBookingAktif: 0, pendapatanBulanIni: 0, barangTersedia: 0, laporanRusakPending: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: "success"|"error"} | null>(null);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [selectedBarang, setSelectedBarang] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nama: "", kategori: "Tenda", harga_per_hari: "", stok_total: "", stok_tersedia: "", kondisi: "BAIK", deskripsi: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Fetch Stats
      const resStats = await fetch("/api/admin/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resStats.ok) {
         const jsonStats = await resStats.json();
         setStats(jsonStats.data);
      }
      
      // Fetch Barang
      const resBarang = await fetch("/api/barang");
      if (resBarang.ok) {
         const jsonBarang = await resBarang.json();
         setBarang(jsonBarang.data);
      }
    } catch (error) { 
      setToast({ msg: "Gagal mengambil data", type: "error" }); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSimpanBarang = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); 

    try {
      const isEdit = !!selectedBarang;
      const url = isEdit ? `/api/barang/${selectedBarang.id}` : "/api/barang";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setToast({ msg: `Barang berhasil ${isEdit ? "diperbarui" : "ditambah"}!`, type: "success" });
        setShowAddModal(false); 
        setShowEditModal(false);
        fetchData(); 
      } else {
        const err = await res.json();
        setToast({ msg: err.pesan || "Terjadi kesalahan", type: "error" });
      }
    } catch (error) { 
      setToast({ msg: "Error koneksi", type: "error" }); 
    }
  };

  const handleDelete = async () => {
    if (!selectedBarang) return;
    const token = localStorage.getItem("token"); 
    try {
      const res = await fetch(`/api/barang/${selectedBarang.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        setToast({ msg: "Barang berhasil dihapus!", type: "success" });
        setShowDeleteModal(false);
        fetchData();
      } else {
        const err = await res.json();
        setToast({ msg: err.pesan || "Gagal menghapus", type: "error" });
      }
    } catch (error) {
      setToast({ msg: "Error koneksi jaringan", type: "error" });
    }
  };

  const openEditModal = (item: any) => {
    setSelectedBarang(item);
    setFormData({
      nama: item.nama,
      kategori: item.kategori,
      harga_per_hari: item.harga_per_hari,
      stok_total: item.stok_total,
      stok_tersedia: item.stok_tersedia,
      kondisi: item.kondisi,
      deskripsi: item.deskripsi || ""
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setSelectedBarang(null);
    setFormData({ nama: "", kategori: "Tenda", harga_per_hari: "", stok_total: "", stok_tersedia: "", kondisi: "BAIK", deskripsi: "" });
    setShowAddModal(true);
  };

  const openDeleteModal = (item: any) => {
    setSelectedBarang(item);
    setShowDeleteModal(true);
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="flex min-h-screen bg-slate-50 font-sans">
        
        {toast && <Toast type={toast.type} message={toast.msg} onDismiss={() => setToast(null)} />}

        {/* SIDEBAR */}
        <div className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col shadow-2xl z-20">
          <h1 className="text-2xl font-black mb-10 text-blue-400 tracking-tighter" style={{ fontFamily: '"Sora", sans-serif' }}>
            RENT<span className="text-white">PEAK.</span>
          </h1>
          <nav className="space-y-2 text-sm font-medium flex-1">
            <div className="p-3 bg-blue-600 rounded-xl cursor-pointer shadow-lg shadow-blue-900/50 flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              Dashboard Inventaris
            </div>
            <Link href="/admin/kelola-staff" className="flex items-center p-3 hover:bg-slate-800 rounded-xl cursor-pointer transition text-slate-300 hover:text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              Kelola Pengguna
            </Link>
            <Link href="/admin/laporan" className="flex items-center p-3 hover:bg-slate-800 rounded-xl cursor-pointer transition text-slate-300 hover:text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Laporan & Keuangan
            </Link>
          </nav>
          <div className="pt-4 border-t border-slate-800">
             <Link href="/" className="block p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition text-sm flex items-center">
               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
               Kembali ke Katalog
             </Link>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-6 md:p-10 h-screen overflow-y-auto">
          <header className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800" style={{ fontFamily: '"Sora", sans-serif' }}>Dashboard Admin</h2>
              <p className="text-slate-500 text-sm mt-1">Ringkasan statistik & manajemen inventaris peralatan.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-bold text-slate-600 flex items-center">
               <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span> Mode Admin
            </div>
          </header>

          {/* STATS CARDS */}
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
               {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm border-l-4 border-l-blue-500 hover:-translate-y-1 transition-transform">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Booking Aktif</p>
                <p className="text-4xl font-black text-blue-600 font-sora">{stats.totalBookingAktif}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm border-l-4 border-l-green-500 hover:-translate-y-1 transition-transform">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pendapatan Bulan Ini</p>
                <p className="text-3xl font-black text-green-600 font-sora">Rp {stats.pendapatanBulanIni.toLocaleString("id-ID")}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm border-l-4 border-l-amber-500 hover:-translate-y-1 transition-transform">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Stok Tersedia</p>
                <p className="text-4xl font-black text-amber-500 font-sora">{stats.barangTersedia}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm border-l-4 border-l-red-500 hover:-translate-y-1 transition-transform">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Laporan Rusak (Pending)</p>
                <p className="text-4xl font-black text-red-500 font-sora">{stats.laporanRusakPending}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: '"Sora", sans-serif' }}>Daftar Inventaris</h3>
            <Button onClick={openAddModal} className="shadow-lg shadow-blue-200">
              + Tambah Barang Baru
            </Button>
          </div>

          {/* TABEL */}
          {loading ? (
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Nama Alat</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Harga / Hari</th>
                      <th className="px-6 py-4">Stok</th>
                      <th className="px-6 py-4">Kondisi</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {barang.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-12 text-slate-400">Belum ada barang di database.</td></tr>
                    )}
                    {barang.map((item: any) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">{item.nama}</td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-bold uppercase">{item.kategori}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-blue-600 font-bold">Rp {Number(item.harga_per_hari).toLocaleString("id-ID")}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {item.stok_tersedia} <span className="font-normal text-slate-400">/ {item.stok_total}</span>
                        </td>
                        <td className="px-6 py-4">
                           <Badge variant={item.kondisi === "RUSAK" ? "danger" : "success"}>{item.kondisi}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button onClick={() => openEditModal(item)} className="text-blue-500 hover:bg-blue-50 px-3 py-1 rounded transition font-bold text-sm">Edit</button>
                          <button onClick={() => openDeleteModal(item)} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded transition font-bold text-sm">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* MODAL TAMBAH/EDIT */}
        <Modal 
          isOpen={showAddModal || showEditModal} 
          onClose={() => {setShowAddModal(false); setShowEditModal(false);}} 
          title={showEditModal ? "Edit Data Barang" : "Tambah Barang Baru"}
        >
          <form onSubmit={handleSimpanBarang} className="space-y-4">
            <Input label="Nama Barang" placeholder="Contoh: Tenda Dome 4 Orang" required
              value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                <select className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-900" 
                  value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})}>
                  <option value="Tenda">Tenda</option>
                  <option value="Carrier">Carrier</option>
                  <option value="Alat Masak">Alat Masak</option>
                  <option value="Pakaian">Pakaian</option>
                  <option value="Senter">Senter</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kondisi <span className="text-red-500">*</span></label>
                <select className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-900" 
                  value={formData.kondisi} onChange={(e) => setFormData({...formData, kondisi: e.target.value})}>
                  <option value="BAIK">Baik</option>
                  <option value="RUSAK">Rusak (Butuh Perbaikan)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <Input label="Harga per Hari (Rp)" type="number" placeholder="50000" required
                value={formData.harga_per_hari} onChange={(e) => setFormData({...formData, harga_per_hari: e.target.value})} />
              
              <Input label="Total Keseluruhan Stok" type="number" placeholder="10" required
                value={formData.stok_total} onChange={(e) => {
                  setFormData({
                    ...formData, 
                    stok_total: e.target.value,
                    stok_tersedia: showAddModal ? e.target.value : formData.stok_tersedia
                  })
                }} />
            </div>

            {/* Input Stok Tersedia Khusus Edit */}
            {showEditModal && (
              <Input label="Stok yang Tersedia Saat Ini" type="number" required
                value={formData.stok_tersedia} onChange={(e) => setFormData({...formData, stok_tersedia: e.target.value})} />
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
              <textarea placeholder="Tulis spesifikasi lengkap, kapasitas, ukuran, dll..." className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 placeholder:text-slate-400" rows={3}
                value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => {setShowAddModal(false); setShowEditModal(false);}} className="flex-1 border border-slate-200">Batal</Button>
              <Button type="submit" variant="primary" className="flex-1">Simpan Data</Button>
            </div>
          </form>
        </Modal>

        {/* MODAL HAPUS */}
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Konfirmasi Penghapusan">
          <div className="text-center p-2">
             <div className="w-20 h-20 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
             </div>
             <p className="text-slate-600 mb-6 font-medium">
               Apakah Anda yakin ingin menghapus <b>{selectedBarang?.nama}</b> secara permanen?
               <br/><span className="text-sm text-red-500 mt-2 block">Peringatan: Barang tidak bisa dihapus jika ada pesanan yang masih aktif.</span>
             </p>
             <div className="flex gap-3 mt-8">
               <Button variant="ghost" onClick={() => setShowDeleteModal(false)} className="flex-1 border border-slate-200">Batalkan</Button>
               <Button variant="danger" onClick={handleDelete} className="flex-1 shadow-lg shadow-red-200">Ya, Hapus Permanen</Button>
             </div>
          </div>
        </Modal>

      </div>
    </ProtectedRoute>
  );
}