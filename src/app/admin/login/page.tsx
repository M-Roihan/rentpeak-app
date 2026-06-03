"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
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
        if (data.user.peran === "CUSTOMER") {
          setErrorMsg("Akun ini bukan akun staff. Silakan login di halaman utama.");
          setLoading(false);
          return;
        }

        // Simpan token di storage browser
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.peran);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userName", data.user.nama);
        localStorage.setItem("isProfileComplete", data.user.NIK && data.user.no_telp ? "true" : "false");
        
        setSuccessMsg("Login Berhasil! Selamat datang " + data.user.nama);
        
        setTimeout(() => {
          if (data.user.peran === "ADMIN") {
            router.push("/admin");
          } else if (data.user.peran === "PEGAWAI") {
            router.push("/pegawai");
          }
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
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-2" style={{ fontFamily: '"Sora", sans-serif' }}>RENTPEAK</h2>
        <p className="text-center text-gray-500 mb-8 font-light">Portal Staff</p>
        
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
            <label className="block text-sm font-semibold text-gray-700">Email Staff</label>
            <input 
              type="email" 
              required
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="admin@rentpeak.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input 
              type="password" 
              required
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg font-bold text-white transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'}`}
          >
            {loading ? "Memproses..." : "MASUK SEBAGAI STAFF"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          <Link href="/" className="text-blue-600 font-semibold hover:underline">
            &larr; Kembali ke halaman utama
          </Link>
        </p>
      </div>
    </div>
  );
}
