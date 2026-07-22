"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, AlertTriangle, Users, FileText, Calendar } from "lucide-react";
import { prosesPermohonanGantiDosen } from "@/app/actions/dosen";

export default function PermohonanClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [permohonanList, setPermohonanList] = useState(initialData);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [catatan, setCatatan] = useState("");
  const [actionType, setActionType] = useState<'disetujui' | 'ditolak' | null>(null);

  const handleProses = (id: number, type: 'disetujui' | 'ditolak') => {
    setSelectedId(id);
    setActionType(type);
    setCatatan("");
  };

  const submitProses = async () => {
    if (!selectedId || !actionType) return;
    
    if (actionType === 'ditolak' && !catatan.trim()) {
      setError("Catatan wajib diisi jika menolak permohonan.");
      return;
    }
    
    setError("");
    setSuccess("");

    startTransition(async () => {
      const res = await prosesPermohonanGantiDosen(selectedId, actionType, catatan);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(`Permohonan berhasil ${actionType}.`);
        setPermohonanList(prev => prev.filter(p => p.id !== selectedId));
        setSelectedId(null);
        setActionType(null);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Permohonan Ganti Dosen</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Daftar mahasiswa yang mengajukan pergantian Dosen PA ke Anda.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
          <Check size={18} /> {success}
        </div>
      )}

      {permohonanList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Tidak Ada Permohonan</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Saat ini belum ada mahasiswa yang mengajukan permohonan baru.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {permohonanList.map((p) => (
            <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-lg">
                      {p.mahasiswa.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{p.mahasiswa.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <FileText size={12} /> NIM: {p.mahasiswa.nim} &bull; <Calendar size={12} /> Angkatan: {p.mahasiswa.angkatan}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-sm">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dosen Lama:</span>
                      <p className="text-slate-700 dark:text-slate-300">{p.dosen_lama.name}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alasan:</span>
                      <p className="text-slate-700 dark:text-slate-300 italic">"{p.alasan}"</p>
                    </div>
                  </div>
                </div>

                {selectedId === p.id ? (
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl w-full sm:w-80">
                    <h4 className="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100">
                      {actionType === 'disetujui' ? 'Setujui Permohonan' : 'Tolak Permohonan'}
                    </h4>
                    <textarea
                      placeholder="Tambahkan catatan (opsional jika setuju)..."
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="w-full text-sm p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setSelectedId(null)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                      >
                        Batal
                      </button>
                      <button
                        onClick={submitProses}
                        disabled={isPending}
                        className={`px-3 py-1.5 text-xs font-medium text-white rounded-lg transition flex items-center gap-1.5 disabled:opacity-50 ${actionType === 'disetujui' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                      >
                        {isPending && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Konfirmasi {actionType === 'disetujui' ? 'Setuju' : 'Tolak'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 sm:flex-col sm:w-32 shrink-0">
                    <button
                      onClick={() => handleProses(p.id, 'disetujui')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-xl text-sm font-medium transition"
                    >
                      <Check size={16} /> Setujui
                    </button>
                    <button
                      onClick={() => handleProses(p.id, 'ditolak')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-xl text-sm font-medium transition"
                    >
                      <X size={16} /> Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
