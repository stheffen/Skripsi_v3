"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, BookOpen, AlertTriangle, CheckCircle, TrendingDown,
  BookX, GraduationCap, FolderOpen, ChevronDown, ChevronUp, FileSearch
} from "lucide-react";
import Link from "next/link";
import { getCurriculumNilai } from "@/app/actions/khs";

const NILAI_COLORS: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
  B: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
  C: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
  D: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30",
  E: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30",
};

function RiskBadge({ kategori, large }: any) {
  const map: Record<string, any> = {
    Rendah: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30", icon: CheckCircle },
    Sedang: { cls: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30", icon: AlertTriangle },
    Tinggi: { cls: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30", icon: TrendingDown },
  };
  const { cls, icon: Icon } = map[kategori] || map["Rendah"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${cls} ${large ? "text-sm px-4 py-2" : "text-xs px-3 py-1"}`}>
      <Icon size={large ? 16 : 12} />
      Risiko {kategori || "Belum Dianalisis"}
    </span>
  );
}

function RekomendasiDisplay({ text }: { text: string }) {
  if (!text) return <p className="text-sm text-slate-500">Tidak ada rekomendasi teks.</p>;
  const lines = text.split('\n');

  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        const isHeader = /^[🚨⚠️✅📊❌🔮✅⚠️🏆🚀📋]/.test(line);

        if (isHeader) {
          const emojiMatch = line.match(/^[^\s]+/);
          const emoji = emojiMatch ? emojiMatch[0] : '';
          const rest = line.slice(emoji.length).trim();
          return (
            <div key={i} className="flex items-center gap-2 pt-1">
              <span className="text-base">{emoji}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">{rest}</span>
            </div>
          );
        }

        if (i === 0) return <p key={i} className="text-sm font-medium text-slate-900 dark:text-slate-200">{line}</p>;

        if (line.trim().startsWith('•')) {
          const content = line.trim().slice(1).trim();
          return (
            <div key={i} className="flex items-start gap-2 text-xs pl-4 text-slate-600 dark:text-slate-400">
              <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
              <span>{content}</span>
            </div>
          );
        }

        if (/^\d+\./.test(line.trim())) {
          return (
            <div key={i} className="flex items-start gap-2 text-xs pl-4 text-slate-600 dark:text-slate-400">
              <span className="text-blue-600 dark:text-blue-400 font-semibold flex-shrink-0">{line.match(/^\d+/)?.[0]}.</span>
              <span>{line.replace(/^\d+\.\s*/, '')}</span>
            </div>
          );
        }

        return <p key={i} className="text-xs text-slate-600 dark:text-slate-400 pl-1">{line}</p>;
      })}
    </div>
  );
}

export default function DetailMahasiswaClient({ mahasiswa, initialData, mkBelumDiambil, filledSemesters }: any) {
  const [activeTab, setActiveTab] = useState<"nilai" | "evaluasi">("nilai");
  
  // State for Nilai Tab - use first available semester as default
  const defaultSem = filledSemesters?.includes(mahasiswa.semester_aktif)
    ? mahasiswa.semester_aktif
    : filledSemesters?.[0] || 1;
  const [activeSem, setActiveSem] = useState(defaultSem);
  const [semData, setSemData] = useState<any>(null);
  const [loadingSem, setLoadingSem] = useState(false);

  // State for Belum Diambil Tab
  const [showAllMK, setShowAllMK] = useState(false);

  const fetchSemester = useCallback(async (sem: number) => {
    setLoadingSem(true);
    try {
      const data = await getCurriculumNilai(mahasiswa.id, sem);
      setSemData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSem(false);
    }
  }, [mahasiswa.id]);

  useEffect(() => {
    if (activeTab === "nilai") {
      fetchSemester(activeSem);
    }
  }, [activeSem, activeTab, fetchSemester]);

  const mkBermasalahDetail = initialData?.mk_bermasalah_detail || [];
  const totalSksBelum = mkBelumDiambil.reduce((acc: number, mk: any) => acc + mk.sks, 0);
  const displayedMK = showAllMK ? mkBelumDiambil : mkBelumDiambil.slice(0, 10);

  const MKRowReadonly = ({ item }: { item: any }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition border-b border-slate-200 dark:border-slate-800/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{item.nama}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-600 dark:text-slate-500">{item.kode}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs text-slate-600 dark:text-slate-500">{item.sks} SKS</span>
          <span className="text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded">{item.jenis}</span>
        </div>
      </div>
      <div className="self-end sm:self-auto mt-2 sm:mt-0">
        {item.nilai ? (
          <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${NILAI_COLORS[item.nilai]}`}>
            {item.nilai}
          </span>
        ) : (
          <span className="text-xs text-slate-500 dark:text-slate-600 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Belum Ada</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dosen/mahasiswa" className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Detail Mahasiswa</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">NIM: {mahasiswa.nim || "-"} • Angkatan {mahasiswa.angkatan || "-"}</p>
        </div>
      </div>

      {/* Profil Singkat */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm dark:shadow-none">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shrink-0">
          {mahasiswa.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200">{mahasiswa.name}</h2>
          <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1"><GraduationCap size={14}/> Sem {mahasiswa.semester_aktif}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="flex items-center gap-1"><BookOpen size={14}/> {mahasiswa.program_studi || "Informatika"}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-200">{initialData?.ips?.toFixed(2) || "-"}</p>
            <p className="text-xs text-slate-500">IPS Terakhir</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-200">{initialData?.ipk?.toFixed(2) || "-"}</p>
            <p className="text-xs text-slate-500">IPK</p>
          </div>
          <div className="text-center">
            <RiskBadge kategori={initialData?.kategori} />
            <p className="text-xs text-slate-500 mt-1">Status Akademik</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button onClick={() => setActiveTab("nilai")} className={`px-4 py-3 text-sm font-medium transition border-b-2 whitespace-nowrap ${activeTab === "nilai" ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400" : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-300"}`}>
          <div className="flex items-center gap-2"><BookOpen size={16}/> Lihat Nilai</div>
        </button>
        <button onClick={() => setActiveTab("evaluasi")} className={`px-4 py-3 text-sm font-medium transition border-b-2 whitespace-nowrap ${activeTab === "evaluasi" ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400" : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-300"}`}>
          <div className="flex items-center gap-2"><FileSearch size={16}/> MK Bermasalah & Belum Diambil</div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* TAB 1: LIHAT NILAI */}
        {activeTab === "nilai" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex gap-2 flex-wrap bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
              {filledSemesters.map((s: number) => (
                <button
                  key={s}
                  onClick={() => setActiveSem(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-1 min-w-[70px] ${
                    activeSem === s ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Sem {s}
                  {s === mahasiswa.semester_aktif && <span className="ml-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />}
                </button>
              ))}
            </div>

            {loadingSem ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 flex items-center justify-center shadow-sm dark:shadow-none">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : semData ? (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                    <BookOpen size={18} className="text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-200">Mata Kuliah Wajib</h3>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {semData.wajib?.map((item: any) => <MKRowReadonly key={item.mk_id} item={item} />)}
                    {semData.wajib?.length === 0 && <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">Belum ada mata kuliah di semester ini.</div>}
                  </div>
                </div>

                {semData.pindahan?.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-purple-50 dark:bg-purple-500/5">
                      <FolderOpen size={18} className="text-purple-600 dark:text-purple-400" />
                      <h3 className="font-semibold text-slate-900 dark:text-slate-200">MK Dipindahkan ke Semester Ini</h3>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {semData.pindahan?.map((item: any) => <MKRowReadonly key={item.mk_id} item={item} />)}
                    </div>
                  </div>
                )}

                {Object.entries(semData.pilihan || {}).map(([kelompok, mks]: any) => (
                  mks.length > 0 ? (
                    <div key={kelompok} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                      <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-amber-50 dark:bg-amber-500/5">
                        <FolderOpen size={18} className="text-amber-600 dark:text-amber-400" />
                        <h3 className="font-semibold text-slate-900 dark:text-slate-200">Mata Kuliah Pilihan ({kelompok})</h3>
                      </div>
                      <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {mks.map((item: any) => <MKRowReadonly key={item.mk_id} item={item} />)}
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 2: EVALUASI MK & BELUM DIAMBIL */}
        {activeTab === "evaluasi" && (
          <div className="space-y-6 animate-in fade-in">
            {/* 1. Mata Kuliah Perlu Diperbaiki */}
            {!initialData ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center shadow-sm dark:shadow-none">
                <AlertTriangle size={32} className="mx-auto text-amber-500 mb-2" />
                <p className="text-sm text-slate-500">Mahasiswa belum pernah melakukan perhitungan analisis risiko.</p>
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-4 text-sm flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-red-500 dark:bg-red-400 rounded-full" />
                    Mata Kuliah Perlu Diperbaiki ({mkBermasalahDetail.length} MK)
                  </h3>
                  {mkBermasalahDetail.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-sm text-slate-500">Tidak ada data mata kuliah bermasalah pada Analisis Terakhir.</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">Jika terdapat D/E di "Lihat Nilai" tapi tidak muncul di sini, Anda bisa menyarankan mahasiswa tersebut untuk menghitung ulang analisis risikonya.</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/80">
                            <th className="text-left px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">Nama MK</th>
                            <th className="text-center px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">SKS</th>
                            <th className="text-center px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">Nilai</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {mkBermasalahDetail.map((mk: any, i: number) => (
                            <tr key={i} className="bg-red-50 dark:bg-red-500/5">
                              <td className="px-3 py-2 text-slate-900 dark:text-slate-300">{mk.nama}</td>
                              <td className="px-3 py-2 text-center text-slate-600 dark:text-slate-400">{mk.sks}</td>
                              <td className="px-3 py-2 text-center text-red-600 dark:text-red-400 font-bold">{mk.nilai}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 2. Rekomendasi Sistem */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-4 text-sm flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-amber-500 dark:bg-amber-400 rounded-full" />
                    Rekomendasi Analisis Terakhir
                  </h3>
                  <RekomendasiDisplay text={initialData.rekomendasi} />
                </div>
              </>
            )}

            {/* 3. Daftar MK Belum Diambil */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none mt-6">
              <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-4 text-sm flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-blue-500 dark:bg-blue-400 rounded-full" />
                Mata Kuliah Belum Diambil ({mkBelumDiambil.length} MK / {totalSksBelum} SKS)
              </h3>
              
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80">
                      <th className="text-left px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">Kode</th>
                      <th className="text-left px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">Nama MK</th>
                      <th className="text-center px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">SKS</th>
                      <th className="text-center px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">Sem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {displayedMK.map((mk: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-400">{mk.kode}</td>
                        <td className="px-3 py-2 text-slate-900 dark:text-slate-300">{mk.nama}</td>
                        <td className="px-3 py-2 text-center text-slate-600 dark:text-slate-400">{mk.sks}</td>
                        <td className="px-3 py-2 text-center text-blue-600 dark:text-blue-400 font-medium">Sem {mk.semester}</td>
                      </tr>
                    ))}
                    {mkBelumDiambil.length === 0 && (
                      <tr><td colSpan={4} className="p-6 text-center text-sm text-slate-500">Semua MK sudah diambil!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {mkBelumDiambil.length > 10 && (
                <button onClick={() => setShowAllMK(!showAllMK)} className="w-full mt-2 py-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition flex items-center justify-center gap-1 font-medium">
                  {showAllMK ? <><ChevronUp size={14} /> Tampilkan lebih sedikit</> : <><ChevronDown size={14} /> Tampilkan semua MK Belum Diambil</>}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
