"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  History,
  FlaskConical,
  User,
  LogOut,
  GraduationCap,
  Users,
  X,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";

const mahasiswaNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/registrasi-mk", icon: ClipboardList, label: "Registrasi MK" },
  { to: "/input-nilai", icon: BookOpen, label: "Lihat Nilai" },
  { to: "/hasil-analisis", icon: BarChart3, label: "Hasil Analisis" },
  { to: "/riwayat-analisis", icon: History, label: "Riwayat Analisis" },
  { to: "/profil", icon: User, label: "Profil" },
];

const dosenNav = [
  { to: "/dosen/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dosen/mahasiswa", icon: Users, label: "Mahasiswa" },
  { to: "/dosen/profil", icon: User, label: "Profil" },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = user?.role === "dosen" ? dosenNav : mahasiswaNav;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <>
      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
            <GraduationCap className="text-white" size={20} />
          </div>
          <span className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">
            EWS
          </span>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user?.name || "Loading..."}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.role === "dosen"
                  ? "Dosen Pembimbing"
                  : `NIM: ${user?.nim || "-"}`}
              </p>
            </div>
          </div>
          {user?.role === "mahasiswa" && (
            <div className="mt-2 flex items-center gap-1.5">
              <GraduationCap size={12} className="text-blue-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Semester {user?.semester_aktif || "-"}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
                  }
                `}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors group"
          >
            <LogOut
              size={18}
              className="text-red-500/70 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
            />
            Keluar
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mb-4">
                <LogOut size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Konfirmasi Keluar
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Apakah Anda yakin ingin keluar dari aplikasi? Sesi Anda akan
                diakhiri.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition shadow-lg shadow-red-500/20"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
