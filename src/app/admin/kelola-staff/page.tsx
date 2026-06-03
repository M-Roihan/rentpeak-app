"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button, Input, Modal, Toast, Skeleton } from "@/components/ui";
import { formatTanggal } from "@/lib/utils";

export default function KelolaStaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: "success"|"error"} | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    nama: "", email: "", password: "", no_telp: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/staff", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setStaffList(json.data);
      }
    } catch (error) {
      setToast({ msg: "Gagal mengambil data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSimpanPegawai = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("token"); 

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (res.ok) {
        setToast({ msg: "Pegawai berhasil ditambah!", type: "success" });
        setShowAddModal(false);
        setFormData({ nama: "", email: "", password: "", no_telp: "" });
        fetchStaff(); 
      } else {
        setToast({ msg: json.pesan || "Terjadi kesalahan", type: "error" });
      }
    } catch (error) { 
      setToast({ msg: "Error koneksi", type: "error" }); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    const token = localStorage.getItem("token"); 
    try {
      const res = await fetch(`/api/admin/staff/${selectedUser.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const json = await res.json();
      if (res.ok) {
        setToast({ msg: "Akun berhasil dihapus!", type: "success" });
        setShowDeleteModal(false);
        fetchStaff();
      } else {
        setToast({ msg: json.pesan || "Gagal menghapus", type: "error" });
      }
    } catch (error) {
      setToast({ msg: "Error koneksi jaringan", type: "error" });
    }
  };

  const openAddModal = () => {
    setFormData({ nama: "", email: "", password: "", no_telp: "" });
    setShowAddModal(true);
  };

  const openDeleteModal = (user: any) => {
    setSelectedUser(user);
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
            <Link href="/admin" className="flex items-center p-3 hover:bg-slate-800 rounded-xl cursor-pointer transition text-slate-300 hover:text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              Dashboard Inventaris
            </Link>
            <div className="p-3 bg-blue-600 rounded-xl cursor-pointer shadow-lg shadow-blue-900/50 flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              Kelola Pengguna
            </div>
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
              <h2 className="text-3xl font-bold text-slate-800" style={{ fontFamily: '"Sora", sans-serif' }}>Kelola Staff</h2>
              <p className="text-slate-500 text-sm mt-1">Manajemen akun pegawai operasional.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-bold text-slate-600 flex items-center">
               <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span> Mode Admin
            </div>
          </header>

          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: '"Sora", sans-serif' }}>Daftar Pegawai</h3>
            <Button onClick={openAddModal} className="shadow-lg shadow-blue-200">
              + Tambah Pegawai
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
                      <th className="px-6 py-4">Nama Pegawai</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">No. Telp</th>
                      <th className="px-6 py-4">Bergabung Sejak</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffList.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-12 text-slate-400">Belum ada akun pegawai.</td></tr>
                    )}
                    {staffList.map((user: any) => (
                      <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">{user.nama}</td>
                        <td className="px-6 py-4 text-slate-600 text-sm">{user.email}</td>
                        <td className="px-6 py-4 font-mono text-slate-500 text-sm">{user.no_telp || "-"}</td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {formatTanggal(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button onClick={() => openDeleteModal(user)} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded transition font-bold text-sm">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* MODAL TAMBAH PEGAWAI */}
        <Modal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          title="Tambah Akun Pegawai"
        >
          <form onSubmit={handleSimpanPegawai} className="space-y-4">
            <Input label="Nama Lengkap" placeholder="Masukkan nama pegawai" required
              value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
            
            <Input label="Email" type="email" placeholder="pegawai@rentpeak.com" required
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />

            <Input label="Password" type="password" placeholder="Minimal 8 karakter" minLength={8} required
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />

            <Input label="No. Telepon / WhatsApp" type="tel" placeholder="081234567890" 
              value={formData.no_telp} onChange={(e) => setFormData({...formData, no_telp: e.target.value.replace(/[^0-9]/g, '')})} />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1 border border-slate-200">Batal</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Menyimpan..." : "Simpan Pegawai"}
              </Button>
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
               Apakah Anda yakin ingin menghapus <b>{selectedUser?.nama}</b> secara permanen?
               <br/><span className="text-sm text-red-500 mt-2 block">Akun ini tidak akan bisa login kembali.</span>
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
