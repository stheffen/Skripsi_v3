"use client";

import { useState } from 'react';
import {
  BarChart3, AlertTriangle, CheckCircle, TrendingDown,
  Zap, ChevronDown, ChevronUp, BookX, TriangleAlert, Info
} from 'lucide-react';
import dynamic from 'next/dynamic';

const HasilRadarChart = dynamic(
  () => import('@/components/charts/HasilRadarChart'),
  { ssr: false, loading: () => <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[250px] flex items-center justify-center text-slate-500 text-sm animate-pulse">Memuat grafik...</div> }
);
import { hitungAnalisisRisiko } from '@/app/actions/analisis';

function RiskBadge({ kategori, large }: any) {
  const map: Record<string, any> = {
    'Rendah': { cls: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', icon: CheckCircle },
    'Sedang': { cls: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', icon: AlertTriangle },
    'Tinggi': { cls: 'bg-red-500/20 text-red-400 border border-red-500/30', icon: TrendingDown },
  };
  const { cls, icon: Icon } = map[kategori] || map['Rendah'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${cls} ${large ? 'text-sm px-4 py-2' : 'text-xs px-3 py-1'}`}>
      <Icon size={large ? 16 : 12} />
      Risiko {kategori}
    </span>
  );
}

function MembershipBar({ label, value, color }: any) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-16 text-right">{label}</span>
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono text-slate-300 w-10">{(value).toFixed(3)}</span>
    </div>
  );
}

function RekomendasiDisplay({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        const isHeader = /^[🚨⚠️✅📊❌🔮✅⚠️🏆🚀📋]/.test(line) && (
          line.includes('STATUS') || line.includes('ANALISIS') ||
          line.includes('MATA KULIAH') || line.includes('KONSEKUENSI') ||
          line.includes('RENCANA') || line.includes('SARAN') ||
          line.includes('PREDIKSI') || line.includes('PENCAPAIAN')
        );

        if (isHeader) {
          const emojiMatch = line.match(/^[^\s]+/);
          const emoji = emojiMatch ? emojiMatch[0] : '';
          const rest = line.slice(emoji.length).trim();
          return (
            <div key={i} className="flex items-center gap-2 pt-1">
              <span className="text-base">{emoji}</span>
              <span className="text-sm font-semibold text-slate-200">{rest}</span>
            </div>
          );
        }

        if (i === 0) {
          return <p key={i} className="text-sm font-medium text-slate-200">{line}</p>;
        }

        if (line.trim().startsWith('•')) {
          const content = line.trim().slice(1).trim();
          const isPriority = content.startsWith('[PRIORITAS UTAMA]');
          const isNeedRetake = content.startsWith('[Perlu Diulang]');
          return (
            <div key={i} className={`flex items-start gap-2 text-xs pl-4 ${
              isPriority ? 'text-red-300' : isNeedRetake ? 'text-amber-300' : 'text-slate-400'
            }`}>
              <span className={`mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full ${
                isPriority ? 'bg-red-400' : isNeedRetake ? 'bg-amber-400' : 'bg-slate-600'
              }`} />
              <span>{content}</span>
            </div>
          );
        }

        if (/^\d+\./.test(line.trim())) {
          const match = line.match(/^\d+/);
          return (
            <div key={i} className="flex items-start gap-2 text-xs pl-4 text-slate-400">
              <span className="text-blue-400 font-semibold flex-shrink-0">{match ? match[0] : ''}.</span>
              <span>{line.replace(/^\d+\.\s*/, '')}</span>
            </div>
          );
        }

        return <p key={i} className="text-xs text-slate-400 pl-1">{line}</p>;
      })}
    </div>
  );
}

function MKBermasalahTable({ mkDetail }: { mkDetail: any[] }) {
  if (!mkDetail || mkDetail.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-800/80">
            <th className="text-left px-3 py-2 text-slate-400 font-medium">Kode</th>
            <th className="text-left px-3 py-2 text-slate-400 font-medium">Nama MK</th>
            <th className="text-center px-3 py-2 text-slate-400 font-medium">SKS</th>
            <th className="text-center px-3 py-2 text-slate-400 font-medium">Nilai</th>
            <th className="text-center px-3 py-2 text-slate-400 font-medium">Sem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {mkDetail.map((mk, i) => (
            <tr key={i} className={`transition hover:bg-slate-800/30 ${mk.nilai === 'E' ? 'bg-red-500/5' : 'bg-orange-500/5'}`}>
              <td className="px-3 py-2 font-mono text-slate-400">{mk.kode}</td>
              <td className="px-3 py-2 text-slate-300">{mk.nama}</td>
              <td className="px-3 py-2 text-center text-slate-400">{mk.sks}</td>
              <td className="px-3 py-2 text-center">
                <span className={`font-bold px-2 py-0.5 rounded-lg ${
                  mk.nilai === 'E' ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'
                }`}>{mk.nilai}</span>
              </td>
              <td className="px-3 py-2 text-center text-slate-500">{mk.semester}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HasilAnalisisClient({ user, initialData, filledSemesters = [] }: { user: any, initialData: any, filledSemesters?: number[] }) {
  const initialSem = filledSemesters.length > 0
    ? (filledSemesters.includes(user?.semester_aktif) ? user.semester_aktif : filledSemesters[filledSemesters.length - 1])
    : 1;
  const [semester, setSemester] = useState(initialSem);
  const [result, setResult] = useState<any>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [showKonsekuensi, setShowKonsekuensi] = useState(false);

  const handleAnalisis = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await hitungAnalisisRisiko(parseInt(user.id), semester);
      if (res.error || !res.data) throw new Error(res.error || 'Data tidak ditemukan');
      
      const parsedDetail = JSON.parse(res.data.detail_fuzzy as string);
      
      setResult({
        ...res.data,
        ...parsedDetail, // mix in detail_fuzzy for fuzzifikasi and rules
        mk_bermasalah_detail: (res.fuzzyResult?.input as any)?.mkDetail || [],
      });
      // Small patch: to make MK detail show immediately, we need the server to return it.
      // Since it's not crucial for the fuzzy output, it's fine.
      window.location.reload(); // Quick way to get fresh data from page.tsx 
    } catch (err: any) {
      setError(err.message || 'Gagal menghitung analisis.');
      setLoading(false);
    }
  };

  const fuzzyDetail = result?.detail_fuzzy ? JSON.parse(result.detail_fuzzy) : result?.fuzzifikasi ? result : null;
  const radarData = result ? [
    { subject: 'IPS',     A: (result.ips / 4) * 100,    fullMark: 100 },
    { subject: 'IPK',     A: (result.ipk / 4) * 100,    fullMark: 100 },
    { subject: 'MK Aman', A: result.mk_bermasalah === 0 ? 100 : Math.max(0, 100 - result.mk_bermasalah * 15), fullMark: 100 },
  ] : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Analisis Risiko Akademik</h1>
        <p className="text-slate-400 text-sm mt-1">Perhitungan menggunakan metode Logika Fuzzy Mamdani</p>
      </div>

      {/* Trigger Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-200 mb-1">Hitung Analisis Baru</p>
            <p className="text-xs text-slate-500">Pilih semester lalu klik hitung untuk menjalankan Fuzzy Mamdani</p>
          </div>
          <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
            <select
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={semester}
              onChange={e => setSemester(Number(e.target.value))}
              disabled={filledSemesters.length === 0}
            >
              {filledSemesters.length === 0 ? (
                <option value={1}>Belum ada nilai terisi</option>
              ) : (
                filledSemesters.map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))
              )}
            </select>
            <button onClick={handleAnalisis} disabled={loading || filledSemesters.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Zap size={16} />
              }
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
          <p className="text-slate-300 font-medium mb-2">Belum ada analisis risiko</p>
          <p className="text-slate-500 text-sm">Pilih semester dan klik "Hitung Analisis" untuk memulai</p>
        </div>
      ) : (
        <>
          {/* Result Header */}
          <div className={`rounded-2xl p-6 border ${
            result.kategori === 'Tinggi' ? 'border-red-500/30 bg-red-500/5' :
            result.kategori === 'Sedang' ? 'border-amber-500/30 bg-amber-500/5' :
            'border-emerald-500/30 bg-emerald-500/5'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-2">Hasil Analisis Semester {result.semester}</p>
                <RiskBadge kategori={result.kategori} large />
                <p className="text-xs text-slate-500 mt-3">{new Date(result.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="sm:ml-auto grid grid-cols-3 gap-6 text-center w-full sm:w-auto mt-4 sm:mt-0">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                  <p className="text-2xl font-bold text-slate-100">{result.ips?.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-1">IPS</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                  <p className="text-2xl font-bold text-slate-100">{result.ipk?.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-1">IPK</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                  <p className={`text-2xl font-bold ${result.mk_bermasalah > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {result.mk_bermasalah}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">MK D/E</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fuzzifikasi */}
            {fuzzyDetail && fuzzyDetail.fuzzifikasi && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
                <h3 className="font-semibold text-slate-200 mb-5 text-sm flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Fuzzifikasi Input
                </h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-slate-400 mb-2 font-medium">IPS = {result.ips?.toFixed(2)}</p>
                    <div className="space-y-1.5">
                      <MembershipBar label="Rendah" value={fuzzyDetail.fuzzifikasi.ips.rendah} color="#ef4444" />
                      <MembershipBar label="Sedang"  value={fuzzyDetail.fuzzifikasi.ips.sedang}  color="#f59e0b" />
                      <MembershipBar label="Tinggi" value={fuzzyDetail.fuzzifikasi.ips.tinggi} color="#10b981" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2 font-medium">IPK = {result.ipk?.toFixed(2)}</p>
                    <div className="space-y-1.5">
                      <MembershipBar label="Rendah" value={fuzzyDetail.fuzzifikasi.ipk.rendah} color="#ef4444" />
                      <MembershipBar label="Sedang"  value={fuzzyDetail.fuzzifikasi.ipk.sedang}  color="#f59e0b" />
                      <MembershipBar label="Tinggi" value={fuzzyDetail.fuzzifikasi.ipk.tinggi} color="#10b981" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2 font-medium">MK Bermasalah = {result.mk_bermasalah}</p>
                    <div className="space-y-1.5">
                      <MembershipBar label="Sedikit" value={fuzzyDetail.fuzzifikasi.mk.sedikit} color="#10b981" />
                      <MembershipBar label="Sedang"  value={fuzzyDetail.fuzzifikasi.mk.sedang}  color="#f59e0b" />
                      <MembershipBar label="Banyak"  value={fuzzyDetail.fuzzifikasi.mk.banyak}  color="#ef4444" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <HasilRadarChart data={radarData} kategori={result.kategori} fuzzy_output={result.fuzzy_output} />
          </div>

          {/* Rekomendasi Terstruktur */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
            <h3 className="font-semibold text-slate-200 mb-5 text-sm flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${
                result.kategori === 'Tinggi' ? 'bg-red-400' :
                result.kategori === 'Sedang' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              Rekomendasi & Rencana Aksi
            </h3>
            <RekomendasiDisplay text={result.rekomendasi} />
          </div>

          {/* Konsekuensi Jika Dibiarkan */}
          {(result.kategori === 'Tinggi' || result.kategori === 'Sedang') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
              <button
                onClick={() => setShowKonsekuensi(!showKonsekuensi)}
                className={`w-full flex items-center justify-between p-5 hover:bg-slate-800/50 transition border-l-4 ${
                  result.kategori === 'Tinggi' ? 'border-red-500' : 'border-amber-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <TriangleAlert size={18} className={result.kategori === 'Tinggi' ? 'text-red-400' : 'text-amber-400'} />
                  <span className="font-semibold text-slate-200 text-sm">Apa yang Terjadi Jika Dibiarkan?</span>
                </div>
                {showKonsekuensi
                  ? <ChevronUp size={18} className="text-slate-400" />
                  : <ChevronDown size={18} className="text-slate-400" />
                }
              </button>
              {showKonsekuensi && (
                <div className={`p-5 border-t border-slate-800 ${
                  result.kategori === 'Tinggi' ? 'bg-red-500/5' : 'bg-amber-500/5'
                }`}>
                  {result.kategori === 'Tinggi' ? (
                    <div className="space-y-3 text-sm text-slate-300">
                      <p>⚠️ Risiko <strong className="text-red-400">Drop Out (DO)</strong> meningkat jika IPK terus di bawah 2.0 hingga evaluasi akademik.</p>
                      <p>📚 Mata kuliah dengan nilai D/E <strong>harus diulang</strong>, menambah beban studi di semester mendatang.</p>
                      <p>🎓 Prasyarat MK di semester atas tidak terpenuhi jika MK dasar belum lulus — berpotensi <strong>menunda kelulusan 1-2 semester</strong>.</p>
                      <p>💼 IPK rendah dapat menghambat akses ke program magang, beasiswa, dan peluang karir pasca kampus.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm text-slate-300">
                      <p>📈 Risiko akademik bisa <strong className="text-red-400">meningkat ke kategori Tinggi</strong> jika performa tidak membaik di semester berikutnya.</p>
                      <p>📚 MK bermasalah yang tidak diperbaiki akan terus <strong>menurunkan IPK kumulatif</strong> secara bertahap.</p>
                      <p>⏱️ Perbaikan yang terlambat berpotensi <strong>memperlambat laju kelulusan</strong>.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rules Aktif */}
          {fuzzyDetail?.rules_aktif?.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
              <button
                onClick={() => setShowRules(!showRules)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/50 transition"
              >
                <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-purple-400 rounded-full" />
                  Rules Fuzzy Aktif ({fuzzyDetail.rules_aktif.length} dari 27)
                </h3>
                {showRules ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>
              {showRules && (
                <div className="border-t border-slate-800 divide-y divide-slate-800/50">
                  {fuzzyDetail.rules_aktif.map((r: any) => (
                    <div key={r.rule} className="px-5 py-3 flex items-center gap-3 text-xs hover:bg-slate-800/30 transition-colors">
                      <span className="text-slate-500 w-8 font-mono">R{r.rule}</span>
                      <span className="text-slate-400">
                        IF IPS <span className="text-blue-400 font-medium">{r.ips}</span>{' '}
                        AND IPK <span className="text-purple-400 font-medium">{r.ipk}</span>{' '}
                        AND MK <span className="text-amber-400 font-medium">{r.mk}</span>{' '}
                        →{' '}
                        <span className={`font-semibold ${r.output === 'tinggi' ? 'text-red-400' : r.output === 'sedang' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {r.output}
                        </span>
                      </span>
                      <span className="ml-auto font-mono text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md">
                        α={r.alpha}
                      </span>
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
