"use client";

import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, TrendingDown, BookOpen, GraduationCap, ChevronRight, Trash2, X, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removeMahasiswaBimbingan } from '@/app/actions/dosen';

function RiskBadge({ kategori }: { kategori: string }) {
  const map: Record<string, any> = {
    'Rendah': { cls: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30', icon: CheckCircle },
    'Sedang': { cls: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30', icon: AlertTriangle },
    'Tinggi': { cls: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30', icon: TrendingDown },
    'Belum Dianalisis': { cls: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700', icon: BookOpen },
  };
  const { cls, icon: Icon } = map[kategori] || map['Belum Dianalisis'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${cls}`}>
      <Icon size={12} />
      {kategori}
    </span>
  );
}

export default function DosenMahasiswaClient({ dosenId, mahasiswaList }: { dosenId: number, mahasiswaList: any[] }) {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: number; name: string; nim: string } | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const router = useRouter();

  const filtered = mahasiswaList.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.nim?.toLowerCase().includes(search.toLowerCase())
  );

  const openDeleteConfirm = (student: { id: number; name: string; nim: string }) => {
    setStudentToDelete(student);
    setConfirmText('');
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    if (confirmText !== studentToDelete.nim) return;
    setIsLoading(true);
    await removeMahasiswaBimbingan(dosenId, studentToDelete.id);
    setStudentToDelete(null);
    setConfirmText('');
    setIsLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Daftar Mahasiswa Bimbingan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Mahasiswa yang memilih Anda sebagai Dosen PA akan muncul di sini secara otomatis.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm dark:shadow-none">
        <Search size={18} className="text-slate-400 dark:text-slate-500 ml-2" />
        <input
          type="text"
          placeholder="Cari nama atau NIM mahasiswa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-slate-900 dark:text-slate-200 w-full text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-0"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm dark:shadow-none">
            <GraduationCap size={40} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {mahasiswaList.length === 0
                ? 'Belum ada mahasiswa yang memilih Anda sebagai Dosen PA.'
                : 'Mahasiswa tidak ditemukan.'}
            </p>
          </div>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm dark:shadow-none flex flex-col sm:flex-row ${
              m.risiko === 'Tinggi' ? 'border-red-200 dark:border-red-500/30' :
              m.risiko === 'Sedang' ? 'border-amber-200 dark:border-amber-500/30' :
              m.risiko === 'Rendah' ? 'border-emerald-200 dark:border-emerald-500/30' : 'border-slate-200 dark:border-slate-800'
            }`}>
              <Link
                href={`/dosen/mahasiswa/${m.id}`}
                className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition text-left"
              >
                <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-200 truncate">{m.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-600 dark:text-slate-500 font-mono">{m.nim || '-'}</span>
                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                      <span className="text-xs text-slate-600 dark:text-slate-500 flex items-center gap-1"><GraduationCap size={12} /> Sem {m.semester_aktif}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-6 mr-4">
                  <RiskBadge kategori={m.risiko} />
                  <div className="hidden md:flex items-center gap-6 text-center">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{m.ips?.toFixed(2) || '-'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">IPS</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{m.ipk?.toFixed(2) || '-'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">IPK</p>
                    </div>
                    <div className="w-12">
                      <p className={`text-sm font-bold ${m.mk_bermasalah > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-200'}`}>{m.mk_bermasalah || 0}</p>
                      <p className="text-xs text-slate-500 mt-0.5">MK D/E</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-400 flex-shrink-0" />
                </div>
              </Link>

              {/* Tombol Lepas Mahasiswa */}
              <div className="border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 flex items-center justify-center p-3 sm:px-4">
                <button
                  onClick={() => openDeleteConfirm({ id: m.id, name: m.name, nim: m.nim || '' })}
                  title="Lepas mahasiswa dari bimbingan"
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL KONFIRMASI LEPAS MAHASISWA - dengan proteksi ketik NIM */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={22} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Lepas Mahasiswa dari Bimbingan?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Tindakan ini akan memutus hubungan bimbingan dengan:
                </p>
              </div>
            </div>

            {/* Info mahasiswa */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-5">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{studentToDelete.name}</p>
              <p className="text-sm text-slate-500 font-mono mt-0.5">NIM: {studentToDelete.nim || '-'}</p>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 mb-5 text-xs text-amber-700 dark:text-amber-400 flex gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>
                Setelah dilepas, mahasiswa <strong>tidak dapat mengakses</strong> fitur aplikasi
                hingga memilih Dosen PA baru.
              </span>
            </div>

            {/* Konfirmasi ketik NIM */}
            <div className="mb-5 space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Ketik NIM mahasiswa untuk konfirmasi
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={studentToDelete.nim || 'NIM mahasiswa'}
                className="w-full h-11 px-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
              {confirmText && confirmText !== studentToDelete.nim && (
                <p className="text-xs text-red-500">NIM tidak cocok</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStudentToDelete(null); setConfirmText(''); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading || confirmText !== studentToDelete.nim}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-red-500/20"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : 'Ya, Lepas Mahasiswa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
