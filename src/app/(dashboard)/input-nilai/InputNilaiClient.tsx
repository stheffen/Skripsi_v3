"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Save, CheckCircle, AlertTriangle, Info,
  ArrowRightLeft, X
} from 'lucide-react';
import { getSemesterKHS, batchUpdateKHS, pindahSemesterKHS } from '@/app/actions/khs';

const NILAI_OPTIONS = ['A', 'B', 'C', 'D', 'E'];
const NILAI_COLORS: Record<string, string> = {
  A: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  B: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  C: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  D: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  E: 'bg-red-500/20 text-red-300 border-red-500/30',
};

function NilaiSelector({ khsId, currentNilai, onChange }: any) {
  return (
    <div className="flex gap-1">
      {NILAI_OPTIONS.map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(khsId, n)}
          className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all duration-150 ${
            currentNilai === n
              ? `${NILAI_COLORS[n]} scale-110 shadow-lg`
              : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function ModalPindah({ item, activeSem, onConfirm, onClose }: any) {
  const isGanjil = (item?.semester_asli ?? activeSem) % 2 !== 0;
  const semOptions = Array.from({ length: 14 }, (_, i) => i + 1).filter(s => {
    const sameTipe = isGanjil ? s % 2 !== 0 : s % 2 === 0;
    return sameTipe && s !== activeSem;
  });
  const [targetSem, setTargetSem] = useState<number | null>(null);
  const semAsli = item?.semester_asli ?? item?.semester_efektif ?? activeSem;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-100 flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-blue-400" />
            Pindahkan Mata Kuliah
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition">
            <X size={18} />
          </button>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-3 mb-4 border border-slate-700">
          <p className="text-sm font-medium text-slate-200">{item?.nama}</p>
          <p className="text-xs text-slate-500 mt-0.5">{item?.kode} · {item?.sks} SKS · Semester Asli: {semAsli}</p>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Pilih semester tujuan ({isGanjil ? 'ganjil' : 'genap'} ke {isGanjil ? 'ganjil' : 'genap'}):
        </p>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {semOptions.map(s => (
            <button
              key={s}
              onClick={() => setTargetSem(s)}
              className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                targetSem === s
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-blue-500/40 hover:text-slate-200'
              }`}
            >
              Sem {s}
            </button>
          ))}
          {item?.semester_override && item.semester_override !== semAsli && (
            <button
              onClick={() => setTargetSem(semAsli)}
              className={`col-span-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                targetSem === semAsli
                  ? 'bg-amber-600/30 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-amber-500/40'
              }`}
            >
              🔄 Kembalikan ke Semester Asli ({semAsli})
            </button>
          )}
        </div>

        <div className="flex items-start gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-4">
          <Info size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-300">
            MK ini akan dihitung dalam IPS Semester {targetSem || '?'}. Analisis fuzzy akan menggunakan semester baru ini sebagai acuan.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition-colors border border-slate-700">Batal</button>
          <button
            onClick={() => targetSem && onConfirm(item.khs_id, targetSem)}
            disabled={!targetSem}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Pindahkan ke Sem {targetSem || '?'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InputNilaiClient({ user }: { user: any }) {
  const [activeSem, setActiveSem] = useState(user?.semester_aktif || 1);
  const [semData, setSemData] = useState<any>(null);
  const [changes, setChanges] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [pilihanSelected, setPilihanSelected] = useState<Record<string, number>>({});
  const [pindahModal, setPindahModal] = useState<any>(null);
  const [pindahLoading, setPindahLoading] = useState(false);

  const fetchSemester = useCallback(async (sem: number) => {
    setLoading(true);
    setChanges({});
    setSaved(false);
    setError('');
    try {
      const data = await getSemesterKHS(parseInt(user.id), sem);
      setSemData(data);
      const groups = data.pilihan || {};
      const initPilihan: any = {};
      Object.entries(groups).forEach(([kelompok, mks]: any) => {
        const filled = mks.find((m: any) => m.nilai);
        if (filled) initPilihan[kelompok] = filled.khs_id;
      });
      setPilihanSelected(initPilihan);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data mata kuliah.');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchSemester(activeSem); }, [activeSem, fetchSemester]);

  const handleNilaiChange = (khsId: number, nilai: string) => {
    setChanges(prev => ({ ...prev, [khsId]: nilai }));
    setSaved(false);
  };

  const handlePilihanSelect = (kelompok: string, khsId: number) => {
    setPilihanSelected(prev => ({ ...prev, [kelompok]: khsId }));
    const mks = semData?.pilihan?.[kelompok] || [];
    mks.forEach((m: any) => {
      if (m.khs_id !== khsId) {
        setChanges(prev => { const n = { ...prev }; delete n[m.khs_id]; return n; });
      }
    });
  };

  const getCurrentNilai = (item: any) =>
    changes[item.khs_id] !== undefined ? changes[item.khs_id] : item.nilai;

  const handleSave = async () => {
    const toSave: any[] = [];
    semData?.wajib?.forEach((item: any) => {
      const nilai = getCurrentNilai(item);
      if (nilai && item.khs_id) toSave.push({ khs_id: item.khs_id, nilai });
    });
    semData?.pindahan?.forEach((item: any) => {
      const nilai = getCurrentNilai(item);
      if (nilai && item.khs_id) toSave.push({ khs_id: item.khs_id, nilai });
    });
    Object.entries(semData?.pilihan || {}).forEach(([kelompok, mks]: any) => {
      const selected = pilihanSelected[kelompok];
      if (selected) {
        const mk = mks.find((m: any) => m.khs_id === selected);
        if (mk) {
          const nilai = getCurrentNilai(mk);
          if (nilai) toSave.push({ khs_id: mk.khs_id, nilai });
        }
      }
    });

    if (toSave.length === 0) { setError('Tidak ada nilai yang diubah atau diisi.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await batchUpdateKHS(parseInt(user.id), toSave);
      if (res.error) throw new Error(res.error);
      setSaved(true);
      setChanges({});
      fetchSemester(activeSem);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan nilai.');
    } finally {
      setSaving(false);
    }
  };

  const handlePindah = async (khsId: number, semesterTujuan: number) => {
    setPindahLoading(true);
    try {
      const res = await pindahSemesterKHS(parseInt(user.id), khsId, semesterTujuan);
      if (res.error) throw new Error(res.error);
      setPindahModal(null);
      fetchSemester(activeSem);
    } catch (err: any) {
      setError(err.message || 'Gagal memindahkan mata kuliah.');
      setPindahModal(null);
    } finally {
      setPindahLoading(false);
    }
  };

  const countFilled = () => {
    if (!semData) return 0;
    let count = 0;
    semData.wajib?.forEach((item: any) => { if (getCurrentNilai(item)) count++; });
    semData.pindahan?.forEach((item: any) => { if (getCurrentNilai(item)) count++; });
    Object.entries(semData.pilihan || {}).forEach(([kelompok, mks]: any) => {
      const selected = pilihanSelected[kelompok];
      if (selected) {
        const mk = mks.find((m: any) => m.khs_id === selected);
        if (mk && getCurrentNilai(mk)) count++;
      }
    });
    return count;
  };

  const totalMK = () => {
    if (!semData) return 0;
    return (semData.wajib?.length || 0) +
           Object.keys(semData.pilihan || {}).length +
           (semData.pindahan?.length || 0);
  };

  const MKRow = ({ item, showPindah = true }: any) => (
    <div key={item.mk_id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-4 hover:bg-slate-800/30 transition group border-b border-slate-800/50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-slate-200">{item.nama}</p>
          {item.is_pindahan && (
            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
              ↳ Pindahan Sem {item.semester_asli}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-500">{item.kode}</span>
          <span className="text-slate-700">•</span>
          <span className="text-xs text-slate-500">{item.sks} SKS</span>
          <span className="text-xs px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded">{item.jenis}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto mt-2 sm:mt-0">
        <NilaiSelector
          khsId={item.khs_id}
          currentNilai={getCurrentNilai(item)}
          onChange={handleNilaiChange}
        />
        {showPindah && item.khs_id && (
          <button
            onClick={() => setPindahModal(item)}
            title="Pindahkan ke semester lain"
            className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-slate-500 hover:text-blue-400 hover:border-blue-500/40 transition flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ArrowRightLeft size={14} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Input Nilai Akademik</h1>
        <p className="text-slate-400 text-sm mt-1">Pilih nilai untuk setiap mata kuliah per semester</p>
      </div>

      {/* Semester Tabs */}
      <div className="flex gap-2 flex-wrap bg-slate-900 p-2 rounded-2xl border border-slate-800">
        {Array.from({ length: 14 }, (_, i) => i + 1).map(s => (
          <button
            key={s}
            onClick={() => setActiveSem(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-1 min-w-[70px] ${
              activeSem === s
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Sem {s}
            {s === user?.semester_aktif && (
              <span className="ml-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
            )}
          </button>
        ))}
      </div>

      {/* Keterangan fitur pindah */}
      <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
        <ArrowRightLeft size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-purple-300">
          <strong>Fitur Pindah MK:</strong> Jika Anda mengambil mata kuliah dari semester lain (atas/bawah), arahkan kursor ke baris MK dan klik ikon pindah
          untuk memindahkannya ke semester ini. MK ganjil ↔ ganjil · MK genap ↔ genap.
        </p>
      </div>

      {/* Progress */}
      {semData && !loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm font-medium text-slate-300 mb-2">
              <span>Progress Pengisian Semester {activeSem}</span>
              <span className="text-blue-400">{countFilled()} / {totalMK()} MK</span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${totalMK() > 0 ? (countFilled() / totalMK()) * 100 : 0}%` }}
              />
            </div>
          </div>
          {saved && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1.5 rounded-xl">
              <CheckCircle size={16} /> Tersimpan
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-3">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : semData ? (
        <div className="space-y-4">
          {/* Mata Kuliah Wajib */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-800/30">
              <BookOpen size={18} className="text-blue-400" />
              <h3 className="font-semibold text-slate-200">Mata Kuliah Wajib</h3>
              <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">{semData.wajib?.length} MK</span>
            </div>
            <div className="divide-y divide-slate-800">
              {semData.wajib?.map((item: any) => <MKRow key={item.mk_id} item={item} />)}
              {semData.wajib?.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-500">Tidak ada mata kuliah wajib di semester ini.</div>
              )}
            </div>
          </div>

          {/* MK Pindahan */}
          {semData.pindahan?.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-purple-500/5">
                <ArrowRightLeft size={18} className="text-purple-400" />
                <h3 className="font-semibold text-slate-200">MK Dipindahkan ke Semester Ini</h3>
                <span className="ml-auto text-xs font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-lg">
                  {semData.pindahan.length} MK
                </span>
              </div>
              <div className="divide-y divide-slate-800">
                {semData.pindahan?.map((item: any) => <MKRow key={item.mk_id || item.khs_id} item={item} />)}
              </div>
            </div>
          )}

          {/* Mata Kuliah Pilihan */}
          {Object.entries(semData.pilihan || {}).map(([kelompok, mks]: any) => (
            <div key={kelompok} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-amber-500/5">
                <Info size={18} className="text-amber-400" />
                <h3 className="font-semibold text-slate-200">Mata Kuliah Pilihan</h3>
                <span className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg ml-auto">
                  Pilih salah satu
                </span>
              </div>
              <div className="divide-y divide-slate-800">
                {mks.map((item: any) => {
                  const isSelected = pilihanSelected[kelompok] === item.khs_id;
                  const isDisabled = pilihanSelected[kelompok] && !isSelected;
                  return (
                    <div
                      key={item.mk_id}
                      className={`flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-4 transition cursor-pointer ${
                        isSelected ? 'bg-blue-500/5 border-l-2 border-blue-500' : 'hover:bg-slate-800/30'
                      } ${isDisabled ? 'opacity-40' : ''}`}
                      onClick={() => handlePilihanSelect(kelompok, item.khs_id)}
                    >
                      <div className={`hidden sm:flex w-5 h-5 rounded-full border-2 flex-shrink-0 items-center justify-center transition ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                           <div className={`sm:hidden w-4 h-4 rounded-full border-2 flex-shrink-0 items-center justify-center transition ${
                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <p className="text-sm font-medium text-slate-200 truncate">{item.nama}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 sm:pl-0 pl-6">
                          <span className="text-xs text-slate-500">{item.kode}</span>
                          <span className="text-slate-700">•</span>
                          <span className="text-xs text-slate-500">{item.sks} SKS</span>
                        </div>
                      </div>
                      <div className="self-end sm:self-auto mt-2 sm:mt-0">
                        {isSelected && (
                          <NilaiSelector
                            khsId={item.khs_id}
                            currentNilai={getCurrentNilai(item)}
                            onChange={handleNilaiChange}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save size={18} /> Simpan Nilai Semester {activeSem}</>
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* Modal Pindah Semester */}
      {pindahModal && (
        <ModalPindah
          item={pindahModal}
          activeSem={activeSem}
          onConfirm={handlePindah}
          onClose={() => setPindahModal(null)}
        />
      )}
    </div>
  );
}
