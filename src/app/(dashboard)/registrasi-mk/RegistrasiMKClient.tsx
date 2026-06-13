"use client";

import { useState, useTransition } from "react";
import { ClipboardList, CheckCircle, ChevronDown, ChevronUp, Save, AlertTriangle, BookOpen } from "lucide-react";
import { batchRegistrasiMK } from "@/app/actions/registrasi";
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
              : "bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300"
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
  const [activeSem, setActiveSem] = useState(1);
  const [selectedMK, setSelectedMK] = useState<Record<number, boolean>>({});
  const [nilaiMap, setNilaiMap] = useState<Record<number, string | null>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const semesterList = Object.keys(mkPerSemester)
    .map(Number)
    .sort((a, b) => a - b);

  const currentMKList = mkPerSemester[activeSem] || [];

  const handleSelectMK = (mkId: number, checked: boolean) => {
    setSelectedMK((prev) => ({ ...prev, [mkId]: checked }));
    if (!checked) {
      setNilaiMap((prev) => { const n = { ...prev }; delete n[mkId]; return n; });
    }
  };

  const handleNilai = (mkId: number, nilai: string | null) => {
    setNilaiMap((prev) => ({ ...prev, [mkId]: nilai }));
  };

  const handleSave = () => {
    const toSave = currentMKList
      .filter((mk: any) => selectedMK[mk.id] && nilaiMap[mk.id])
      .map((mk: any) => ({ mkId: mk.id, nilai: nilaiMap[mk.id]!, semester: activeSem }));

    if (toSave.length === 0) {
      setError("Pilih mata kuliah dan input nilainya terlebih dahulu.");
      return;
    }

    setError("");
    startTransition(async () => {
      const res = await batchRegistrasiMK(parseInt(user.id), toSave);
      if (res.error) {
        setError(res.error);
      } else {
        setSaved(true);
        setTimeout(() => {
          router.refresh();
          setSaved(false);
          setSelectedMK({});
          setNilaiMap({});
        }, 1500);
      }
    });
  };

  const selectedCount = Object.values(selectedMK).filter(Boolean).length;
  const filledNilaiCount = Object.entries(nilaiMap).filter(([mkId, v]) => v && selectedMK[Number(mkId)]).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Registrasi Mata Kuliah</h1>
        <p className="text-slate-400 text-sm mt-1">Pilih mata kuliah yang Anda ambil di semester ini dan input nilainya</p>
      </div>

      {/* Semester Tabs */}
      <div className="flex gap-2 flex-wrap bg-slate-900 p-2 rounded-2xl border border-slate-800">
        {semesterList.map((s) => {
          const mks = mkPerSemester[s] || [];
          const regCount = mks.filter((m: any) => m.sudah_registrasi && m.nilai).length;
          return (
            <button
              key={s}
              onClick={() => { setActiveSem(s); setSelectedMK({}); setNilaiMap({}); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-1 min-w-[70px] relative ${
                activeSem === s
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              Sem {s}
              {regCount > 0 && (
                <span className="ml-1 w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
              )}
            </button>
          );
        })}
      </div>

      {/* Info Panel */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
        <BookOpen size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <strong>Cara registrasi:</strong> Centang MK yang Anda ambil, lalu pilih nilai. Klik "Simpan" untuk menyimpan.
          Untuk angkatan 2026 ke atas, pastikan tidak ada nilai D karena akan meningkatkan risiko akademik.
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-3">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {saved && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle size={18} /> Registrasi berhasil disimpan!
        </div>
      )}

      {/* MK List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-800/30">
          <ClipboardList size={18} className="text-blue-400" />
          <h3 className="font-semibold text-slate-200">Mata Kuliah Semester {activeSem}</h3>
          <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">
            {currentMKList.length} MK
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {currentMKList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">Tidak ada mata kuliah di semester ini.</div>
          ) : (
            currentMKList.map((mk: any) => {
              const isSelected = !!selectedMK[mk.id];
              const isAlreadyRegistered = mk.sudah_registrasi && mk.nilai;
              return (
                <div
                  key={mk.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-4 transition ${
                    isSelected ? "bg-blue-500/5" : isAlreadyRegistered ? "bg-emerald-500/5" : "hover:bg-slate-800/30"
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isAlreadyRegistered ? (
                      <div className="w-5 h-5 rounded bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center">
                        <CheckCircle size={12} className="text-emerald-400" />
                      </div>
                    ) : (
                      <input
                        type="checkbox"
                        id={`mk-${mk.id}`}
                        checked={isSelected}
                        onChange={(e) => handleSelectMK(mk.id, e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-blue-500 cursor-pointer"
                      />
                    )}
                  </div>

                  {/* MK Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{mk.nama}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500">{mk.kode}</span>
                      <span className="text-slate-700">&bull;</span>
                      <span className="text-xs text-slate-500">{mk.sks} SKS</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${mk.jenis === "Wajib" ? "bg-slate-700/50 text-slate-400" : "bg-amber-500/20 text-amber-300"}`}>
                        {mk.jenis}
                      </span>
                      {isAlreadyRegistered && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${NILAI_COLORS[mk.nilai]}`}>
                          Nilai: {mk.nilai}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="self-end sm:self-auto mt-2 sm:mt-0 flex items-center">
                    {isAlreadyRegistered ? (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1"><CheckCircle size={12} /> Sudah diregistrasi</span>
                    ) : isSelected ? (
                      <NilaiSelector mkId={mk.id} currentNilai={nilaiMap[mk.id] ?? null} onChange={handleNilai} />
                    ) : (
                      <span className="text-xs text-slate-600">- Pilih MK terlebih dahulu</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Save Button */}
      {selectedCount > 0 && (
        <div className="sticky bottom-4 flex justify-between items-center p-4 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-2xl shadow-xl">
          <div>
            <p className="text-sm font-semibold text-slate-200">{selectedCount} MK dipilih, {filledNilaiCount} sudah ber-nilai</p>
            <p className="text-xs text-slate-500">Pastikan semua MK yang dipilih sudah memiliki nilai sebelum menyimpan</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isPending || filledNilaiCount === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            {isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            Simpan Registrasi
          </button>
        </div>
      )}
    </div>
  );
}
