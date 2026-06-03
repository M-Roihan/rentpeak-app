"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Badge, Skeleton, Input, Toast } from "@/components/ui";

export default function BarangDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [barang, setBarang] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [tglPinjam, setTglPinjam] = useState("");
  const [tglKembali, setTglKembali] = useState("");
  const [jumlah, setJumlah] = useState(1);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchBarang = async () => {
      try {
        const res = await fetch(`/api/barang/${id}`);
        const json = await res.json();
        if (json.data) {
          setBarang(json.data);
        }
      } catch (error) {
        console.error("Gagal memuat barang");
      } finally {
        setLoading(false);
      }
    };
    fetchBarang();
  }, [id]);

  // Kalkulasi total biaya berdasarkan selisih hari
  const calculateTotal = () => {
    if (!tglPinjam || !tglKembali || !barang) return 0;
    
    const start = new Date(tglPinjam);
    const end = new Date(tglKembali);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Pinjam dan kembali di hari yang sama dihitung 1 hari sewa minimum
    if (diffDays === 0) diffDays = 1;
    
    // Jika tanggal kembali lebih kecil dari pinjam, jangan hitung
    if (end < start) return 0;

    return diffDays * Number(barang.harga_per_hari) * jumlah;
  };

  const handleAddToCart = () => {
    if (barang.stok_tersedia === 0) return;
    
    if (localStorage.getItem("isProfileComplete") !== "true") {
      setToastMsg("Silakan lengkapi NIK dan No Telepon di profil Anda terlebih dahulu.");
      setTimeout(() => router.push("/profil"), 2000);
      return;
    }
    
    if (!tglPinjam || !tglKembali) {
      setToastMsg("Pilih tanggal pinjam dan kembali terlebih dahulu.");
      return;
    }

    const start = new Date(tglPinjam);
    const end = new Date(tglKembali);
    if (end < start) {
      setToastMsg("Tanggal kembali tidak boleh sebelum tanggal pinjam.");
      return;
    }

    const cartItem = {
      id: barang.id,
      nama: barang.nama,
      kategori: barang.kategori,
      harga_per_hari: barang.harga_per_hari,
      tglPinjam,
      tglKembali,
      jumlah,
      total: calculateTotal()
    };

    // Ambil keranjang lama dari localStorage
    const existingCart = JSON.parse(localStorage.getItem("rentpeak_cart") || "[]");
    
    // Validasi apakah barang sudah ada di keranjang
    const isExist = existingCart.find((item: any) => item.id === barang.id);
    if (isExist) {
       setToastMsg("Barang ini sudah ada di keranjang Anda!");
       return;
    }

    // Simpan item baru ke keranjang
    existingCart.push(cartItem);
    localStorage.setItem("rentpeak_cart", JSON.stringify(existingCart));
    
    setToastMsg("Berhasil ditambahkan ke keranjang!");
  };

  // Helper ilustrasi SVG per kategori
  const getSvgIcon = (kategori: string) => {
    const k = kategori?.toLowerCase();
    if (k?.includes("tenda")) return <svg className="w-24 h-24 text-emerald-500 opacity-50 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 21h18M5 21l7-14 7 14M12 7v14M8 15h8" /></svg>;
    if (k?.includes("carrier") || k?.includes("tas")) return <svg className="w-24 h-24 text-emerald-500 opacity-50 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
    if (k?.includes("masak")) return <svg className="w-24 h-24 text-emerald-500 opacity-50 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.5 3l-.5 4h-16l-.5-4h17zM3 7v11a2 2 0 002 2h14a2 2 0 002-2V7H3z" /></svg>;
    if (k?.includes("pakaian")) return <svg className="w-24 h-24 text-emerald-500 opacity-50 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    if (k?.includes("senter")) return <svg className="w-24 h-24 text-emerald-500 opacity-50 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    // Icon Default
    return <svg className="w-24 h-24 text-emerald-500 opacity-50 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
  };

  // --- RENDERING SKELETON LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] p-6 md:p-12 font-sans">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
           <Skeleton className="w-full md:w-1/2 h-[450px] rounded-3xl" />
           <div className="w-full md:w-1/2 space-y-6">
             <Skeleton className="w-32 h-8" />
             <Skeleton className="w-3/4 h-12" />
             <Skeleton className="w-1/2 h-8" />
             <Skeleton className="w-full h-32 rounded-2xl" />
             <div className="grid grid-cols-2 gap-4">
               <Skeleton className="w-full h-16 rounded-xl" />
               <Skeleton className="w-full h-16 rounded-xl" />
             </div>
             <Skeleton className="w-full h-14 rounded-xl" />
           </div>
        </div>
      </div>
    );
  }

  // --- RENDERING EMPTY STATE / NOT FOUND ---
  if (!barang) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] font-sans">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-stone-200 max-w-sm">
          <svg className="w-16 h-16 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <h2 className="text-2xl font-bold text-stone-800 font-sora" style={{ fontFamily: '"Sora", sans-serif' }}>Barang Tidak Ditemukan</h2>
          <Button variant="secondary" className="mt-6 w-full" onClick={() => router.push("/")}>Kembali ke Katalog</Button>
        </div>
      </div>
    );
  }

  const isTersedia = barang.stok_tersedia > 0;
  const totalBiaya = calculateTotal();
  const isStaff = typeof window !== "undefined" && (localStorage.getItem("role") === "ADMIN" || localStorage.getItem("role") === "PEGAWAI");

  // --- RENDERING MAIN COMPONENT ---
  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-stone-800 pb-20">
      
      {/* Komponen Toast Notifikasi */}
      {toastMsg && (
        <Toast 
          message={toastMsg} 
          type={toastMsg.includes("Berhasil") ? "success" : "error"} 
          onDismiss={() => setToastMsg("")} 
        />
      )}
      
      {/* Navbar Minimalis */}
      <nav className="bg-[#F9F8F6]/90 backdrop-blur-xl border-b border-stone-200/60 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
           <button onClick={() => router.push("/")} className="text-stone-500 hover:text-emerald-600 font-semibold flex items-center transition-colors">
             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             Kembali ke Katalog
           </button>
        </div>
      </nav>

      {/* Konten Utama Detail Barang */}
      <div className="max-w-5xl mx-auto mt-8 px-6 flex flex-col md:flex-row gap-8 lg:gap-12">
        
        {/* Kolom Kiri: Gambar Ilustrasi */}
        <div className="w-full md:w-1/2">
          <div className="bg-gradient-to-br from-[#F9F8F6] to-stone-100 group-hover:from-emerald-50/50 group-hover:to-teal-50/30 aspect-square rounded-3xl flex items-center justify-center border border-stone-200 shadow-sm relative overflow-hidden transition-colors duration-500">
             {barang.foto_url ? (
               <img src={barang.foto_url} alt={barang.nama} className="w-full h-full object-cover" />
             ) : (
               getSvgIcon(barang.kategori)
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-emerald-100/20 to-transparent"></div>
          </div>
        </div>

        {/* Kolom Kanan: Info Detail & Checkout Form */}
        <div className="w-full md:w-1/2 flex flex-col">
          
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100/50">
                {barang.kategori}
              </span>
              <Badge variant={barang.kondisi?.toUpperCase() === "RUSAK" ? "danger" : "success"}>
                Kondisi: {barang.kondisi || "BAIK"}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-2" style={{ fontFamily: '"Sora", sans-serif' }}>
              {barang.nama}
            </h1>
            
            <div className="text-2xl font-black text-emerald-900 mt-4 tracking-tight">
              Rp {Number(barang.harga_per_hari).toLocaleString("id-ID")} <span className="text-lg text-stone-400 font-normal">/ hari</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm mb-6">
            <h3 className="font-bold text-stone-800 mb-2">Deskripsi Produk</h3>
            <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
              {barang.deskripsi || "Belum ada deskripsi untuk produk ini."}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex-1">
            <h3 className="font-bold text-stone-800 mb-4 text-lg border-b border-stone-100 pb-3">Pesan Sekarang</h3>
            
            <div className="mb-5">
               {isTersedia ? (
                 <div className="flex items-center text-green-700 font-semibold mb-4 bg-green-50/50 border border-green-100 px-4 py-3 rounded-lg text-sm">
                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Stok Tersedia: {barang.stok_tersedia}
                 </div>
               ) : (
                 <div className="flex items-center text-red-700 font-semibold mb-4 bg-red-50/50 border border-red-100 px-4 py-3 rounded-lg text-sm">
                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Barang tidak tersedia (Stok Habis)
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
               <Input 
                 type="date" 
                 label="Tanggal Pinjam" 
                 value={tglPinjam}
                 onChange={(e) => setTglPinjam(e.target.value)}
                 disabled={!isTersedia}
                 min={new Date().toISOString().split("T")[0]}
               />
               <Input 
                 type="date" 
                 label="Tanggal Kembali" 
                 value={tglKembali}
                 onChange={(e) => setTglKembali(e.target.value)}
                 disabled={!tglPinjam || !isTersedia}
                 min={tglPinjam || new Date().toISOString().split("T")[0]}
               />
            </div>

            <div className="mb-6">
              <Input 
                 type="number" 
                 label="Jumlah Sewa" 
                 value={jumlah.toString()}
                 onChange={(e) => setJumlah(Math.max(1, Math.min(barang.stok_tersedia, Number(e.target.value))))}
                 disabled={!isTersedia}
                 min="1"
                 max={barang.stok_tersedia}
              />
            </div>

            {/* Kotak Estimasi Harga Muncul Otomatis */}
            {tglPinjam && tglKembali && totalBiaya > 0 && (
              <div className="mb-6 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex justify-between items-center transition-all">
                 <span className="text-stone-600 font-medium text-sm">Estimasi Biaya:</span>
                 <span className="text-xl font-black text-emerald-700">Rp {totalBiaya.toLocaleString("id-ID")}</span>
              </div>
            )}

            <button 
              className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all flex items-center justify-center gap-3 ${
                !isTersedia || isStaff
                  ? 'bg-stone-300 cursor-not-allowed'
                  : 'bg-stone-900 hover:bg-emerald-700 shadow-md shadow-stone-900/10 hover:shadow-emerald-700/20 active:scale-95'
              }`}
              disabled={!isTersedia || isStaff}
              onClick={handleAddToCart}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {isStaff ? "Hanya Untuk Customer" : (isTersedia ? "Tambah ke Keranjang" : "Stok Habis")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
