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

  const getSvgIcon = (kategori: string) => {
    const k = kategori?.toLowerCase();
    if (k?.includes("tenda")) return <svg className="w-16 h-16 text-blue-500 drop-shadow-md transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 21h18M5 21l7-14 7 14M12 7v14M8 15h8" /></svg>;
    if (k?.includes("carrier") || k?.includes("tas")) return <svg className="w-16 h-16 text-emerald-500 drop-shadow-md transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
    if (k?.includes("masak")) return <svg className="w-16 h-16 text-amber-500 drop-shadow-md transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.5 3l-.5 4h-16l-.5-4h17zM3 7v11a2 2 0 002 2h14a2 2 0 002-2V7H3z" /></svg>;
    if (k?.includes("pakaian")) return <svg className="w-16 h-16 text-purple-500 drop-shadow-md transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    if (k?.includes("senter")) return <svg className="w-16 h-16 text-yellow-500 drop-shadow-md transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    return <svg className="w-16 h-16 text-slate-500 drop-shadow-md transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter" style={{ fontFamily: '"Sora", sans-serif' }}>
              RENT<span className="text-blue-600">PEAK.</span>
            </h1>
          </Link>
          <div className="space-x-4 flex items-center">
            {authLoading ? (
              <Skeleton className="w-24 h-8 rounded-md" />
            ) : isAuthenticated ? (
              <>
                {/* Cart Icon */}
                {user?.peran === "CUSTOMER" && (
                  <button 
                    onClick={() => router.push("/keranjang")} 
                    className="relative p-2 text-slate-600 hover:text-blue-600 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}

                <NotificationBell />
                
                {/* User Dropdown */}
                <div className="relative user-dropdown-container ml-2">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-slate-700 font-semibold hover:text-blue-600 transition"
                  >
                    Halo, {userName}
                    <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1">
                      <Link href="/profil" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                        Profil Saya
                      </Link>
                      {user?.peran === "CUSTOMER" && (
                        <Link href="/riwayat-peminjaman" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                          Riwayat Peminjaman
                        </Link>
                      )}
                      {user?.peran !== "CUSTOMER" && (
                        <Link href={user?.peran === "ADMIN" ? "/admin" : "/pegawai"} className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-bold transition-colors">
                          Dashboard Staff
                        </Link>
                      )}
                      <div className="border-t border-slate-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors"
                      >
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-600 font-semibold hover:text-blue-600 transition">
                  Masuk
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="shadow-blue-200">Daftar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative overflow-hidden bg-slate-950 text-white text-center py-32 px-6">
        {/* Dynamic Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400" style={{ fontFamily: '"Sora", sans-serif' }}>
            Petualangan Dimulai Dari Sini.
          </h2>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Sewa perlengkapan outdoor premium tanpa ribet. Mulai dari tenda, carrier, hingga alat masak, kami siapkan semuanya untuk perjalanan hebatmu selanjutnya.
          </p>
          <a href="#katalog" className="inline-flex items-center bg-white text-slate-900 font-bold px-8 py-4 rounded-full shadow-xl shadow-white/10 hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300">
            Eksplorasi Katalog
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          </a>
        </div>
      </header>

      {/* ETALASE BARANG */}
      <main id="katalog" className="max-w-7xl mx-auto px-6 py-20 flex-1 w-full scroll-mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 space-y-4 md:space-y-0">
          <div>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: '"Sora", sans-serif' }}>Katalog Peralatan</h3>
            <p className="text-slate-500 mt-2 text-lg">Pilih dan sewa alat sesuai kebutuhan petualanganmu.</p>
          </div>
          
          {/* SEARCH BAR */}
          <div className="w-full md:w-80">
            <Input 
              placeholder="Cari perlengkapan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow-sm"
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
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
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
              <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col space-y-4">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <Skeleton className="h-12 w-full rounded-xl mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredBarang.length === 0 ? (
          // EMPTY STATE
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h4 className="text-2xl font-bold text-slate-800" style={{ fontFamily: '"Sora", sans-serif' }}>Peralatan Tidak Ditemukan</h4>
            <p className="text-slate-500 mt-2 text-lg">Coba gunakan kata kunci atau kategori pencarian yang lain.</p>
            <Button variant="secondary" className="mt-8 px-8 py-3 rounded-xl" onClick={() => {setSearchTerm(""); setSelectedCategory("Semua");}}>
              Tampilkan Semua Peralatan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredBarang.map((item: any) => (
              <div key={item.id} className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 flex flex-col transform hover:-translate-y-2">
                
                {/* Kotak Gambar (SVG Ilustrasi) */}
                <div className="h-56 w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-blue-50 group-hover:to-indigo-50 transition-colors duration-500">
                  {getSvgIcon(item.kategori)}
                  
                  {/* Glassmorphism Badge */}
                  <div className="absolute top-4 right-4">
                    {item.stok_tersedia > 0 ? (
                      <span className="backdrop-blur-md bg-white/80 border border-white/50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">Tersedia: {item.stok_tersedia}</span>
                    ) : (
                      <span className="backdrop-blur-md bg-red-500/90 border border-red-400/50 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">Habis</span>
                    )}
                  </div>
                </div>

                {/* Info Barang */}
                <div className="p-6 flex-1 flex flex-col justify-between bg-white relative z-10">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full">{item.kategori}</span>
                    <h4 className="text-xl font-bold text-slate-900 mt-4 mb-2 line-clamp-2 leading-snug" style={{ fontFamily: '"Sora", sans-serif' }}>{item.nama}</h4>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">{item.deskripsi}</p>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex flex-col mb-5">
                      <span className="text-sm font-medium text-slate-400 mb-1">Harga Sewa</span>
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        Rp {Number(item.harga_per_hari).toLocaleString()} <span className="text-sm text-slate-400 font-normal">/hari</span>
                      </span>
                    </div>
                    
                    {/* Tombol Sewa */}
                    <button 
                      onClick={() => handleSewa(item.id)}
                      disabled={item.stok_tersedia === 0 || user?.peran === "ADMIN" || user?.peran === "PEGAWAI"}
                      className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 ${
                        (user?.peran === "ADMIN" || user?.peran === "PEGAWAI") || item.stok_tersedia === 0
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-900/10 hover:shadow-blue-600/30 group-hover:scale-[1.02]" 
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
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl font-black text-white mb-3 tracking-tighter" style={{ fontFamily: '"Sora", sans-serif' }}>
              RENT<span className="text-blue-500">PEAK.</span>
            </h2>
            <p className="text-sm leading-relaxed max-w-xs text-slate-400">
              Platform penyewaan perlengkapan outdoor premium. Kami membuat petualanganmu lebih mudah, aman, dan berkesan. Siapkan perjalananmu sekarang.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#katalog" className="hover:text-blue-400 transition-colors">Katalog Alat</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Cara Sewa</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">Hubungi Kami</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-slate-300"><svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> hello@rentpeak.com</li>
              <li className="flex items-center text-slate-300"><svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> +62 812 3456 7890</li>
              <li className="flex items-center mt-4 pt-4 border-t border-slate-800 text-slate-400">
                Jakarta, Indonesia
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-8 pt-4 border-t border-slate-900 text-xs text-center text-slate-500">
          &copy; {new Date().getFullYear()} RentPeak. All rights reserved.
        </div>
      </footer>
    </div>
  );
}