"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function RiwayatLineChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-slate-500 dark:fill-slate-400" />
        <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-slate-500 dark:fill-slate-400" />
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: 8, fontSize: 11, color: 'var(--tooltip-color)' }}
          formatter={(v: any, name: any) => [v?.toFixed(2), name]}
        />
        <Line type="monotone" dataKey="IPS" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, className: 'stroke-white dark:stroke-slate-900' }} />
        <Line type="monotone" dataKey="IPK" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4, strokeWidth: 2, className: 'stroke-white dark:stroke-slate-900' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
