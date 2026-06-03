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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
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
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1">
                      <Link href="/profil" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium">
                        Profil Saya
                      </Link>
                      {user?.peran === "CUSTOMER" && (
                        <Link href="/riwayat-peminjaman" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium">
                          Riwayat Peminjaman
                        </Link>
                      )}
                      {user?.peran !== "CUSTOMER" && (
                        <Link href={user?.peran === "ADMIN" ? "/admin" : "/pegawai"} className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-bold">
                          Dashboard Staff
                        </Link>
                      )}
                      <div className="border-t border-slate-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold"
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
                  <Button variant="primary" size="sm">Daftar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION (Banner Atas) */}
      <header className="bg-slate-900 text-white text-center py-20 px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: '"Sora", sans-serif' }}>Sewa Alat Camping Gak Pake Ribet.</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
          Dari gunung tertinggi hingga pantai tersembunyi, RENTPEAK menyediakan peralatan kualitas premium untuk setiap petualanganmu.
        </p>
      </header>

      {/* ETALASE BARANG */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-1 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 space-y-4 md:space-y-0">
          <div>
            <h3 className="text-2xl font-bold text-slate-800" style={{ fontFamily: '"Sora", sans-serif' }}>Katalog Peralatan</h3>
            <p className="text-slate-500 mt-1">Pilih dan sewa alat sesuai kebutuhanmu.</p>
          </div>
          
          {/* SEARCH BAR */}
          <div className="w-full md:w-80">
            <Input 
              placeholder="Cari nama barang..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* FILTER KATEGORI (Pill Buttons) */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedCategory === cat 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID BARANG */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col space-y-4">
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <Skeleton className="h-10 w-full rounded-xl mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredBarang.length === 0 ? (
          // EMPTY STATE
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 border-dashed">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h4 className="text-xl font-bold text-slate-700" style={{ fontFamily: '"Sora", sans-serif' }}>Barang Tidak Ditemukan</h4>
            <p className="text-slate-500 mt-2">Coba gunakan kata kunci atau kategori pencarian yang lain.</p>
            <Button variant="secondary" className="mt-6" onClick={() => {setSearchTerm(""); setSelectedCategory("Semua");}}>
              Reset Pencarian
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBarang.map((item: any) => (
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
                      onClick={() => handleSewa(item.id)}
                      disabled={item.stok_tersedia === 0 || user?.peran === "ADMIN" || user?.peran === "PEGAWAI"}
                      className={`w-full py-3 rounded-xl font-bold transition ${
                        (user?.peran === "ADMIN" || user?.peran === "PEGAWAI") || item.stok_tersedia === 0
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900 text-white hover:bg-blue-600 shadow-md" 
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
    </div>
  );
}