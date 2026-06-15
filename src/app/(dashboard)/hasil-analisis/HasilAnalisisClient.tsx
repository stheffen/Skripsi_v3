"use client";

import { useState } from "react";
import {
  BarChart3, AlertTriangle, CheckCircle, TrendingDown,
  Zap, ChevronDown, ChevronUp, TriangleAlert, BookX, BookOpen
} from "lucide-react";
import dynamic from "next/dynamic";
import { hitungAnalisisRisiko } from "@/app/actions/analisis";

const HasilRadarChart = dynamic(
  () => import("@/components/charts/HasilRadarChart"),
  { ssr: false, loading: () => <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[250px] flex items-center justify-center text-slate-500 text-sm animate-pulse">Memuat grafik...</div> }
);

function RiskBadge({ kategori, large }: any) {
  const map: Record<string, any> = {
    Rendah: { 
      cls: "bg-risk-rendah/10 text-risk-rendah border border-risk-rendah/20 dark:bg-transparent dark:text-risk-rendah dark:border-risk-rendah/50 dark:shadow-[0_0_10px_var(--color-risk-rendah)]", 
      icon: CheckCircle 
    },
    Sedang: { 
      cls: "bg-risk-sedang/10 text-risk-sedang border border-risk-sedang/20 dark:bg-transparent dark:text-risk-sedang dark:border-risk-sedang/50 dark:shadow-[0_0_10px_var(--color-risk-sedang)]", 
      icon: AlertTriangle 
    },
    Tinggi: { 
      cls: "bg-risk-tinggi/10 text-risk-tinggi border border-risk-tinggi/20 dark:bg-transparent dark:text-risk-tinggi dark:border-risk-tinggi/50 dark:shadow-[0_0_10px_var(--color-risk-tinggi)]", 
      icon: TrendingDown 
    },
  };
  const { cls, icon: Icon } = map[kategori] || map["Rendah"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold tracking-wider uppercase ${cls} ${large ? "text-sm px-4 py-2" : "text-xs px-3 py-1"}`}>
      <Icon size={large ? 16 : 12} />
      Risiko {kategori}
    </span>
  );
}

function MembershipBar({ label, value, color }: any) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 dark:text-slate-400 w-16 text-right">{label}</span>
      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 w-10">{value.toFixed(3)}</span>
    </div>
  );
}

function MKBermasalahTable({ mkDetail }: { mkDetail: any[] }) {
  if (!mkDetail || mkDetail.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/80">
            <th className="text-left px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">Kode</th>
            <th className="text-left px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">Nama MK</th>
            <th className="text-center px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">SKS</th>
            <th className="text-center px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">Nilai</th>
            <th className="text-center px-3 py-2 text-slate-500 dark:text-slate-400 font-medium">Sem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {mkDetail.map((mk, i) => (
            <tr key={i} className={`transition hover:bg-slate-100 dark:hover:bg-slate-800/30 ${mk.nilai === "E" ? "bg-red-50 dark:bg-red-500/5" : "bg-orange-50 dark:bg-orange-500/5"}`}>
              <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-400">{mk.kode}</td>
              <td className="px-3 py-2 text-slate-900 dark:text-slate-300">{mk.nama}</td>
              <td className="px-3 py-2 text-center text-slate-500 dark:text-slate-400">{mk.sks}</td>
              <td className="px-3 py-2 text-center">
                <span className={`font-bold px-2 py-0.5 rounded-lg ${mk.nilai === "E" ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300" : "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300"}`}>{mk.nilai}</span>
              </td>
              <td className="px-3 py-2 text-center text-slate-500">{mk.semester}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MKBelumDiambilTable({ mkList }: { mkList: any[] }) {
  const [showAll, setShowAll] = useState(false);
  if (!mkList || mkList.length === 0) return (
    <div className="text-center py-8 text-slate-500 text-sm">
      <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
      Semua mata kuliah sudah diambil!
    </div>
  );

  const totalSks = mkList.reduce((acc: number, mk: any) => acc + mk.sks, 0);
  const displayed = showAll ? mkList : mkList.slice(0, 10);
  const grouped = mkList.reduce((acc: any, mk: any) => {
    if (!acc[mk.semester]) acc[mk.semester] = [];
    acc[mk.semester].push(mk);
    return acc;
  }, {} as Record<number, any[]>);

  return (
    <div className="space-y-3">
      {/* Summary badge */}
      <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700">
        <BookX size={18} className="text-amber-400" />
        <div>
          <p className="text-sm font-semibold text-slate-200">{mkList.length} Mata Kuliah Belum Diambil</p>
          <p className="text-xs text-slate-400">Total: <span className="text-amber-400 font-bold">{totalSks} SKS</span> belum ditempuh</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-800/80">
              <th className="text-left px-3 py-2 text-slate-400 font-medium">Kode</th>
              <th className="text-left px-3 py-2 text-slate-400 font-medium">Nama MK</th>
              <th className="text-center px-3 py-2 text-slate-400 font-medium">SKS</th>
              <th className="text-center px-3 py-2 text-slate-400 font-medium">Sem</th>
              <th className="text-center px-3 py-2 text-slate-400 font-medium">Jenis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {Object.entries(grouped).map(([sem, mkSem]: [string, any]) => (
              <tr key={sem}>
                <td colSpan={5}>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/80 px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Semester {sem}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-200 dark:bg-slate-900 px-2 py-0.5 rounded-md">{mkSem.length} MK</span>
                    </div>
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-transparent">
                        {mkSem.map((mk: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                            <td className="px-3 py-2 font-mono text-slate-500 dark:text-slate-400 w-24">{mk.kode}</td>
                            <td className="px-3 py-2 text-slate-800 dark:text-slate-300 font-medium">{mk.nama}</td>
                            <td className="px-3 py-2 text-center text-slate-500 dark:text-slate-400 w-12">{mk.sks} SKS</td>
                            <td className="px-3 py-2 text-right w-24">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${mk.jenis === "Wajib" ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"}`}>{mk.jenis}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            ))}
            {/* Total row */}
            <tr className="bg-slate-800/60 font-semibold">
              <td className="px-3 py-2 text-slate-300" colSpan={2}>TOTAL SKS BELUM DIAMBIL</td>
              <td className="px-3 py-2 text-center text-amber-400 font-bold">{totalSks}</td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {mkList.length > 10 && (
        <button onClick={() => setShowAll(!showAll)} className="w-full py-2 text-xs text-blue-400 hover:text-blue-300 transition flex items-center justify-center gap-1">
          {showAll ? <><ChevronUp size={14} /> Tampilkan lebih sedikit</> : <><ChevronDown size={14} /> Tampilkan semua {mkList.length} mata kuliah</>}
        </button>
      )}
    </div>
  );
}

export default function HasilAnalisisClient({ user, initialData, maxSemester = 1, mkBelumDiambil = [] }: {
  user: any;
  initialData: any;
  maxSemester?: number;
  mkBelumDiambil?: any[];
}) {
  const [semester, setSemester] = useState(Math.min(user?.semester_aktif || 1, maxSemester));
  const [result, setResult] = useState<any>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRules, setShowRules] = useState(false);

  const semesterOptions = Array.from({ length: maxSemester }, (_, i) => i + 1);

  const handleAnalisis = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await hitungAnalisisRisiko(parseInt(user.id), semester);
      if (res.error || !res.data) throw new Error(res.error || "Data tidak ditemukan");
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Gagal menghitung analisis.");
      setLoading(false);
    }
  };

  const fuzzyDetail = result?.detail_fuzzy
    ? (() => { try { return JSON.parse(result.detail_fuzzy); } catch { return null; } })()
    : (result?.fuzzifikasi ? result : null);
  const radarData = result
    ? [
        { subject: "IPS", A: (result.ips / 4) * 100, fullMark: 100 },
        { subject: "IPK", A: (result.ipk / 4) * 100, fullMark: 100 },
        { subject: "MK Aman", A: result.mk_bermasalah === 0 ? 100 : Math.max(0, 100 - result.mk_bermasalah * 15), fullMark: 100 },
      ]
    : [];

  const totalRules = fuzzyDetail?.total_rules || 27;
  const angkatanMode = fuzzyDetail?.angkatan_mode;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analisis Risiko Akademik</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Perhitungan menggunakan metode Logika Fuzzy Mamdani</p>
      </div>

      {/* Trigger Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-1">Hitung Analisis Baru</p>
            <p className="text-xs text-slate-500">
              Pilih semester (maks. Semester {maxSemester} berdasarkan angkatan {user?.angkatan || "-"})
            </p>
          </div>
          <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
            <select
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
            >
              {semesterOptions.map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
            <button
              onClick={handleAnalisis}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={16} />}
              Hitung Analisis
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-3">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {!result ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <BarChart3 size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-900 dark:text-slate-300 font-medium mb-2">Belum ada analisis risiko</p>
          <p className="text-slate-500 text-sm">Pilih semester dan klik "Hitung Analisis" untuk memulai</p>
        </div>
      ) : (
        <>
          {/* Result Header */}
          <div className={`rounded-2xl p-6 border shadow-sm ${
            result.kategori === "Tinggi" ? "bg-white dark:bg-slate-900 border-l-4 border-l-risk-tinggi dark:border-risk-tinggi/30 dark:shadow-[0_0_20px_var(--color-risk-tinggi)]" :
            result.kategori === "Sedang" ? "bg-white dark:bg-slate-900 border-l-4 border-l-risk-sedang dark:border-risk-sedang/30 dark:shadow-[0_0_20px_var(--color-risk-sedang)]" :
            "bg-white dark:bg-slate-900 border-l-4 border-l-risk-rendah dark:border-risk-rendah/30 dark:shadow-[0_0_20px_var(--color-risk-rendah)]"
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Hasil Analisis Semester {result.semester}</p>
                <RiskBadge kategori={result.kategori} large />
                <p className="text-xs text-slate-500 mt-3">
                  {new Date(result.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
                {angkatanMode && (
                  <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full border ${angkatanMode === "baru_9_aturan" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-slate-700 text-slate-400 border-slate-600"}`}>
                    {angkatanMode === "baru_9_aturan" ? "? 9 Aturan (Angkatan 2026+)" : "?? 27 Aturan (Angkatan <2026)"}
                  </span>
                )}
              </div>
              <div className="sm:ml-auto grid grid-cols-3 gap-6 text-center w-full sm:w-auto mt-4 sm:mt-0">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{result.ips?.toFixed(2) ?? '-'}</p>
                  <p className="text-xs text-slate-500 mt-1">IPS</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{result.ipk?.toFixed(2) ?? '-'}</p>
                  <p className="text-xs text-slate-500 mt-1">IPK</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <p className={`text-2xl font-bold ${(result.mk_bermasalah_detail?.length ?? result.mk_bermasalah) > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>{result.mk_bermasalah_detail?.length ?? result.mk_bermasalah}</p>
                  <p className="text-xs text-slate-500 mt-1">MK D/E</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fuzzifikasi */}
            {fuzzyDetail?.fuzzifikasi && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
                <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-5 text-sm flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Fuzzifikasi Input
                </h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-slate-400 mb-2 font-medium">IPS = {result.ips?.toFixed(2)}</p>
                    <div className="space-y-1.5">
                      <MembershipBar label="Rendah" value={fuzzyDetail.fuzzifikasi.ips.rendah} color="#ef4444" />
                      <MembershipBar label="Sedang" value={fuzzyDetail.fuzzifikasi.ips.sedang} color="#f59e0b" />
                      <MembershipBar label="Tinggi" value={fuzzyDetail.fuzzifikasi.ips.tinggi} color="#10b981" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2 font-medium">IPK = {result.ipk?.toFixed(2)}</p>
                    <div className="space-y-1.5">
                      <MembershipBar label="Rendah" value={fuzzyDetail.fuzzifikasi.ipk.rendah} color="#ef4444" />
                      <MembershipBar label="Sedang" value={fuzzyDetail.fuzzifikasi.ipk.sedang} color="#f59e0b" />
                      <MembershipBar label="Tinggi" value={fuzzyDetail.fuzzifikasi.ipk.tinggi} color="#10b981" />
                    </div>
                  </div>
                  {angkatanMode !== "baru_9_aturan" && fuzzyDetail.fuzzifikasi.mk && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2 font-medium">Input Fuzzy MK Bermasalah = {result.mk_bermasalah}</p>
                      <div className="space-y-1.5">
                        <MembershipBar label="Sedikit" value={fuzzyDetail.fuzzifikasi.mk.sedikit} color="#10b981" />
                        <MembershipBar label="Sedang" value={fuzzyDetail.fuzzifikasi.mk.sedang} color="#f59e0b" />
                        <MembershipBar label="Banyak" value={fuzzyDetail.fuzzifikasi.mk.banyak} color="#ef4444" />
                      </div>
                    </div>
                  )}
                  {angkatanMode === "baru_9_aturan" && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <p className="text-xs text-purple-300 font-medium">? Mode Angkatan 2026+</p>
                      <p className="text-xs text-purple-400 mt-1">
                        MK Bermasalah: <strong>{result.mk_bermasalah > 0 ? "Ada nilai D/E ? Eskalasi risiko" : "Tidak ada nilai D/E"}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <HasilRadarChart data={radarData} kategori={result.kategori} fuzzy_output={result.fuzzy_output} />
          </div>

          {/* MK Bermasalah */}
          {result.mk_bermasalah_detail?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-4 text-sm flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-red-500 dark:bg-red-400 rounded-full" />
                Mata Kuliah Perlu Diperbaiki ({result.mk_bermasalah_detail.length} MK)
              </h3>
              <MKBermasalahTable mkDetail={result.mk_bermasalah_detail} />
            </div>
          )}

          {/* MK Belum Diambil */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-4 text-sm flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-amber-500 dark:bg-amber-400 rounded-full" />
              Mata Kuliah Belum Diambil
            </h3>
            <MKBelumDiambilTable mkList={mkBelumDiambil} />
          </div>



          {/* Rules Aktif */}
          {fuzzyDetail?.rules_aktif?.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
              <button onClick={() => setShowRules(!showRules)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/50 transition">
                <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-purple-400 rounded-full" />
                  Rules Fuzzy Aktif ({fuzzyDetail.rules_aktif.length} dari {totalRules})
                </h3>
                {showRules ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>
              {showRules && (
                <div className="border-t border-slate-800 divide-y divide-slate-800/50">
                  {fuzzyDetail.rules_aktif.map((r: any) => (
                    <div key={r.rule} className="px-5 py-3 flex items-center gap-3 text-xs hover:bg-slate-800/30 transition-colors">
                      <span className="text-slate-500 w-8 font-mono">R{r.rule}</span>
                      <span className="text-slate-400">
                        IF IPS <span className="text-blue-400 font-medium">{r.ips}</span>{" "}
                        AND IPK <span className="text-purple-400 font-medium">{r.ipk}</span>{" "}
                        {r.mk && <>AND MK <span className="text-amber-400 font-medium">{r.mk}</span>{" "}</>}
                        ?{" "}
                        <span className={`font-semibold ${r.output === "tinggi" ? "text-red-400" : r.output === "sedang" ? "text-amber-400" : "text-emerald-400"}`}>{r.output}</span>
                      </span>
                      <span className="ml-auto font-mono text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md">a={r.alpha}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
