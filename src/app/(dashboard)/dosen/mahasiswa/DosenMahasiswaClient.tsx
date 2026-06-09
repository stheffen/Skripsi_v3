"use client";

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, TrendingDown, BookX, BookOpen, GraduationCap, ChevronRight } from 'lucide-react';

function RiskBadge({ kategori }: { kategori: string }) {
  const map: Record<string, any> = {
    'Rendah': { cls: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', icon: CheckCircle },
    'Sedang': { cls: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', icon: AlertTriangle },
    'Tinggi': { cls: 'bg-red-500/20 text-red-400 border border-red-500/30', icon: TrendingDown },
    'Belum Dianalisis': { cls: 'bg-slate-800 text-slate-400 border border-slate-700', icon: BookOpen },
  };
  const { cls, icon: Icon } = map[kategori] || map['Rendah'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <Icon size={12} />
      {kategori}
    </span>
  );
}

export default function DosenMahasiswaClient({ mahasiswaList }: { mahasiswaList: any[] }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = mahasiswaList.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.nim?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Daftar Mahasiswa Bimbingan</h1>
        <p className="text-slate-400 text-sm mt-1">Pantau perkembangan akademik mahasiswa</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <Search size={18} className="text-slate-500 ml-2" />
        <input 
          type="text"
          placeholder="Cari nama atau NIM mahasiswa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-slate-200 w-full text-sm placeholder:text-slate-600 focus:ring-0"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-slate-400 font-medium">Mahasiswa tidak ditemukan</p>
          </div>
        ) : (
          filtered.map((m, idx) => (
            <div key={m.id} className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 ${
              m.risiko === 'Tinggi' ? 'border-red-500/30' :
              m.risiko === 'Sedang' ? 'border-amber-500/30' :
              m.risiko === 'Rendah' ? 'border-emerald-500/30' : 'border-slate-800'
            }`}>
              <button
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                className="w-full flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-slate-800/30 transition text-left"
              >
                <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-slate-200 truncate">{m.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500 font-mono">{m.nim || '-'}</span>
                      <span className="text-slate-700">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><GraduationCap size={12}/> Sem {m.semester_aktif}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto sm:ml-auto mt-4 sm:mt-0 gap-6">
                  <RiskBadge kategori={m.risiko} />
                  
                  <div className="hidden md:flex items-center gap-6 text-center">
                    <div>
                      <p className="text-sm font-bold text-slate-200">{m.ips?.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">IPS</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">{m.ipk?.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">IPK</p>
                    </div>
                    <div className="w-12">
                      <p className={`text-sm font-bold ${m.mk_bermasalah > 0 ? 'text-red-400' : 'text-slate-200'}`}>{m.mk_bermasalah}</p>
                      <p className="text-xs text-slate-500 mt-0.5">MK D/E</p>
                    </div>
                  </div>

                  {expanded === m.id
                    ? <ChevronDown size={20} className="text-slate-400 flex-shrink-0" />
                    : <ChevronRight size={20} className="text-slate-400 flex-shrink-0" />
                  }
                </div>
              </button>

              {expanded === m.id && (
                <div className="border-t border-slate-800 p-5 bg-slate-900/50">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 md:hidden">
                     {/* Tampilkan stats untuk mobile karena di hidden di header */}
                     <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-800/80">
                        <p className="text-lg font-bold text-slate-200">{m.ips?.toFixed(2)}</p>
                        <p className="text-xs text-slate-500 mt-1">IPS Terakhir</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-800/80">
                        <p className="text-lg font-bold text-slate-200">{m.ipk?.toFixed(2)}</p>
                        <p className="text-xs text-slate-500 mt-1">IPK Kumulatif</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-800/80">
                        <p className={`text-lg font-bold ${m.mk_bermasalah > 0 ? 'text-red-400' : 'text-slate-200'}`}>{m.mk_bermasalah}</p>
                        <p className="text-xs text-slate-500 mt-1">MK Bermasalah</p>
                      </div>
                  </div>
                  <div className="text-center p-6 bg-slate-800/30 rounded-xl border border-slate-800">
                    <p className="text-slate-300 text-sm">Fitur Detail Mahasiswa untuk Dosen belum diimplementasi di prototype ini.</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
