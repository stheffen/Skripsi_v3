"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';

export default function HasilRadarChart({ data, kategori, fuzzy_output }: { data: any[], kategori: string, fuzzy_output: number }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
      <h3 className="font-semibold text-slate-200 mb-5 text-sm flex items-center gap-2">
        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" /> Defuzzifikasi Output
      </h3>
      <div className="text-center py-2 relative">
        <svg viewBox="0 0 200 120" className="w-48 mx-auto drop-shadow-lg">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none"
            stroke={kategori === 'Tinggi' ? '#ef4444' : kategori === 'Sedang' ? '#f59e0b' : '#10b981'}
            strokeWidth="18" strokeLinecap="round"
            strokeDasharray="251.3"
            strokeDashoffset={251.3 - ((fuzzy_output || 0) / 100) * 251.3} />
          <text x="100" y="85" textAnchor="middle" fontSize="24" fontWeight="bold"
            fill={kategori === 'Tinggi' ? '#ef4444' : kategori === 'Sedang' ? '#f59e0b' : '#10b981'}>
            {fuzzy_output?.toFixed(1)}
          </text>
          <text x="100" y="105" textAnchor="middle" fontSize="10" fill="#64748b">Crisp Output</text>
        </svg>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <RadarChart data={data}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <Radar dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
          <Tooltip formatter={(v: any) => `${v.toFixed(1)}%`} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
