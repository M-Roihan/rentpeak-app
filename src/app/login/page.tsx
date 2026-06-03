"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Buat pindah halaman
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | React.ReactNode>("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user.peran === "ADMIN" || data.user.peran === "PEGAWAI") {
          setErrorMsg(
            <span>
              Akun staff harus login melalui halaman staff.{" "}
              <Link href="/admin/login" className="underline font-bold hover:text-red-800">
                Klik di sini.
              </Link>
            </span>
          );
          setLoading(false);
          return;
        }

        // Simpan token di storage browser agar bisa dipakai di halaman lain
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.peran);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userName", data.user.nama);
        localStorage.setItem("isProfileComplete", data.user.NIK && data.user.no_telp ? "true" : "false");
        
        setSuccessMsg("Login Berhasil! Selamat datang " + data.user.nama);
        
        setTimeout(() => {
          router.push("/"); // Ke landing page kalau customer
        }, 1500);
      } else {
        setErrorMsg(data.pesan || "Login gagal, silakan periksa kembali.");
        setLoading(false);
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan koneksi jaringan");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F8F6] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-stone-200">
        <h2 className="text-3xl font-black text-center text-stone-900 tracking-tighter mb-2" style={{ fontFamily: '"Sora", sans-serif' }}>RENT<span className="text-emerald-600">PEAK.</span></h2>
        <p className="text-center text-stone-500 mb-8 font-light">Portal Masuk</p>
        
        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 text-green-700 border border-green-200 text-sm font-medium text-center">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-stone-700">Email</label>
            <input 
              type="email" 
              required
              className="mt-1 w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="admin@rentpeak.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700">Password</label>
            <input 
              type="password" 
              required
              className="mt-1 w-full p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className={`w-full p-3.5 rounded-xl font-bold text-white transition-all ${loading ? 'bg-stone-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200'}`}
          >
            {loading ? "Logging in..." : "MASUK"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-600">
          Belum punya akun?{" "}
          <Link href="/register" className="text-emerald-600 font-bold hover:underline">
            Daftar
          </Link>
        </p>

        <p className="mt-2 text-center text-sm text-stone-600">
          Login sebagai staff?{" "}
          <Link href="/admin/login" className="text-emerald-600 font-bold hover:underline">
            Klik di sini &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}