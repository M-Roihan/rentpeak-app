"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Buat pindah halaman

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Simpan token di storage browser agar bisa dipakai di halaman lain
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.peran);
        
        alert("Login Berhasil! Selamat datang " + data.user.nama);
        
        // Pindah ke dashboard kalau dia ADMIN
        if (data.user.peran === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/"); // Ke landing page kalau customer
        }
      } else {
        alert(data.pesan);
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-2">RENTPEAK</h2>
        <p className="text-center text-gray-500 mb-8 font-light">Admin & Partner Portal</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Email</label>
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
            disabled={loading}
            className={`w-full p-3 rounded-lg font-bold text-white transition-all ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'}`}
          >
            {loading ? "Logging in..." : "MASUK"}
          </button>
        </form>
      </div>
    </div>
  );
}