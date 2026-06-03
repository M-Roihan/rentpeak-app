"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

// Fungsi format waktu relatif (misal "5 menit lalu")
function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} hari lalu`;
}

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [notifikasi, setNotifikasi] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifikasi = async () => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/notifikasi", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setNotifikasi(json.data || []);
      }
    } catch (e) {
      console.error("Gagal memuat notifikasi", e);
    }
  };

  useEffect(() => {
    fetchNotifikasi(); // First fetch
    
    // Polling fetch tiap 30 detik untuk update badge realtime
    const interval = setInterval(fetchNotifikasi, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Tutup dropdown jika klik di luar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah bubbling agar UI rapi
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Optimistic Update UI (langsung hapus dari tampilan list)
      setNotifikasi(prev => prev.filter(n => n.id !== id));
      
      // Update ke Backend
      await fetch(`/api/notifikasi/${id}/baca`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Gagal tandai notifikasi dibaca", error);
      fetchNotifikasi(); // Revert state jika gagal
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative z-50 flex items-center" ref={dropdownRef}>
      {/* Icon Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 mr-3 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all focus:outline-none"
        title="Notifikasi"
      >
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge Unread Count */}
        {notifikasi.length > 0 && (
          <span className="absolute top-0.5 right-1 flex items-center justify-center w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {notifikasi.length > 9 ? "9+" : notifikasi.length}
          </span>
        )}
      </button>

      {/* Dropdown Notifikasi */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-50/80 backdrop-blur border-b border-slate-100 px-5 py-4 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-[15px]">Notifikasi</h3>
            <span className="text-xs text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full font-bold shadow-inner">
              {notifikasi.length} Baru
            </span>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto overscroll-contain">
            {notifikasi.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                </div>
                <p className="text-[13px] text-slate-500 font-semibold">Tidak ada notifikasi baru</p>
                <p className="text-[11px] text-slate-400 mt-1">Kamu sudah membaca semua pemberitahuan.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifikasi.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 hover:bg-blue-50/40 transition-colors flex items-start gap-3.5 cursor-pointer group"
                    onClick={(e) => handleMarkAsRead(item.id, e)}
                  >
                    <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 font-medium leading-snug mb-1.5 group-hover:text-blue-700 transition-colors">
                        {item.pesan}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{getRelativeTime(item.waktu)}</p>
                        <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Tandai Dibaca
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
