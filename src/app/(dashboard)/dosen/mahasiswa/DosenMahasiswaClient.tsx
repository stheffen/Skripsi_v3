"use client";

import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, TrendingDown, BookX, BookOpen, GraduationCap, ChevronRight, UserPlus, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAvailableMahasiswa, addMahasiswaBimbingan, removeMahasiswaBimbingan } from '@/app/actions/dosen';

function RiskBadge({ kategori }: { kategori: string }) {
  const map: Record<string, any> = {
    'Rendah': { cls: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30', icon: CheckCircle },
    'Sedang': { cls: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30', icon: AlertTriangle },
    'Tinggi': { cls: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30', icon: TrendingDown },
    'Belum Dianalisis': { cls: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700', icon: BookOpen },
  };
  const { cls, icon: Icon } = map[kategori] || map['Rendah'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${cls}`}>
      <Icon size={12} />
      {kategori}
    </span>
  );
}

export default function DosenMahasiswaClient({ dosenId, mahasiswaList }: { dosenId: number, mahasiswaList: any[] }) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // States for delete confirmation
  const [studentToDelete, setStudentToDelete] = useState<{id: number, name: string} | null>(null);

  const router = useRouter();

  const filtered = mahasiswaList.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.nim?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = async () => {
    setIsModalOpen(true);
    setIsLoading(true);
    const res = await getAvailableMahasiswa(dosenId);
    if (res.success) {
      setAvailableStudents(res.data || []);
    }
    setIsLoading(false);
  };

  const handleToggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(val => val !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const submitAddStudents = async () => {
    if (selectedIds.length === 0) return;
    setIsLoading(true);
    await addMahasiswaBimbingan(dosenId, selectedIds);
    setIsModalOpen(false);
    setSelectedIds([]);
    setIsLoading(false);
    router.refresh(); // Refresh the page to load new students
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setIsLoading(true);
    await removeMahasiswaBimbingan(dosenId, studentToDelete.id);
    setStudentToDelete(null);
    setIsLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Daftar Mahasiswa Bimbingan</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Pantau perkembangan akademik mahasiswa</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <UserPlus size={16} /> Tambah Mahasiswa
        </button>
      </div>

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

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm dark:shadow-none">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Mahasiswa tidak ditemukan atau Anda belum menambahkan mahasiswa bimbingan.</p>
          </div>
        ) : (
          filtered.map((m, idx) => (
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
                      <span className="text-xs text-slate-600 dark:text-slate-500 flex items-center gap-1"><GraduationCap size={12}/> Sem {m.semester_aktif}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-6 mr-4">
                  <RiskBadge kategori={m.risiko} />
                  
                  <div className="hidden md:flex items-center gap-6 text-center">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{m.ips?.toFixed(2) || "-"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">IPS</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{m.ipk?.toFixed(2) || "-"}</p>
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
              <button 
                onClick={(e) => { e.preventDefault(); setStudentToDelete({id: m.id, name: m.name}); }}
                className="bg-red-50 dark:bg-transparent sm:border-l border-t sm:border-t-0 border-red-100 dark:border-slate-800 px-5 py-4 sm:py-0 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center justify-center"
                title="Hapus dari Bimbingan"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL TAMBAH MAHASISWA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tambah Mahasiswa Bimbingan</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : availableStudents.length === 0 ? (
                <div className="text-center p-8 text-slate-500">
                  Semua mahasiswa sudah Anda pantau.
                </div>
              ) : (
                <div className="space-y-2">
                  {availableStudents.map(student => (
                    <label key={student.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(student.id)}
                        onChange={() => handleToggleSelect(student.id)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-200 text-sm">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.nim} - Semester {student.semester_aktif}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition">
                Batal
              </button>
              <button 
                onClick={submitAddStudents}
                disabled={selectedIds.length === 0 || isLoading}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Simpan Terpilih ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Hapus dari Pantauan?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Anda yakin ingin menghapus <strong>{studentToDelete.name}</strong> dari daftar bimbingan Anda? Analisis risikonya tidak akan tampil lagi di dasbor Anda.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setStudentToDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition"
              >
                {isLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
