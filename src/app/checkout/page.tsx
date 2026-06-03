"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { Toast } from "@/components/ui";

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

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [metodePembayaran, setMetodePembayaran] = useState<"transfer" | "tunai" | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedCart = localStorage.getItem("rentpeak_cart");

    if (!token) {
      // Bawa redirect back ke checkout setelah login (jika flow login mendukung)
      router.push("/login?redirect=/checkout");
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

    if (!storedCart) {
      router.push("/");
      return;
    }

    try {
      const parsedCart = JSON.parse(storedCart);
      if (parsedCart.length === 0) {
        router.push("/");
        return;
      }
      setCartItems(parsedCart);
    } catch (error) {
      console.error("Gagal parse data keranjang:", error);
      router.push("/");
    }
    setIsPageLoading(false);
  }, [router]);

  const totalKeseluruhan = cartItems.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async () => {
    if (!metodePembayaran) return;
    
    setIsLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        // Asumsi semua item di keranjang punya tanggal pinjam & kembali yang sama
        // karena di RentPeak biasanya 1 booking = 1 periode
        tanggal_pinjam: cartItems[0].tglPinjam,
        tanggal_kembali: cartItems[0].tglKembali,
        metode_pembayaran: metodePembayaran,
        items: cartItems.map(i => ({ 
          barang_id: i.id, 
          jumlah: i.jumlah || 1 
        }))
      };

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        // Hapus keranjang karena sudah jadi booking
        localStorage.removeItem("rentpeak_cart");
        
        // Coba baca format response, fallback jika nama property berbeda
        const idToRedirect = data.data?.id || data.id || data.booking?.id || "";
        
        setToastMsg("Checkout berhasil! Anda akan dialihkan...");
        setTimeout(() => {
          router.push(`/pembayaran-berhasil?id=${idToRedirect}`);
        }, 2000);
      } else {
        setErrorMsg(data.pesan || "Terjadi kesalahan saat memproses pesanan.");
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMsg("Koneksi jaringan gagal. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] py-10 px-4 font-sans text-stone-800">
      {toastMsg && (
        <Toast 
          message={toastMsg} 
          type="success" 
          onDismiss={() => setToastMsg("")} 
        />
      )}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/keranjang" 
            className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 mb-6 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Keranjang
          </Link>
          <h1 className="text-3xl font-bold" style={{ fontFamily: '"Sora", sans-serif' }}>Checkout</h1>
          <p className="text-stone-500 mt-1 font-light">Selesaikan pembayaran untuk mengonfirmasi pesananmu</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Kiri: Ringkasan Pesanan */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">Ringkasan Pesanan</h2>
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 lg:p-8 space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between py-4 border-b border-stone-100 last:border-0 last:pb-0">
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-stone-800 mb-1.5 text-lg">{item.nama} <span className="text-sm font-normal text-stone-500 ml-2">(x{item.jumlah || 1})</span></h3>
                    <div className="text-sm text-stone-500 space-y-1">
                      <p><span className="font-medium text-stone-400">Pinjam:</span> {formatTanggal(item.tglPinjam)}</p>
                      <p><span className="font-medium text-stone-400">Kembali:</span> {formatTanggal(item.tglKembali)}</p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:text-right flex flex-col justify-end">
                    <span className="font-bold text-stone-800 text-lg">{formatRupiah(item.total)}</span>
                  </div>
                </div>
              ))}
              
              <div className="pt-6 mt-2 border-t-2 border-stone-100 flex justify-between items-center">
                <span className="text-stone-500 font-semibold">Total Keseluruhan</span>
                <span className="font-bold text-2xl text-emerald-600" style={{ fontFamily: '"Sora", sans-serif' }}>
                  {formatRupiah(totalKeseluruhan)}
                </span>
              </div>
            </div>
          </div>

          {/* Kanan: Form Pembayaran */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">Metode Pembayaran</h2>
            
            {errorMsg && (
              <div className="p-4 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 lg:p-8 space-y-4">
              {/* Radio Transfer */}
              <label 
                className={`flex items-start p-5 rounded-xl cursor-pointer border-2 transition-all ${
                  metodePembayaran === "transfer" 
                    ? "border-emerald-600 bg-emerald-50/50" 
                    : "border-stone-100 hover:border-emerald-300"
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  <input 
                    type="radio" 
                    name="metode_pembayaran" 
                    value="transfer"
                    checked={metodePembayaran === "transfer"}
                    onChange={() => setMetodePembayaran("transfer")}
                    className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <span className="block text-lg font-bold text-stone-800">Transfer Bank</span>
                  <span className="block text-sm text-stone-500 mt-1">BCA / BNI / Mandiri (Simulasi)</span>
                </div>
              </label>

              {/* Radio Tunai */}
              <label 
                className={`flex items-start p-5 rounded-xl cursor-pointer border-2 transition-all ${
                  metodePembayaran === "tunai" 
                    ? "border-emerald-600 bg-emerald-50/50" 
                    : "border-stone-100 hover:border-emerald-300"
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  <input 
                    type="radio" 
                    name="metode_pembayaran" 
                    value="tunai"
                    checked={metodePembayaran === "tunai"}
                    onChange={() => setMetodePembayaran("tunai")}
                    className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <span className="block text-lg font-bold text-stone-800">Bayar di Tempat</span>
                  <span className="block text-sm text-stone-500 mt-1">Bayar saat mengambil barang</span>
                </div>
              </label>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={!metodePembayaran || isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all flex items-center justify-center gap-3 ${
                !metodePembayaran || isLoading
                  ? 'bg-stone-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                "Konfirmasi & Bayar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
