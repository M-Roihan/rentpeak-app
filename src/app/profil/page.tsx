"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatTanggal } from "@/lib/utils";

export default function ProfilPage() {
  const [userData, setUserData] = useState<any>(null);
  const [formNIK, setFormNIK] = useState("");
  const [formNoTelp, setFormNoTelp] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login?redirect=/profil");
          return;
        }

        const res = await fetch("/api/user/profil", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const json = await res.json();
        if (res.ok && json.data) {
          setUserData(json.data);
          setFormNIK(json.data.NIK || "");
          setFormNoTelp(json.data.no_telp || "");
        } else {
          showToast(json.pesan || "Gagal mengambil data profil", "error");
        }
      } catch (error) {
        showToast("Terjadi kesalahan koneksi", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [router]);

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/profil", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          NIK: formNIK ? formNIK : undefined, 
          no_telp: formNoTelp ? formNoTelp : undefined 
        })
      });

      const json = await res.json();

      if (res.ok) {
        showToast("Profil berhasil diperbarui", "success");
        setUserData(json.data);
        if (json.data.NIK && json.data.no_telp) {
          localStorage.setItem("isProfileComplete", "true");
        } else {
          localStorage.setItem("isProfileComplete", "false");
        }
      } else {
        showToast(json.pesan || "Gagal memperbarui profil", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans pb-16">
      {/* Navbar Minimalis */}
      <nav className="bg-[#F9F8F6]/90 backdrop-blur-xl border-b border-stone-200/60 sticky top-0 z-10 shadow-sm transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center text-stone-600 hover:text-emerald-700 transition-colors font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Katalog
          </Link>
          <div className="font-black text-stone-900 text-xl tracking-tight" style={{ fontFamily: '"Sora", sans-serif' }}>
            RENT<span className="text-emerald-600">PEAK.</span>
          </div>
        </div>
      </nav>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg z-50 flex items-center transition-all ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 mt-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-8" style={{ fontFamily: '"Sora", sans-serif' }}>Profil Saya</h1>

        {loading ? (
          /* Loading Skeleton */
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 animate-pulse flex items-center gap-6">
              <div className="w-24 h-24 bg-stone-200 rounded-full flex-shrink-0"></div>
              <div className="space-y-3 flex-1">
                <div className="h-6 bg-stone-200 rounded w-1/2"></div>
                <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                <div className="h-6 bg-stone-200 rounded w-24 rounded-full mt-2"></div>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 animate-pulse space-y-6">
              <div className="h-5 bg-stone-200 rounded w-1/4 mb-4"></div>
              <div className="h-12 bg-stone-200 rounded w-full"></div>
              <div className="h-12 bg-stone-200 rounded w-full"></div>
              <div className="h-12 bg-stone-200 rounded w-full"></div>
            </div>
          </div>
        ) : (
          userData && (
            <div className="space-y-6">
              {/* SECTION 1 - Info Akun */}
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-emerald-50/50"></div>
                
                <div className="w-24 h-24 bg-emerald-700 text-white rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md relative z-10 flex-shrink-0" style={{ fontFamily: '"Sora", sans-serif' }}>
                  {getInitials(userData.nama)}
                </div>
                
                <div className="text-center sm:text-left relative z-10 w-full pt-2">
                  <h2 className="text-2xl font-bold text-stone-900 mb-1">{userData.nama}</h2>
                  <p className="text-stone-500 mb-3">{userData.email}</p>
                  
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mt-4 pt-4 border-t border-stone-100">
                    <div>
                      <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Peran</span>
                      <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase">
                        {userData.peran}
                      </span>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-stone-200"></div>
                    <div>
                      <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Bergabung Sejak</span>
                      <span className="text-sm font-medium text-stone-700">
                        {formatTanggal(userData.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning NIK */}
              {!userData.NIK && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-5 flex items-start gap-3 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-bold mb-1">Perhatian!</h4>
                    <p className="text-sm opacity-90 leading-relaxed">
                      Data NIK belum dilengkapi. NIK sangat diperlukan saat pengambilan barang sebagai verifikasi identitas di lokasi penyewaan.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 2 - Form Data Diri */}
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
                <h3 className="text-xl font-bold text-stone-800 mb-6 border-b border-stone-100 pb-4">Lengkapi Data Diri</h3>
                
                <form onSubmit={handleSimpan} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nomor Induk Kependudukan (NIK)</label>
                    <input 
                      type="text" 
                      maxLength={16}
                      className="w-full p-3.5 bg-[#F9F8F6] border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono text-stone-700"
                      placeholder="Masukkan 16 digit NIK"
                      value={formNIK}
                      onChange={(e) => setFormNIK(e.target.value.replace(/[^0-9]/g, ''))} // Hanya angka
                    />
                    <p className="text-xs text-stone-500 mt-2 font-medium">16 digit angka sesuai KTP Anda.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nomor Telepon / WhatsApp</label>
                    <input 
                      type="tel" 
                      className="w-full p-3.5 bg-[#F9F8F6] border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono text-stone-700"
                      placeholder="081234567890"
                      value={formNoTelp}
                      onChange={(e) => setFormNoTelp(e.target.value.replace(/[^0-9]/g, ''))} // Hanya angka
                    />
                  </div>

                  <div className="pt-4 mt-6 border-t border-stone-100">
                    <button 
                      type="submit"
                      disabled={saving}
                      className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                        saving
                          ? 'bg-stone-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                      }`}
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan Perubahan"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
