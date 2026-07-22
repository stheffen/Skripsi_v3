"use client";

import Link from "next/link";
import {
  TrendingUp,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Activity,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import dynamic from "next/dynamic";

const DashboardTrenIpsChart = dynamic(
  () => import("@/components/charts/DashboardTrenIpsChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] w-full flex items-center justify-center text-slate-500 text-sm animate-pulse">
        Memuat grafik...
      </div>
    ),
  },
);

function RiskBadge({ kategori }: { kategori: string | null | undefined }) {
  if (!kategori || kategori === "Belum Dianalisis") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        Belum Dianalisis
      </span>
    );
  }
  const colorClass =
    kategori === "Tinggi"
      ? "bg-risk-tinggi/10 text-risk-tinggi border border-risk-tinggi/20 dark:bg-transparent dark:text-risk-tinggi dark:border-risk-tinggi/50 dark:shadow-[0_0_10px_var(--color-risk-tinggi)]"
      : kategori === "Sedang"
        ? "bg-risk-sedang/10 text-risk-sedang border border-risk-sedang/20 dark:bg-transparent dark:text-risk-sedang dark:border-risk-sedang/50 dark:shadow-[0_0_10px_var(--color-risk-sedang)]"
        : "bg-risk-rendah/10 text-risk-rendah border border-risk-rendah/20 dark:bg-transparent dark:text-risk-rendah dark:border-risk-rendah/50 dark:shadow-[0_0_10px_var(--color-risk-rendah)]";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorClass}`}
    >
      {kategori}
    </span>
  );
}

function RiskGauge({ value, kategori }: { value: number; kategori: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    kategori === "Tinggi"
      ? "var(--color-risk-tinggi)"
      : kategori === "Sedang"
        ? "var(--color-risk-sedang)"
        : "var(--color-risk-rendah)";
  const angle = (pct / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-48">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#1e293b"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray="251.3"
          strokeDashoffset={251.3 - (pct / 100) * 251.3}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <line
          x1="100"
          y1="100"
          x2={100 + 65 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={100 + 65 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ transition: "all 1s ease" }}
        />
        <circle cx="100" cy="100" r="6" fill={color} />
        <text x="20" y="108" textAnchor="middle" fontSize="9" fill="#64748b">
          0
        </text>
        <text x="180" y="108" textAnchor="middle" fontSize="9" fill="#64748b">
          100
        </text>
      </svg>
      <div className="text-center -mt-2">
        <p className="text-3xl font-bold" style={{ color }}>
          {value.toFixed(1)}
        </p>
        <p className="text-xs text-slate-500 mt-1">Nilai Fuzzy Output</p>
      </div>
    </div>
  );
}

export default function DashboardClient({
  user,
  data,
}: {
  user: any;
  data: any;
}) {
  const { akademik, risiko, tren_ips } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Halo, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Semester {user?.semester_aktif}
            {user?.angkatan && ` — Angkatan ${user.angkatan}`}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              IPK
            </p>
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp
                size={16}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {akademik?.ipk?.toFixed(2) ?? "-"}
          </p>
          <p className="text-xs text-slate-500 mt-1">dari 4.00</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              IPS {user?.semester_aktif}
            </p>
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Activity
                size={16}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {akademik?.ips?.toFixed(2) ?? "-"}
          </p>
          <p className="text-xs text-slate-500 mt-1">dari 4.00</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              MK Bermasalah
            </p>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                (akademik.total_mk_d_e ?? akademik.mk_bermasalah) > 0
                  ? "bg-red-500/20"
                  : "bg-emerald-500/20"
              }`}
            >
              {(akademik.total_mk_d_e ?? akademik.mk_bermasalah) > 0 ? (
                <AlertTriangle
                  size={16}
                  className="text-red-600 dark:text-red-400"
                />
              ) : (
                <CheckCircle
                  size={16}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              )}
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {akademik.total_mk_d_e ?? akademik.mk_bermasalah}
          </p>
          <p className="text-xs text-slate-500 mt-1">nilai D / E</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total SKS Lulus
            </p>
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <BookOpen
                size={16}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {akademik.total_sks_lulus}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            dari {akademik.total_sks_tempuh} SKS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge Risiko */}
        <div
          className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm
          ${risiko?.kategori === "Tinggi" ? "dark:shadow-[0_0_20px_var(--color-risk-tinggi)] dark:border-risk-tinggi/30 border-l-4 border-l-risk-tinggi" : ""}
          ${risiko?.kategori === "Sedang" ? "dark:shadow-[0_0_20px_var(--color-risk-sedang)] dark:border-risk-sedang/30 border-l-4 border-l-risk-sedang" : ""}
          ${risiko?.kategori === "Rendah" || risiko?.kategori === "Aman" ? "dark:shadow-[0_0_20px_var(--color-risk-rendah)] dark:border-risk-rendah/30 border-l-4 border-l-risk-rendah" : ""}
        `}
        >
          <div className="flex items-center justify-between w-full mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-200">
              Status Risiko
            </h3>
            <Link
              href="/hasil-analisis"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Detail <ArrowRight size={12} />
            </Link>
          </div>
          {risiko ? (
            <>
              <RiskGauge
                value={risiko.fuzzy_output}
                kategori={risiko.kategori}
              />
              <div className="mt-4 text-center">
                <RiskBadge kategori={risiko.kategori} />
                <p className="text-xs text-slate-500 mt-2">
                  Analisis Semester {risiko.semester} · {risiko.tanggal}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <BarChart3 size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                Belum ada analisis risiko
              </p>
              <Link
                href="/hasil-analisis"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm"
              >
                Mulai Analisis
              </Link>
            </div>
          )}
        </div>

        {/* Tren IPS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:col-span-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-200">
              Tren IPS per Semester
            </h3>
            <Link
              href="/riwayat-analisis"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Riwayat <ArrowRight size={12} />
            </Link>
          </div>
          <DashboardTrenIpsChart data={tren_ips} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            href: "/registrasi-mk",
            icon: BookOpen,
            title: "Registrasi & Input MK",
            desc: "Kelola KRS dan nilai mata kuliah",
            color: "from-blue-600 to-blue-800",
          },
          {
            href: "/hasil-analisis",
            icon: BarChart3,
            title: "Analisis Risiko",
            desc: "Hitung status risiko akademik",
            color: "from-purple-600 to-purple-800",
          },
        ].map(({ href, icon: Icon, title, desc, color }) => (
          <Link
            key={href}
            href={href}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-4 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 group cursor-pointer shadow-sm"
          >
            <div
              className={`w-12 h-12 bg-linear-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-200 text-sm group-hover:text-blue-600 dark:group-hover:text-white transition-colors">
                {title}
              </p>
              <p className="text-xs text-slate-500 mt-1">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
