"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // State untuk form input barang baru
  const [formData, setFormData] = useState({
    nama: "", kategori: "Tenda", harga_per_hari: "", stok_total: "", kondisi: "BAIK", deskripsi: ""
  });

  const fetchBarang = async () => {
    try {
      const res = await fetch("/api/barang");
      const json = await res.json();
      setBarang(json.data);
    } catch (error) { console.error("Gagal ambil data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBarang(); }, []);

  const handleSimpanBarang = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); 

    try {
      const res = await fetch("/api/barang", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Barang berhasil ditambah!");
        setShowModal(false); 
        setFormData({ nama: "", kategori: "Tenda", harga_per_hari: "", stok_total: "", kondisi: "BAIK", deskripsi: "" });
        fetchBarang(); 
      } else {
        const err = await res.json();
        alert(err.pesan);
      }
    } catch (error) { alert("Error koneksi"); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white p-6 hidden md:block shadow-2xl">
        <h1 className="text-2xl font-black mb-10 text-blue-400 tracking-tighter">RENTPEAK.</h1>
        <nav className="space-y-2 text-sm font-medium">
          <div className="p-3 bg-blue-600 rounded-xl cursor-pointer shadow-lg shadow-blue-900/50">Dashboard</div>
          <div className="p-3 hover:bg-slate-800 rounded-xl cursor-pointer transition">Data Pelanggan</div>
          <div className="p-3 hover:bg-slate-800 rounded-xl cursor-pointer transition">Laporan Keuangan</div>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Inventaris Barang</h2>
            <p className="text-slate-500 text-sm">Kelola stok peralatan camping kamu di sini.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all transform hover:scale-105"
          >
            + Tambah Barang Baru
          </button>
        </header>

        {/* TABEL */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Nama Alat</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Harga / Hari</th>
                <th className="px-6 py-4">Tersedia</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {barang.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-700">{item.nama}</td>
                  <td className="px-6 py-4 text-slate-500">{item.kategori}</td>
                  <td className="px-6 py-4 font-mono text-blue-600">Rp {Number(item.harga_per_hari).toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-600">{item.stok_tersedia} <span className="font-normal text-slate-400">/ {item.stok_total}</span></td>
                  <td className="px-6 py-4"><button className="text-slate-400 hover:text-blue-600">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL POPUP */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-slate-800">Tambah Barang</h3>
            <form onSubmit={handleSimpanBarang} className="space-y-4">
              <input type="text" placeholder="Nama Barang" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required
                value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
              
              <select className="w-full p-3 border rounded-xl outline-none" 
                value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})}>
                <option value="Tenda">Tenda</option>
                <option value="Carrier">Carrier</option>
                <option value="Alat Masak">Alat Masak</option>
              </select>

              <div className="flex gap-4">
                <input type="number" placeholder="Harga/Hari" className="w-1/2 p-3 border rounded-xl" required
                  value={formData.harga_per_hari} onChange={(e) => setFormData({...formData, harga_per_hari: e.target.value})} />
                <input type="number" placeholder="Stok" className="w-1/2 p-3 border rounded-xl" required
                  value={formData.stok_total} onChange={(e) => setFormData({...formData, stok_total: e.target.value})} />
              </div>

              <textarea placeholder="Deskripsi Singkat" className="w-full p-3 border rounded-xl"
                value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} />

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition">Batal</button>
                <button type="submit" className="flex-1 p-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}