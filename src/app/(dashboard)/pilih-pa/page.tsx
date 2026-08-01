"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { GraduationCap, AlertTriangle, UserCheck, ChevronDown } from "lucide-react";
import { getDosenList } from "@/app/actions/auth";
import { pilihDosenPA } from "@/app/actions/dosen";

export default function PilihPAPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [dosenList, setDosenList] = useState<{ id: number; name: string }[]>([]);
  const [selectedDosen, setSelectedDosen] = useState("");
  const [alasan, setAlasan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect dosen ke dashboard mereka
    if (session?.user?.role === "dosen") {
      router.replace("/dosen/dashboard");
      return;
    }
    // Jika mahasiswa sudah punya PA, redirect ke dashboard
    if (session?.user?.role === "mahasiswa" && session.user.has_pa) {
      router.replace("/dashboard");
      return;
    }
    // Muat daftar dosen
    getDosenList().then((res) => {
      if (res.data) setDosenList(res.data);
    });
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedDosen) {
      setError("Silakan pilih Dosen PA terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    const userId = parseInt(session?.user?.id || "0");
    const result = await pilihDosenPA(userId, parseInt(selectedDosen));
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Update session agar has_pa menjadi true
    await update({ has_pa: true });
    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Icon + Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <AlertTriangle size={32} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Pilih Dosen PA
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Anda belum memiliki Dosen Pembimbing Akademik (PA). <br />
            Pilih Dosen PA Anda untuk dapat mengakses seluruh fitur aplikasi.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/50">
          
          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Dosen Pembimbing Akademik <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedDosen}
                  onChange={(e) => setSelectedDosen(e.target.value)}
                  className="w-full h-12 px-4 pr-10 appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                >
                  <option value="">-- Pilih Dosen PA --</option>
                  {dosenList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !selectedDosen}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserCheck size={18} />
                  Konfirmasi Pilihan PA
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
          Anda dapat mengajukan permohonan ganti PA melalui halaman Profil setelah memilih.
        </p>
      </div>
    </div>
  );
}
