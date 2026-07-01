import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDosenDashboard } from "@/app/actions/dosen";
import { Users, AlertTriangle, TrendingDown, CheckCircle, BookX } from 'lucide-react';
import Link from "next/link";
import IpkTrendChart from "./IpkTrendChart";
export default async function DosenDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'dosen') {
    redirect("/login");
  }

  const res = await getDosenDashboard(parseInt(session.user.id));
  const data = res.data || { total_mahasiswa: 0, risiko_tinggi: 0, risiko_sedang: 0, risiko_rendah: 0, total_mk_bermasalah: 0 };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Halo, Dosen Pembimbing 👋</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Ringkasan status risiko akademik mahasiswa bimbingan Anda</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Mahasiswa</p>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{data.total_mahasiswa}</p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/30 rounded-2xl p-5 hover:border-red-300 dark:hover:border-red-500/50 transition-colors shadow-sm dark:shadow-lg dark:shadow-red-500/10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-red-600 dark:text-red-400">Risiko Tinggi</p>
            <div className="w-8 h-8 bg-red-200/50 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
              <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{data.risiko_tinggi}</p>
          <p className="text-xs text-red-600/80 dark:text-red-500/80 mt-1">mahasiswa perlu pantauan</p>
        </div>

        <div className="bg-amber-50 dark:bg-yellow-500/5 border border-amber-200 dark:border-yellow-500/30 rounded-2xl p-5 hover:border-amber-300 dark:hover:border-yellow-500/50 transition-colors shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-amber-600 dark:text-yellow-400">Risiko Sedang</p>
            <div className="w-8 h-8 bg-amber-200/50 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle size={16} className="text-amber-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-600 dark:text-yellow-400">{data.risiko_sedang}</p>
          <p className="text-xs text-amber-600/80 dark:text-yellow-500/80 mt-1">mahasiswa</p>
        </div>

        <div className="bg-emerald-50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 rounded-2xl p-5 hover:border-emerald-300 dark:hover:border-slate-700 transition-colors shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Risiko Rendah</p>
            <div className="w-8 h-8 bg-emerald-200/50 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{data.risiko_rendah}</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80 mt-1">mahasiswa aman</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none overflow-hidden flex flex-col">
          <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
            <BookX size={18} className="text-red-600 dark:text-red-400" /> Mahasiswa Kritis (MK Bermasalah &gt; 2)
          </h3>
          <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
            {!data.mahasiswa_kritis || data.mahasiswa_kritis.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-6">
                <CheckCircle size={32} className="text-emerald-400 mb-2 opacity-50" />
                <p className="text-sm">Tidak ada mahasiswa kritis</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.mahasiswa_kritis.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{m.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{m.nim}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center justify-center bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {m.mk_bermasalah} MK
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm dark:shadow-none">
          <Users size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-slate-800 dark:text-slate-300 font-medium mb-2">Lihat Detail Mahasiswa</p>
          <p className="text-slate-500 text-sm mb-4">Pantau nilai dan status risiko tiap mahasiswa bimbingan secara detail.</p>
          <Link href="/dosen/mahasiswa" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl transition-colors text-sm shadow-md shadow-blue-500/20">
            Daftar Mahasiswa
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <IpkTrendChart data={data.ipk_trend || []} />
      </div>
    </div>
  );
}
