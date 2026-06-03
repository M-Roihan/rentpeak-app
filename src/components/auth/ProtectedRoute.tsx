"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth"; // Menggunakan path relatif agar aman

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Jangan lakukan redirect jika masih dalam status loading dari custom hook
    if (isLoading) return;

    // Jika tidak punya token sama sekali atau token expired
    if (!isAuthenticated) {
      router.push("/login?error=unauthorized");
      return;
    }

    // Jika sudah login, cek apakah role miliknya ada di daftar allowedRoles
    if (user && !allowedRoles.includes(user.peran)) {
      // Redirect ke halaman awal dengan membawa query param error
      router.push("/?error=forbidden");
      return;
    }

    // Lolos pengecekan
    setIsAuthorized(true);
  }, [isLoading, isAuthenticated, user, router, allowedRoles]);

  // Render skeleton saat masih memeriksa hak akses
  if (isLoading || !isAuthorized) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 p-6 md:p-10">
        <div className="w-full max-w-5xl mx-auto space-y-6">
          <div className="h-10 bg-slate-200 rounded-lg w-1/4 animate-pulse"></div>
          <div className="h-64 bg-slate-200 rounded-2xl w-full animate-pulse shadow-sm"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-40 bg-slate-200 rounded-2xl animate-pulse shadow-sm"></div>
            <div className="h-40 bg-slate-200 rounded-2xl animate-pulse shadow-sm"></div>
            <div className="h-40 bg-slate-200 rounded-2xl animate-pulse shadow-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  // Jika sukses tervalidasi, render halamannya
  return <>{children}</>;
}
