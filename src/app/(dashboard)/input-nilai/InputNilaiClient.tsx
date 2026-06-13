"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, FolderOpen } from "lucide-react";
import { getCurriculumNilai } from "@/app/actions/khs";

const NILAI_COLORS: Record<string, string> = {
  A: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  B: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  C: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  D: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  E: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function InputNilaiClient({ user }: { user: any }) {
  const [activeSem, setActiveSem] = useState(user?.semester_aktif || 1);
  const [semData, setSemData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSemester = useCallback(async (sem: number) => {
    setLoading(true);
    try {
      const data = await getCurriculumNilai(parseInt(user.id), sem);
      setSemData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchSemester(activeSem);
  }, [activeSem, fetchSemester]);

  const MKRowReadonly = ({ item }: { item: any }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-4 hover:bg-slate-800/30 transition border-b border-slate-800/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200">{item.nama}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-500">{item.kode}</span>
          <span className="text-slate-700">•</span>
          <span className="text-xs text-slate-500">{item.sks} SKS</span>
          <span className="text-xs px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded">{item.jenis}</span>
        </div>
      </div>
      <div className="self-end sm:self-auto mt-2 sm:mt-0">
        {item.nilai ? (
          <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${NILAI_COLORS[item.nilai]}`}>
            {item.nilai}
          </span>
        ) : (
          <span className="text-xs text-slate-600 bg-slate-800/50 px-2 py-1 rounded">Belum Ada Nilai</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Lihat Nilai</h1>
        <p className="text-slate-400 text-sm mt-1">Daftar mata kuliah dan nilai Anda per semester</p>
      </div>

      <div className="flex gap-2 flex-wrap bg-slate-900 p-2 rounded-2xl border border-slate-800">
        {Array.from({ length: 14 }, (_, i) => i + 1).map(s => (
          <button
            key={s}
            onClick={() => setActiveSem(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-1 min-w-[70px] ${
              activeSem === s ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            Sem {s}
            {s === user?.semester_aktif && <span className="ml-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : semData ? (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-800/30">
              <BookOpen size={18} className="text-blue-400" />
              <h3 className="font-semibold text-slate-200">Mata Kuliah Wajib</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {semData.wajib?.map((item: any) => <MKRowReadonly key={item.mk_id} item={item} />)}
              {semData.wajib?.length === 0 && <div className="p-6 text-center text-sm text-slate-500">Belum ada mata kuliah di semester ini.</div>}
            </div>
          </div>

          {semData.pindahan?.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-purple-500/5">
                <FolderOpen size={18} className="text-purple-400" />
                <h3 className="font-semibold text-slate-200">Mata Kuliah Pindahan</h3>
              </div>
              <div className="divide-y divide-slate-800">
                {semData.pindahan?.map((item: any) => <MKRowReadonly key={item.mk_id} item={item} />)}
              </div>
            </div>
          )}

          {Object.entries(semData.pilihan || {}).map(([kelompok, mks]: any) => (
            mks.length > 0 ? (
              <div key={kelompok} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-amber-500/5">
                  <FolderOpen size={18} className="text-amber-400" />
                  <h3 className="font-semibold text-slate-200">Mata Kuliah Pilihan ({kelompok})</h3>
                </div>
                <div className="divide-y divide-slate-800">
                  {mks.map((item: any) => <MKRowReadonly key={item.mk_id} item={item} />)}
                </div>
              </div>
            ) : null
          ))}
        </div>
      ) : null}
    </div>
  );
}
