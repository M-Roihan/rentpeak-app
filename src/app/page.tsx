"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [barang, setBarang] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data dari database saat web pertama kali dibuka
  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const res = await fetch("/api/barang");
        const json = await res.json();
        setBarang(json.data);
      } catch (error) {
        console.error("Gagal mengambil data barang");
      } finally {
        setLoading(false);
      }
    };
    fetchBarang();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
            RENT<span className="text-blue-600">PEAK.</span>
          </h1>
          <div className="space-x-4">
            <Link href="/login">
              <button className="text-slate-600 font-semibold hover:text-blue-600 transition">Masuk</button>
            </Link>
            <Link href="/login">
              <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition">
                Daftar
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION (Banner Atas) */}
      <header className="bg-slate-900 text-white text-center py-20 px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Sewa Alat Camping Gak Pake Ribet.</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
          Dari gunung tertinggi hingga pantai tersembunyi, RENTPEAK menyediakan peralatan kualitas premium untuk setiap petualanganmu.
        </p>
      </header>

      {/* ETALASE BARANG */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Katalog Peralatan</h3>
            <p className="text-slate-500 mt-1">Pilih dan sewa alat sesuai kebutuhanmu.</p>
          </div>
        </div>

        {/* GRID BARANG */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-medium animate-pulse">Memuat peralatan...</div>
        ) : barang.length === 0 ? (
          <div className="text-center py-20 text-slate-400">Belum ada barang di toko.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {barang.map((item: any) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                
                {/* Kotak Gambar (Placeholder) */}
                <div className="h-48 bg-slate-200 w-full flex items-center justify-center relative">
                  <span className="text-slate-400 font-medium">Gambar {item.kategori}</span>
                  {/* Badge Status */}
                  <div className="absolute top-3 right-3">
                    {item.stok_tersedia > 0 ? (
                      <span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">Tersedia: {item.stok_tersedia}</span>
                    ) : (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">Habis</span>
                    )}
                  </div>
                </div>

                {/* Info Barang */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{item.kategori}</span>
                    <h4 className="text-lg font-bold text-slate-800 mt-1 mb-2 line-clamp-2">{item.nama}</h4>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">{item.deskripsi}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-black text-slate-900">
                        Rp {Number(item.harga_per_hari).toLocaleString()} <span className="text-sm text-slate-400 font-normal">/hari</span>
                      </span>
                    </div>
                    
                    {/* Tombol Sewa */}
                    <button 
                      onClick={() => alert("Nanti kita buat fitur klik langsung masuk keranjang/booking!")}
                      disabled={item.stok_tersedia === 0}
                      className={`w-full py-3 rounded-xl font-bold transition ${
                        item.stok_tersedia > 0 
                          ? "bg-slate-900 text-white hover:bg-blue-600 shadow-md" 
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {item.stok_tersedia > 0 ? "Sewa Sekarang" : "Stok Habis"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}