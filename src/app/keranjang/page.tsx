"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatRupiah, formatTanggal } from "@/lib/utils";

type CartItem = {
  id: string;
  nama: string;
  kategori: string;
  harga_per_hari: number;
  tglPinjam: string;
  tglKembali: string;
  jumlah: number;
  total: number;
};

export default function KeranjangPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Proteksi halaman: pastikan sudah login
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=/keranjang");
      return;
    }
    
    const role = localStorage.getItem("role");
    if (role === "ADMIN" || role === "PEGAWAI") {
      router.push("/");
      return;
    }

    if (localStorage.getItem("isProfileComplete") !== "true") {
      alert("Silakan lengkapi NIK dan No Telepon di profil Anda terlebih dahulu.");
      router.push("/profil");
      return;
    }

    // Ambil data dari localStorage
    const storedCart = localStorage.getItem("rentpeak_cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Gagal parse data keranjang:", error);
      }
    }
    setLoading(false);
  }, [router]);

  const handleHapusItem = (id: string) => {
    // Filter out item yang dihapus
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("rentpeak_cart", JSON.stringify(updatedCart));
  };

  const totalSemuaItem = cartItems.reduce((total, item) => total + item.total, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] py-10 px-4 font-sans text-stone-800">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 mb-6 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Lanjut Belanja
          </Link>
          <h1 className="text-3xl font-bold" style={{ fontFamily: '"Sora", sans-serif' }}>Keranjang Sewa</h1>
          <p className="text-stone-500 mt-1 font-light">Barang yang kamu pilih</p>
        </div>

        {/* Content */}
        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-12 text-center flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-stone-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-xl font-bold text-stone-700 mb-2">Keranjang masih kosong</h3>
            <p className="text-stone-500 mb-8 max-w-sm">Kamu belum memilih perlengkapan apapun. Yuk lihat katalog kami untuk mulai menyewa!</p>
            <Link 
              href="/" 
              className="bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-emerald-700 transition-colors inline-block"
            >
              Lihat Katalog
            </Link>
          </div>
        ) : (
          /* List Keranjang */
          <div className="space-y-6">
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 flex flex-col sm:flex-row gap-5 transition-all hover:border-emerald-200">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full mb-2 uppercase tracking-wider">
                          {item.kategori}
                        </span>
                        <h3 className="font-bold text-xl text-stone-900">{item.nama}</h3>
                      </div>
                      <button 
                        onClick={() => handleHapusItem(item.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-colors"
                        title="Hapus Item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-stone-600 mb-5 bg-[#F9F8F6] p-4 rounded-xl border border-stone-200">
                      <div>
                        <span className="block text-stone-400 text-xs mb-1 uppercase font-semibold">Tanggal Pinjam</span>
                        <span className="font-medium text-stone-800">{formatTanggal(item.tglPinjam)}</span>
                      </div>
                      <div>
                        <span className="block text-stone-400 text-xs mb-1 uppercase font-semibold">Tanggal Kembali</span>
                        <span className="font-medium text-stone-800">{formatTanggal(item.tglKembali)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end border-t border-stone-100 pt-4">
                      <div className="text-stone-500 text-sm">
                        {formatRupiah(item.harga_per_hari)} <span className="text-xs">/ hari</span>
                        <div className="mt-1 text-stone-700 font-semibold">Jumlah: {item.jumlah || 1} unit</div>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs text-stone-400 uppercase font-semibold mb-1">Total Biaya Item</span>
                        <span className="font-bold text-emerald-600 text-xl">{formatRupiah(item.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Box */}
            <div className="bg-stone-900 text-white rounded-3xl p-6 md:p-8 mt-8 shadow-xl">
              <h3 className="text-lg font-bold mb-4 opacity-90">Ringkasan Pesanan</h3>
              <div className="flex justify-between items-center mb-8 pb-8 border-b border-stone-700/50">
                <span className="text-stone-300 font-medium">Total Keseluruhan</span>
                <span className="font-bold text-3xl text-emerald-400" style={{ fontFamily: '"Sora", sans-serif' }}>
                  {formatRupiah(totalSemuaItem)}
                </span>
              </div>
              
              <button 
                onClick={() => router.push("/checkout")}
                className="bg-emerald-600 text-white rounded-xl py-4 w-full font-bold text-lg hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                Lanjut ke Checkout
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
