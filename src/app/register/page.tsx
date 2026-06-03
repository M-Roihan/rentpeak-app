"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email wajib diisi";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Konfirmasi password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Hapus pesan error saat user mulai mengetik
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    setServerError("");

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    // Hentikan jika validasi client-side gagal
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: formData.nama,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Registrasi berhasil! Mengalihkan ke halaman login...");
        // Tunggu sebentar agar user bisa membaca pesan sukses
        setTimeout(() => {
          router.push("/login?registered=true");
        }, 2000);
      } else {
        setServerError(data.pesan || data.error || "Gagal melakukan registrasi");
        setLoading(false);
      }
    } catch (error) {
      setServerError("Terjadi kesalahan koneksi jaringan");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6] py-10 px-4">
      <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-xl border border-stone-200">
        <h2 
          className="text-3xl font-black text-center text-stone-900 tracking-tighter mb-2" 
          style={{ fontFamily: '"Sora", sans-serif' }}
        >
          Buat Akun Rent<span className="text-emerald-600">Peak.</span>
        </h2>
        <p className="text-center text-stone-500 mb-8 font-light">
          Mulai petualangan outdoor Anda bersama kami
        </p>
        
        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-700 border border-green-200 text-sm font-medium text-center">
            {successMsg}
          </div>
        )}

        {serverError && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm font-medium text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-semibold text-stone-700">Nama Lengkap</label>
              <input 
                type="text" 
                name="nama"
                className={`mt-1 w-full p-3 border rounded-xl focus:ring-2 outline-none transition-all ${errors.nama ? 'border-red-500 focus:ring-red-500' : 'border-stone-300 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                placeholder="John Doe"
                value={formData.nama}
                onChange={handleChange}
              />
              {errors.nama && <p className="mt-1 text-xs text-red-500">{errors.nama}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-stone-700">Email</label>
              <input 
                type="email" 
                name="email"
                className={`mt-1 w-full p-3 border rounded-xl focus:ring-2 outline-none transition-all ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-stone-300 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-stone-700">Password</label>
              <input 
                type="password" 
                name="password"
                className={`mt-1 w-full p-3 border rounded-xl focus:ring-2 outline-none transition-all ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-stone-300 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                placeholder="Min. 8 karakter"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-sm font-semibold text-stone-700">Konfirmasi Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                className={`mt-1 w-full p-3 border rounded-xl focus:ring-2 outline-none transition-all ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-stone-300 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                placeholder="Ulangi password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`mt-6 w-full p-3.5 rounded-xl font-bold text-white transition-all ${loading ? 'bg-stone-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200'}`}
          >
            {loading ? "Memproses..." : "DAFTAR SEKARANG"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-emerald-600 font-bold hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
