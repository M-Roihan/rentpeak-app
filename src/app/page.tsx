"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Input, Button, Skeleton } from "@/components/ui";
import { NotificationBell } from "@/components/features/NotificationBell";

export default function Home() {
  const [barang, setBarang] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [userName, setUserName] = useState("Pengguna");
  const [cartCount, setCartCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cart = JSON.parse(localStorage.getItem("rentpeak_cart") || "[]");
      setCartCount(cart.length);

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.user-dropdown-container')) {
          setIsDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, []);
  
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();

  const categories = ["Semua", "Tenda", "Carrier", "Alat Masak", "Pakaian", "Senter"];

  // Ambil nama pengguna dari localStorage jika ada
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName");
      if (storedName) setUserName(storedName);
    }
  }, []);

  // Ambil data dari database saat web pertama kali dibuka
  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const res = await fetch("/api/barang");
        const json = await res.json();
        // Cek fallback struktur data dari API response
        if (json.data) {
          setBarang(json.data);
        } else if (Array.isArray(json)) {
          setBarang(json);
        } else {
          setBarang([]);
        }
      } catch (error) {
        console.error("Gagal mengambil data barang");
        setBarang([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBarang();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    window.location.reload(); 
  };

  const handleSewa = (id: string) => {
    if (!isAuthenticated) {
      router.push("/login?error=auth_required");
    } else if (user?.peran === "ADMIN" || user?.peran === "PEGAWAI") {
      alert("Hanya customer yang dapat melakukan sewa.");
    } else if (localStorage.getItem("isProfileComplete") !== "true") {
      alert("Silakan lengkapi NIK dan No Telepon di profil Anda terlebih dahulu.");
      router.push("/profil");
    } else {
      router.push(`/barang/${id}`);
    }
  };

  // Logika filtering
  const filteredBarang = barang.filter((item) => {
    const matchName = item.nama?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === "Semua" || item.kategori?.toLowerCase() === selectedCategory.toLowerCase();
    return matchName && matchCategory;
  });

  // Ikon disesuaikan dengan tema alam
  const getSvgIcon = (kategori: string) => {
    const k = kategori?.toLowerCase();
    if (k?.includes("tenda")) return <svg className="w-16 h-16 text-emerald-600 drop-shadow-sm transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 21h18M5 21l7-14 7 14M12 7v14M8 15h8" /></svg>;
    if (k?.includes("carrier") || k?.includes("tas")) return <svg className="w-16 h-16 text-amber-600 drop-shadow-sm transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
    if (k?.includes("masak")) return <svg className="w-16 h-16 text-orange-500 drop-shadow-sm transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.5 3l-.5 4h-16l-.5-4h17zM3 7v11a2 2 0 002 2h14a2 2 0 002-2V7H3z" /></svg>;
    if (k?.includes("pakaian")) return <svg className="w-16 h-16 text-teal-600 drop-shadow-sm transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    if (k?.includes("senter")) return <svg className="w-16 h-16 text-yellow-500 drop-shadow-sm transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    return <svg className="w-16 h-16 text-stone-400 drop-shadow-sm transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-stone-800 flex flex-col">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#F9F8F6]/90 backdrop-blur-xl border-b border-stone-200/60 shadow-sm transition-all duration-300">
        <div className="w-full px-6 md:px-12 py-4 flex justify-between items-center gap-8">
          {/* LOGO (Pojok Kiri) */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-black text-stone-900 tracking-tighter hover:scale-105 transition-transform" style={{ fontFamily: '"Sora", sans-serif' }}>
              RENT<span className="text-emerald-600">PEAK.</span>
            </h1>
          </Link>

          {/* MAIN NAVBAR CONTENT */}
          <div className="flex-1 flex justify-between items-center">
            {/* KIRI/TENGAH: MENU LINKS */}
            <div className="flex items-center gap-8">
              {authLoading ? (
                <Skeleton className="w-48 h-6 rounded-md hidden md:block bg-stone-200" />
              ) : isAuthenticated ? (
                <div className="hidden md:flex items-center gap-6">
                  <Link href="/profil" className="flex items-center gap-2 text-stone-600 font-semibold hover:text-emerald-700 transition group">
                    <svg className="w-5 h-5 text-stone-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Profil 
                  </Link>
                  {user?.peran === "CUSTOMER" && (
                    <Link href="/riwayat-peminjaman" className="flex items-center gap-2 text-stone-600 font-semibold hover:text-emerald-700 transition group">
                      <svg className="w-5 h-5 text-stone-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                      Riwayat 
                    </Link>
                  )}
                </div>
              ) : (
                <div />
              )}
            </div>

            {/* KANAN: ICONS & USER */}
            <div className="flex items-center gap-3 sm:gap-5">
              {authLoading ? (
                <Skeleton className="w-32 h-10 rounded-full bg-stone-200" />
              ) : isAuthenticated ? (
                <>
                  {/* Cart Icon */}
                  {user?.peran === "CUSTOMER" && (
                    <button 
                      onClick={() => router.push("/keranjang")} 
                      className="relative p-2.5 bg-white rounded-full text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-sm border border-stone-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  )}

                  <NotificationBell />
                  
                  {/* User Dropdown */}
                  <div className="relative user-dropdown-container ml-1">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white border border-stone-200 rounded-full hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm"
                    >
                      <div className="w-8 h-8 bg-emerald-700 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-inner">
                        {userName ? userName[0].toUpperCase() : "U"}
                      </div>
                      <span className="text-stone-700 font-semibold text-sm hidden sm:block">
                        Halo, {userName.split(" ")[0]}
                      </span>
                      <svg className={`w-4 h-4 text-stone-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-stone-100 overflow-hidden py-2 transform origin-top-right transition-all">
                        {user?.peran !== "CUSTOMER" && (
                          <>
                            <Link href={user?.peran === "ADMIN" ? "/admin" : "/pegawai"} className="flex items-center gap-3 px-5 py-3 text-sm text-emerald-700 hover:bg-emerald-50 font-bold transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                              Dashboard Staff
                            </Link>
                            <div className="border-t border-stone-100 my-1"></div>
                          </>
                        )}
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                          Keluar Akun
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-stone-600 font-semibold hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                    Masuk
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className="bg-emerald-700 hover:bg-emerald-800 shadow-emerald-200 text-white rounded-full px-6 py-2 flex items-center gap-2 border-none">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                      Daftar
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative overflow-hidden bg-[#0A1F18] text-white text-center py-32 px-6">
        {/* Dynamic Background Effects - Earthy Tones */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-teal-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="text-emerald-400 font-semibold tracking-widest text-sm uppercase mb-4 block">Siapkan Perjalananmu</span>
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-100 via-stone-100 to-teal-100" style={{ fontFamily: '"Sora", sans-serif' }}>
            Menyatu Dengan Alam Dimulai Dari Sini.
          </h2>
          <p className="text-stone-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Sewa perlengkapan outdoor premium tanpa ribet. Mulai dari tenda, carrier, hingga alat masak, kami siapkan semuanya untuk petualangan terhebatmu.
          </p>
          <a href="#katalog" className="inline-flex items-center bg-emerald-600 text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-emerald-900/50 hover:bg-emerald-500 hover:-translate-y-1 transition-all duration-300 border border-emerald-500/50">
            Eksplorasi Katalog
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          </a>
        </div>
      </header>

      {/* ETALASE BARANG */}
      <main id="katalog" className="max-w-7xl mx-auto px-6 py-20 flex-1 w-full scroll-mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 space-y-4 md:space-y-0">
          <div>
            <h3 className="text-3xl font-bold text-stone-900 tracking-tight" style={{ fontFamily: '"Sora", sans-serif' }}>Katalog Peralatan</h3>
            <p className="text-stone-500 mt-2 text-lg">Pilih perlengkapan andalan untuk ekspedisimu selanjutnya.</p>
          </div>
          
          {/* SEARCH BAR */}
          <div className="w-full md:w-80">
            <Input 
              placeholder="Cari perlengkapan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow-sm border-stone-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
            />
          </div>
        </div>

        {/* FILTER KATEGORI (Pill Buttons) */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === cat 
                  ? "bg-emerald-800 text-white shadow-md shadow-emerald-900/20 border border-emerald-800" 
                  : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID BARANG */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex flex-col space-y-4">
                <Skeleton className="h-48 w-full rounded-2xl bg-stone-100" />
                <Skeleton className="h-5 w-1/3 bg-stone-100" />
                <Skeleton className="h-7 w-3/4 bg-stone-100" />
                <Skeleton className="h-4 w-full mt-2 bg-stone-100" />
                <Skeleton className="h-4 w-5/6 mb-4 bg-stone-100" />
                <Skeleton className="h-12 w-full rounded-xl mt-auto bg-stone-100" />
              </div>
            ))}
          </div>
        ) : filteredBarang.length === 0 ? (
          // EMPTY STATE
          <div className="text-center py-24 bg-white rounded-3xl border border-stone-200 border-dashed shadow-sm">
            <svg className="w-20 h-20 text-stone-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h4 className="text-2xl font-bold text-stone-800" style={{ fontFamily: '"Sora", sans-serif' }}>Peralatan Tidak Ditemukan</h4>
            <p className="text-stone-500 mt-2 text-lg">Coba gunakan kata kunci atau kategori pencarian yang lain.</p>
            <Button variant="secondary" className="mt-8 px-8 py-3 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 border-none" onClick={() => {setSearchTerm(""); setSelectedCategory("Semua");}}>
              Tampilkan Semua Peralatan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredBarang.map((item: any) => (
              <div key={item.id} className="group bg-white rounded-3xl shadow-sm border border-stone-200/60 overflow-hidden hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500 flex flex-col transform hover:-translate-y-1">
                
                {/* Kotak Gambar (SVG Ilustrasi) */}
                <div className="h-56 w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#F9F8F6] to-stone-100 group-hover:from-emerald-50/50 group-hover:to-teal-50/30 transition-colors duration-500">
                  {getSvgIcon(item.kategori)}
                  
                  {/* Glassmorphism Badge */}
                  <div className="absolute top-4 right-4">
                    {item.stok_tersedia > 0 ? (
                      <span className="backdrop-blur-md bg-white/90 border border-stone-200 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                        Tersedia: {item.stok_tersedia}
                      </span>
                    ) : (
                      <span className="backdrop-blur-md bg-red-50/90 border border-red-200 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                        Habis
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Barang */}
                <div className="p-6 flex-1 flex flex-col justify-between bg-white relative z-10">
                  <div>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50">
                      {item.kategori}
                    </span>
                    <h4 className="text-xl font-bold text-stone-900 mt-4 mb-2 line-clamp-2 leading-snug" style={{ fontFamily: '"Sora", sans-serif' }}>{item.nama}</h4>
                    <p className="text-stone-500 text-sm line-clamp-2 mb-6 leading-relaxed">{item.deskripsi}</p>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex flex-col mb-5">
                      <span className="text-sm font-medium text-stone-400 mb-1">Harga Sewa</span>
                      <span className="text-2xl font-black text-emerald-900 tracking-tight">
                        Rp {Number(item.harga_per_hari).toLocaleString()} <span className="text-sm text-stone-400 font-normal">/hari</span>
                      </span>
                    </div>
                    
                    {/* Tombol Sewa */}
                    <button 
                      onClick={() => handleSewa(item.id)}
                      disabled={item.stok_tersedia === 0 || user?.peran === "ADMIN" || user?.peran === "PEGAWAI"}
                      className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 ${
                        (user?.peran === "ADMIN" || user?.peran === "PEGAWAI") || item.stok_tersedia === 0
                          ? "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
                          : "bg-stone-900 text-white hover:bg-emerald-700 shadow-md shadow-stone-900/10 hover:shadow-emerald-700/20 active:scale-95" 
                      }`}
                    >
                      {user?.peran === "ADMIN" || user?.peran === "PEGAWAI" 
                        ? "Hanya Untuk Customer"
                        : (item.stok_tersedia > 0 ? "Sewa Sekarang" : "Stok Habis")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0A1F18] text-stone-400 py-12 border-t border-[#13382D] mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl font-black text-white mb-4 tracking-tighter" style={{ fontFamily: '"Sora", sans-serif' }}>
              RENT<span className="text-emerald-500">PEAK.</span>
            </h2>
            <p className="text-sm leading-relaxed max-w-xs text-stone-400">
              Platform penyewaan perlengkapan outdoor premium. Kami membuat petualanganmu lebih mudah, aman, dan menyatu dengan alam. Siapkan perjalananmu sekarang.
            </p>
          </div>
          <div>
            <h4 className="text-stone-200 font-bold mb-4 uppercase tracking-wider text-xs">Tautan Cepat</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#katalog" className="hover:text-emerald-400 transition-colors">Katalog Alat</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Cara Sewa</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-stone-200 font-bold mb-4 uppercase tracking-wider text-xs">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center text-stone-300"><svg className="w-4 h-4 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> hello@rentpeak.com</li>
              <li className="flex items-center text-stone-300"><svg className="w-4 h-4 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> +62 812 3456 7890</li>
              <li className="flex items-center mt-5 pt-5 border-t border-[#13382D] text-stone-400">
                Jakarta, Indonesia
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-[#13382D] text-xs text-center text-stone-500">
          &copy; {new Date().getFullYear()} RentPeak. All rights reserved.
        </div>
      </footer>
    </div>
  );
}