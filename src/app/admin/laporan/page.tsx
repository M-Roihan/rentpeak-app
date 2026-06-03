"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button, Toast, Skeleton } from "@/components/ui";
import { formatRupiah } from "@/lib/utils";

const BULAN_LIST = [
  { id: "1", nama: "Januari" },
  { id: "2", nama: "Februari" },
  { id: "3", nama: "Maret" },
  { id: "4", nama: "April" },
  { id: "5", nama: "Mei" },
  { id: "6", nama: "Juni" },
  { id: "7", nama: "Juli" },
  { id: "8", nama: "Agustus" },
  { id: "9", nama: "September" },
  { id: "10", nama: "Oktober" },
  { id: "11", nama: "November" },
  { id: "12", nama: "Desember" }
];

export default function LaporanPage() {
  const currentDate = new Date();
  const [selectedBulan, setSelectedBulan] = useState(String(currentDate.getMonth() + 1));
  const [selectedTahun, setSelectedTahun] = useState(String(currentDate.getFullYear()));
  
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({
    totalTransaksi: 0,
    bookingSelesai: 0,
    bookingDibatalkan: 0,
    totalPendapatan: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: "success"|"error"} | null>(null);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch(`/api/admin/booking-list?bulan=${selectedBulan}&tahun=${selectedTahun}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const json = await res.json();
        setBookings(json.data);
        if (json.summary) {
           setSummary(json.summary);
        }
      } else {
        setToast({ msg: "Gagal mengambil data laporan", type: "error" });
      }
    } catch (error) {
      setToast({ msg: "Error koneksi jaringan", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const handleExportCSV = () => {
    if (bookings.length === 0) {
      setToast({ msg: "Tidak ada data untuk diekspor", type: "error" });
      return;
    }

    const headers = ["Kode Booking", "Customer", "Barang", "Status", "Metode Bayar", "Tanggal Pinjam", "Tanggal Kembali", "Total Biaya"];
    const rows = bookings.map((b: any) => {
      const barangNames = b.details.map((d: any) => `${d.barang?.nama || 'Barang'} (x${d.jumlah})`).join(" | ");
      return [
        b.bukti_booking || "-",
        b.customer?.nama || "Unknown",
        `"${barangNames}"`,
        b.status,
        b.pembayaran?.metode_pembayaran || "-",
        new Date(b.tanggal_pinjam).toISOString().split('T')[0],
        new Date(b.tanggal_kembali).toISOString().split('T')[0],
        b.total_biaya
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    const bulanNama = BULAN_LIST.find(b => b.id === selectedBulan)?.nama || selectedBulan;
    link.setAttribute("download", `laporan-${bulanNama}-${selectedTahun}.csv`);
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setToast({ msg: "Berhasil mengunduh laporan CSV!", type: "success" });
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="flex min-h-screen bg-slate-50 font-sans">
        
        {toast && <Toast type={toast.type} message={toast.msg} onDismiss={() => setToast(null)} />}

        {/* SIDEBAR */}
        <div className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col shadow-2xl z-20">
          <h1 className="text-2xl font-black mb-10 text-blue-400 tracking-tighter" style={{ fontFamily: '"Sora", sans-serif' }}>
            RENT<span className="text-white">PEAK.</span>
          </h1>
          <nav className="space-y-2 text-sm font-medium flex-1">
            <Link href="/admin" className="flex items-center p-3 hover:bg-slate-800 rounded-xl cursor-pointer transition text-slate-300 hover:text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              Dashboard Inventaris
            </Link>
            <Link href="/admin/kelola-staff" className="flex items-center p-3 hover:bg-slate-800 rounded-xl cursor-pointer transition text-slate-300 hover:text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              Kelola Pengguna
            </Link>
            <div className="p-3 bg-blue-600 rounded-xl cursor-pointer shadow-lg shadow-blue-900/50 flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Laporan & Keuangan
            </div>
          </nav>
          <div className="pt-4 border-t border-slate-800">
             <Link href="/" className="block p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition text-sm flex items-center">
               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
               Kembali ke Katalog
             </Link>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-6 md:p-10 h-screen overflow-y-auto">
          <header className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800" style={{ fontFamily: '"Sora", sans-serif' }}>Laporan & Keuangan</h2>
              <p className="text-slate-500 text-sm mt-1">Laporan transaksi bulanan dan ekspor data.</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-bold text-slate-600 flex items-center">
               <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span> Mode Admin
            </div>
          </header>

          {/* FILTER */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-slate-600 mb-2">Pilih Bulan</label>
              <select 
                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={selectedBulan} onChange={(e) => setSelectedBulan(e.target.value)}
              >
                {BULAN_LIST.map(b => (
                  <option key={b.id} value={b.id}>{b.nama}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-slate-600 mb-2">Tahun</label>
              <input 
                type="number" 
                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={selectedTahun} onChange={(e) => setSelectedTahun(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-auto">
              <Button onClick={fetchLaporan} className="w-full h-[50px] shadow-lg shadow-blue-200">
                Tampilkan Laporan
              </Button>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm border-l-4 border-l-blue-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Transaksi</p>
                <p className="text-3xl font-black text-blue-600 font-sora">{summary.totalTransaksi}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm border-l-4 border-l-green-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Pendapatan</p>
                <p className="text-2xl font-black text-green-600 font-sora">{formatRupiah(summary.totalPendapatan)}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm border-l-4 border-l-indigo-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Booking Selesai</p>
                <p className="text-3xl font-black text-indigo-500 font-sora">{summary.bookingSelesai}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm border-l-4 border-l-red-500">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Booking Dibatalkan</p>
                <p className="text-3xl font-black text-red-500 font-sora">{summary.bookingDibatalkan}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: '"Sora", sans-serif' }}>Detail Transaksi</h3>
            <Button onClick={handleExportCSV} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </Button>
          </div>

          {/* TABEL */}
          {loading ? (
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Kode Booking</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Barang</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Tanggal (P-K)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-12 text-slate-400 font-medium">Tidak ada transaksi pada periode ini.</td></tr>
                    )}
                    {bookings.map((booking: any) => (
                      <tr key={booking.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm font-bold text-slate-600">{booking.bukti_booking || "-"}</td>
                        <td className="px-6 py-4 text-slate-700 font-medium">{booking.customer?.nama}</td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          <div className="max-w-[200px] truncate" title={booking.details.map((d: any) => `${d.barang?.nama} (x${d.jumlah})`).join(", ")}>
                            {booking.details.map((d: any) => `${d.barang?.nama} (x${d.jumlah})`).join(", ")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                             booking.status === 'SELESAI' ? 'bg-green-100 text-green-700 border-green-200' :
                             booking.status === 'DIBATALKAN' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                             booking.status === 'AKTIF' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                             'bg-amber-100 text-amber-700 border-amber-200'
                           }`}>
                             {booking.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-blue-600 font-mono text-sm">{formatRupiah(booking.total_biaya)}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                          {new Date(booking.tanggal_pinjam).toLocaleDateString("id-ID", {month: "short", day: "numeric"})} - {new Date(booking.tanggal_kembali).toLocaleDateString("id-ID", {month: "short", day: "numeric"})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </ProtectedRoute>
  );
}
