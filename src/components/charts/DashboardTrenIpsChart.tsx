"use client";

import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs shadow-xl">
        <p className="text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className="text-blue-600 dark:text-blue-400 font-bold">IPS: {payload[0]?.value}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardTrenIpsChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Belum ada data nilai untuk ditampilkan</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="ipsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
        <XAxis dataKey="semester" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} className="fill-slate-500 dark:fill-slate-400" />
        <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} className="fill-slate-500 dark:fill-slate-400" />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--tooltip-border)', strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area type="monotone" dataKey="ips" stroke="#3b82f6" strokeWidth={3}
          fill="url(#ipsGrad)" dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, className: 'stroke-white dark:stroke-slate-900' }} activeDot={{ r: 7 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
