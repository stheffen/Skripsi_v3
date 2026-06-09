import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDosenDashboard } from "@/app/actions/dosen";
import { Users, AlertTriangle, TrendingDown, CheckCircle, BookX } from 'lucide-react';
import Link from "next/link";

export default async function DosenDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'dosen') {
    redirect("/login");
  }

  const res = await getDosenDashboard();
  const data = res.data || { total_mahasiswa: 0, risiko_tinggi: 0, risiko_sedang: 0, risiko_rendah: 0, total_mk_bermasalah: 0 };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Halo, Dosen Pembimbing 👋</h1>
        <p className="text-slate-400 text-sm mt-1">Ringkasan status risiko akademik mahasiswa bimbingan Anda</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-400">Total Mahasiswa</p>
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-100">{data.total_mahasiswa}</p>
        </div>
        
        <div className="bg-slate-900 border border-red-500/30 bg-red-500/5 rounded-2xl p-5 hover:border-red-500/50 transition-colors shadow-lg shadow-red-500/10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-red-400">Risiko Tinggi</p>
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <TrendingDown size={16} className="text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-400">{data.risiko_tinggi}</p>
          <p className="text-xs text-red-500/80 mt-1">mahasiswa perlu pantauan</p>
        </div>

        <div className="bg-slate-900 border border-yellow-500/30 bg-yellow-500/5 rounded-2xl p-5 hover:border-yellow-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-yellow-400">Risiko Sedang</p>
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle size={16} className="text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{data.risiko_sedang}</p>
          <p className="text-xs text-yellow-500/80 mt-1">mahasiswa</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-emerald-400">Risiko Rendah</p>
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{data.risiko_rendah}</p>
          <p className="text-xs text-emerald-500/80 mt-1">mahasiswa aman</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <BookX size={18} className="text-blue-400" /> Status Akademik Global
          </h3>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-3">
            <div>
              <p className="text-sm font-medium text-slate-200">Total MK Bermasalah</p>
              <p className="text-xs text-slate-500 mt-1">D/E dari seluruh mahasiswa</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{data.total_mk_bermasalah}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <Users size={48} className="text-slate-700 mb-4" />
          <p className="text-slate-300 font-medium mb-2">Lihat Detail Mahasiswa</p>
          <p className="text-slate-500 text-sm mb-4">Pantau nilai dan status risiko tiap mahasiswa bimbingan secara detail.</p>
          <Link href="/dosen/mahasiswa" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl transition-colors text-sm">
            Daftar Mahasiswa
          </Link>
        </div>
      </div>
    </div>
  );
}
