"use client";

import { useState } from 'react';
import { History, AlertTriangle, CheckCircle, TrendingDown, ChevronRight, ChevronDown, BookX } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function RiskBadge({ kategori }: { kategori: string }) {
  const map: Record<string, any> = {
    'Rendah': { cls: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', icon: CheckCircle },
    'Sedang': { cls: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', icon: AlertTriangle },
    'Tinggi': { cls: 'bg-red-500/20 text-red-400 border border-red-500/30', icon: TrendingDown },
  };
  const { cls, icon: Icon } = map[kategori] || map['Rendah'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon size={12} />
      {kategori}
    </span>
  );
}

function RiskColor(kategori: string) {
  return kategori === 'Tinggi' ? '#ef4444' : kategori === 'Sedang' ? '#f59e0b' : '#10b981';
}

function MKBermasalahTable({ mkDetail }: { mkDetail: any[] }) {
  if (!mkDetail || mkDetail.length === 0) return (
    <p className="text-xs text-slate-500 italic">Tidak ada mata kuliah bermasalah 🎉</p>
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-800/80">
            <th className="text-left px-3 py-2 text-slate-400 font-medium">MK</th>
            <th className="text-center px-3 py-2 text-slate-400 font-medium">Nilai</th>
            <th className="text-center px-3 py-2 text-slate-400 font-medium">SKS</th>
            <th className="text-center px-3 py-2 text-slate-400 font-medium">Sem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {mkDetail.map((mk: any, i: number) => (
            <tr key={i} className="hover:bg-slate-800/30 transition">
              <td className="px-3 py-2 text-slate-300 max-w-[160px] truncate" title={mk.nama}>
                <span className="text-slate-500 font-mono mr-1">{mk.kode}</span>{mk.nama}
              </td>
              <td className="px-3 py-2 text-center">
                <span className={`font-bold px-2 py-0.5 rounded ${
                  mk.nilai === 'E' ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'
                }`}>{mk.nilai}</span>
              </td>
              <td className="px-3 py-2 text-center text-slate-400">{mk.sks}</td>
              <td className="px-3 py-2 text-center text-slate-500">{mk.semester}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RekomendasiRingkas({ text, expanded }: { text: string, expanded: boolean }) {
  if (!text) return null;
  const lines = text.split('\n').filter(Boolean);

  if (!expanded) {
    return (
      <div className="space-y-1">
        {lines.slice(0, 4).map((line, i) => (
          <p key={i} className="text-xs text-slate-400 leading-relaxed">{line}</p>
        ))}
        {lines.length > 4 && (
          <p className="text-xs text-slate-600 italic">... dan {lines.length - 4} baris lagi</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
      {lines.map((line, i) => (
        <p key={i} className={`text-xs leading-relaxed ${
          line.includes('STATUS') ? 'font-semibold text-slate-300' : 'text-slate-400'
        }`}>{line}</p>
      ))}
    </div>
  );
}

export default function RiwayatAnalisisClient({ riwayatData }: { riwayatData: any[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showFullRek, setShowFullRek] = useState<Record<number, boolean>>({});

  const riwayat = riwayatData.map(item => {
    let parsedDetail = {};
    try {
      parsedDetail = JSON.parse(item.detail_fuzzy);
    } catch(e) {}
    return {
      ...item,
      mk_bermasalah_detail: (parsedDetail as any)?.input?.mkDetail || [],
    };
  });

  const trendData = [...riwayat]
    .reverse()
    .map((item, i) => ({
      name: `Sem ${item.semester}`,
      idx: i + 1,
      IPS: item.ips,
      IPK: item.ipk,
      kategori: item.kategori,
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Riwayat Analisis Risiko</h1>
        <p className="text-slate-400 text-sm mt-1">{riwayat.length} analisis tersimpan</p>
      </div>

      {riwayat.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <History size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-300 font-medium mb-2">Belum ada riwayat analisis</p>
          <p className="text-slate-500 text-sm mb-4">Lakukan analisis risiko terlebih dahulu</p>
          <Link href="/hasil-analisis" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm">
            Mulai Analisis
          </Link>
        </div>
      ) : (
        <>
          {/* Trend Chart */}
          {trendData.length > 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
              <h3 className="font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                Tren IPS & IPK
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 4]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }}
                    formatter={(v: any, name: any) => [v?.toFixed(2), name]}
                  />
                  <Line type="monotone" dataKey="IPS" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#0f172a' }} />
                  <Line type="monotone" dataKey="IPK" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#0f172a' }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-3 justify-center">
                <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <div className="w-3 h-1 bg-blue-500 rounded" /> IPS
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <div className="w-3 h-1 bg-emerald-500 rounded" /> IPK
                </span>
              </div>
            </div>
          )}

          {/* Daftar Riwayat */}
          <div className="space-y-3">
            {riwayat.map((item, idx) => (
              <div key={item.id} className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 ${
                item.kategori === 'Tinggi' ? 'border-red-500/30 hover:border-red-500/50' :
                item.kategori === 'Sedang' ? 'border-amber-500/30 hover:border-amber-500/50' : 'border-emerald-500/30 hover:border-emerald-500/50'
              }`}>
                <button
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-slate-800/30 transition text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400 flex-shrink-0">
                    {riwayat.length - idx}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-200">
                        Analisis Semester {item.semester}
                      </span>
                      <RiskBadge kategori={item.kategori} />
                      {item.mk_bermasalah > 0 && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                          <BookX size={12} />
                          {item.mk_bermasalah} MK D/E
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{new Date(item.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-center mr-4">
                    <div>
                      <p className="text-sm font-bold text-slate-200">{item.ips?.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">IPS</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">{item.ipk?.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">IPK</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: RiskColor(item.kategori) }}>
                        {item.fuzzy_output?.toFixed(1)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Fuzzy</p>
                    </div>
                  </div>
                  {expanded === item.id
                    ? <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                    : <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />
                  }
                </button>

                {expanded === item.id && (
                  <div className="border-t border-slate-800 p-5 space-y-6 bg-slate-900/50">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        ['MK Bermasalah', item.mk_bermasalah, item.mk_bermasalah > 0 ? 'text-red-400' : 'text-emerald-400'],
                        ['SKS Tempuh',    item.total_sks_tempuh,    'text-slate-200'],
                        ['SKS Lulus',     item.total_sks_lulus,     'text-slate-200'],
                        ['Fuzzy Output',  item.fuzzy_output?.toFixed(2), `font-bold`],
                      ].map(([label, val, cls]) => (
                        <div key={label} className="bg-slate-800/50 rounded-xl p-4 border border-slate-800/80">
                          <p className={`text-xl font-bold ${cls}`} style={label === 'Fuzzy Output' ? { color: RiskColor(item.kategori) } : {}}>
                            {val || '-'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Tabel MK Bermasalah */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
                        <BookX size={14} /> Mata Kuliah Bermasalah saat ini:
                      </p>
                      <MKBermasalahTable mkDetail={item.mk_bermasalah_detail} />
                    </div>

                    {/* Rekomendasi */}
                    <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-slate-400">💡 Rekomendasi:</p>
                        <button
                          onClick={() => setShowFullRek(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
                        >
                          {showFullRek[item.id] ? 'Sembunyikan' : 'Tampilkan Semua'}
                        </button>
                      </div>
                      <RekomendasiRingkas text={item.rekomendasi} expanded={showFullRek[item.id]} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
