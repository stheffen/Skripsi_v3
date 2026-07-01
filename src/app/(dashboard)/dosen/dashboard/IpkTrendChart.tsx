"use client";

import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface IpkTrendChartProps {
  data: any[];
}

const colors = [
  '#2563eb', // blue-600
  '#dc2626', // red-600
  '#16a34a', // green-600
  '#d97706', // amber-600
  '#9333ea', // purple-600
  '#0891b2', // cyan-600
  '#4f46e5', // indigo-600
  '#be123c', // rose-600
  '#15803d', // green-700
  '#ea580c', // orange-600
];

export default function IpkTrendChart({ data }: IpkTrendChartProps) {
  // Extract all student names from the data keys
  const studentNames = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Use a Set to collect all unique keys across all semesters
    const keys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'semester') {
          keys.add(key);
        }
      });
    });
    return Array.from(keys);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <TrendingUp size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
        <p className="text-slate-500">Belum ada data riwayat IPK</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" /> 
          Grafik Prestasi IPK Semester
        </h3>
        <p className="text-sm text-slate-500 mt-1">Pergerakan Indeks Prestasi Kumulatif masing-masing mahasiswa bimbingan</p>
      </div>
      
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis 
              dataKey="semester" 
              stroke="#64748b" 
              fontSize={12}
              tickMargin={10}
            />
            <YAxis 
              domain={[0, 4]} 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(val) => val.toFixed(2)}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            {studentNames.map((name, index) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
