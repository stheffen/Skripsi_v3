"use client";

import React from 'react';
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

interface IpsTrendChartProps {
  data: any[]; // Expected format: [{ semester: 'Semester 1', ips: 3.5 }, ...]
  studentName?: string;
}

export default function IpsTrendChart({ data, studentName = 'Mahasiswa' }: IpsTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <TrendingUp size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
        <p className="text-slate-500">Belum ada riwayat IPS</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mt-6">
      <div className="mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" /> 
          Grafik Tren IPS (Indeks Prestasi Semester)
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Pergerakan IPS {studentName} dari semester ke semester
        </p>
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
            
            <Line
              name="IPS"
              type="monotone"
              dataKey="ips"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
