"use client";

import { useState, useTransition } from "react";
import { ClipboardList, CheckCircle, ChevronDown, ChevronUp, Save, AlertTriangle, BookOpen, Plus, Trash2, X } from "lucide-react";
import { batchRegistrasiMK, deleteRegistrasiMK } from "@/app/actions/registrasi";
import { useRouter } from "next/navigation";

const NILAI_OPTIONS = ["A", "B", "C", "D", "E"];
const NILAI_COLORS: Record<string, string> = {
  A: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  B: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  C: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  D: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  E: "bg-red-500/20 text-red-300 border-red-500/30",
};

function NilaiSelector({ mkId, currentNilai, onChange }: any) {
  return (
    <div className="flex gap-1">
      {NILAI_OPTIONS.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(mkId, n === currentNilai ? null : n)}
          className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all duration-150 ${
            currentNilai === n
              ? `${NILAI_COLORS[n]} scale-110 shadow-lg`
              : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-500 dark:hover:text-slate-300"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export default function RegistrasiMKClient({ user, mkPerSemester }: { user: any; mkPerSemester: Record<number, any[]> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Semua MK diflatten untuk mempermudah Modal
  const allMKs = Object.values(mkPerSemester).flat();
  
  const [extraSemesters, setExtraSemesters] = useState<number[]>(() => {
    const maxSem = Math.max(8, user.semester_aktif || 1, ...Object.keys(mkPerSemester).map(Number));
    if (maxSem > 8) return Array.from({length: maxSem - 8}, (_, i) => 9 + i);
    return [];
  });
  const semesterList = [1, 2, 3, 4, 5, 6, 7, 8, ...extraSemesters];

  const [activeSem, setActiveSem] = useState(user.semester_aktif || 1);
  
  const handleAddSemester = () => {
    const nextSem = semesterList[semesterList.length - 1] + 1;
    setExtraSemesters([...extraSemesters, nextSem]);
    setActiveSem(nextSem);
  };
  
  // MK yang sudah terdaftar di semester aktif
  const currentKRS = (mkPerSemester[activeSem] || []).filter((mk: any) => mk.sudah_registrasi);
  
  // State untuk MK yang ditambahkan dari Modal (Draft)
  const [draftMKs, setDraftMKs] = useState<any[]>([]);
  
  // State nilai (menggabungkan yang sudah ada dan yang baru diubah)
  const [nilaiMap, setNilaiMap] = useState<Record<number, string | null>>(() => {
    const initial: Record<number, string | null> = {};
    allMKs.forEach(mk => {
      if (mk.sudah_registrasi) initial[mk.id] = mk.nilai;
    });
    return initial;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [selectedInModal, setSelectedInModal] = useState<Record<number, boolean>>({});
  
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleNilai = (mkId: number, nilai: string | null) => {
    setNilaiMap((prev) => ({ ...prev, [mkId]: nilai }));
  };

  const handleOpenModal = () => {
    setSelectedInModal({});
    setModalSearch("");
    setIsModalOpen(true);
  };

  const handleAddFromModal = () => {
    const toAdd = allMKs.filter(mk => selectedInModal[mk.id] && !mk.sudah_registrasi && !draftMKs.find(d => d.id === mk.id));
    setDraftMKs([...draftMKs, ...toAdd]);
    setIsModalOpen(false);
  };

  const handleRemoveDraft = (mkId: number) => {
    setDraftMKs(draftMKs.filter(mk => mk.id !== mkId));
    setNilaiMap(prev => { const n = {...prev}; delete n[mkId]; return n; });
  };

  const handleDeleteKRS = (mkId: number) => {
    if (!confirm("Yakin ingin menghapus mata kuliah ini dari KRS?")) return;
    startTransition(async () => {
      const res = await deleteRegistrasiMK(parseInt(user.id), mkId);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  };

  const handleSave = () => {
    // Gabungkan currentKRS yang nilainya berubah + draftMKs
    const entries: { mkId: number; nilai: string | null; semester: number }[] = [];
    
    // Drafts
    draftMKs.forEach(mk => {
      entries.push({ mkId: mk.id, nilai: nilaiMap[mk.id] ?? null, semester: activeSem });
    });

    // Current (Updates)
    currentKRS.forEach(mk => {
      if ((nilaiMap[mk.id] ?? null) !== (mk.nilai ?? null)) {
        entries.push({ mkId: mk.id, nilai: nilaiMap[mk.id] ?? null, semester: activeSem });
      }
    });

    if (entries.length === 0) {
      setError("Tidak ada perubahan nilai atau penambahan MK baru untuk disimpan.");
      return;
    }

    setError("");
    startTransition(async () => {
      const res = await batchRegistrasiMK(parseInt(user.id), entries);
      if (res.error) {
        setError(res.error);
      } else {
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
          setDraftMKs([]);
          router.refresh();
        }, 1500);
      }
    });
  };

  const combinedList = [...currentKRS, ...draftMKs];
  
  // MK yang bisa dipilih di modal = Belum registrasi dan belum ada di draft
  const availableMKs = allMKs.filter(mk => !mk.sudah_registrasi && !draftMKs.find(d => d.id === mk.id));
  const filteredModalMKs = availableMKs.filter(mk => 
    mk.nama.toLowerCase().includes(modalSearch.toLowerCase()) || 
    mk.kode.toLowerCase().includes(modalSearch.toLowerCase())
  );

  // Group modal MKs by their original semester
  const groupedModalMKs: Record<number, any[]> = {};
  filteredModalMKs.forEach(mk => {
    if (!groupedModalMKs[mk.semester]) groupedModalMKs[mk.semester] = [];
    groupedModalMKs[mk.semester].push(mk);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Registrasi KRS</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Kelola mata kuliah dan nilai untuk setiap semester</p>
      </div>

      {/* Semester Tabs */}
      <div className="flex gap-2 flex-wrap bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {semesterList.map((s) => {
          const mks = mkPerSemester[s] || [];
          const regCount = mks.filter((m: any) => m.sudah_registrasi).length;
          return (
            <button
              key={s}
              onClick={() => { setActiveSem(s); setDraftMKs([]); setError(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-1 min-w-[70px] relative ${
                activeSem === s
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Sem {s}
              {regCount > 0 && (
                <span className="ml-1 w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
              )}
            </button>
          );
        })}
        <button
          onClick={handleAddSemester}
          className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex-1 min-w-[70px] bg-slate-100 dark:bg-slate-800/50 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center justify-center gap-1"
          title="Tambah Semester Baru"
        >
          <Plus size={16} /> Sem
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-3">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {saved && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle size={18} /> Perubahan berhasil disimpan!
        </div>
      )}

      {/* Main KRS Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <ClipboardList size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-200">KRS Semester {activeSem}</h3>
            <span className="text-xs font-medium text-slate-600 bg-slate-200 dark:text-slate-400 dark:bg-slate-800 px-2 py-1 rounded-lg">
              {combinedList.length} MK
            </span>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} /> Tambah MK
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {combinedList.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <BookOpen size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
              <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">Belum ada mata kuliah</p>
              <p className="text-slate-500 text-sm">Klik tombol "Tambah MK" untuk memasukkan mata kuliah ke KRS semester ini.</p>
            </div>
          ) : (
            combinedList.map((mk: any) => {
              const isDraft = draftMKs.some(d => d.id === mk.id);
              return (
                <div key={mk.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-4 transition ${isDraft ? "bg-blue-50 border-l-2 border-blue-500 dark:bg-blue-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{mk.nama}</p>
                      {isDraft && <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Baru</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500">{mk.kode}</span>
                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                      <span className="text-xs text-slate-500">{mk.sks} SKS</span>
                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                      <span className="text-xs text-slate-500">Bawaan Sem {mk.semester}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto mt-2 sm:mt-0">
                    <NilaiSelector mkId={mk.id} currentNilai={nilaiMap[mk.id] ?? null} onChange={handleNilai} />
                    
                    <button
                      onClick={() => isDraft ? handleRemoveDraft(mk.id) : handleDeleteKRS(mk.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                      title={isDraft ? "Batal Tambah" : "Hapus dari KRS"}
                    >
                      {isDraft ? <X size={18} /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Save Button */}
      {combinedList.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition disabled:opacity-40 shadow-lg shadow-emerald-500/20"
          >
            {isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            Simpan Perubahan KRS
          </button>
        </div>
      )}

      {/* Modal Window Box */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tambah Mata Kuliah</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <input
                type="text"
                placeholder="Cari nama atau kode mata kuliah..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {Object.keys(groupedModalMKs).length === 0 ? (
                <div className="text-center py-12 text-slate-500">Tidak ada mata kuliah yang tersedia.</div>
              ) : (
                Object.keys(groupedModalMKs).map(Number).sort((a, b) => a - b).map(sem => (
                  <div key={sem} className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Semester {sem}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {groupedModalMKs[sem].map((mk: any) => {
                        const isSelected = !!selectedInModal[mk.id];
                        return (
                          <label key={mk.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${isSelected ? 'bg-blue-50 border-blue-300 dark:bg-blue-500/10 dark:border-blue-500/30' : 'bg-white dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => setSelectedInModal(prev => ({...prev, [mk.id]: e.target.checked}))}
                              className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 accent-blue-600 dark:accent-blue-500"
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{mk.nama}</p>
                              <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                <span>{mk.kode}</span>
                                <span>&bull;</span>
                                <span>{mk.sks} SKS</span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                onClick={handleAddFromModal}
                disabled={Object.values(selectedInModal).filter(Boolean).length === 0}
                className="px-6 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
              >
                Tambahkan ({Object.values(selectedInModal).filter(Boolean).length}) MK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
