"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, BookOpen, BarChart3, History,
  FlaskConical, User, LogOut, GraduationCap, Users, X, AlertTriangle
} from 'lucide-react';
import { useState } from 'react';

const mahasiswaNav = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/input-nilai', icon: BookOpen,        label: 'Input Nilai' },
  { to: '/hasil-analisis', icon: BarChart3,     label: 'Hasil Analisis' },
  { to: '/riwayat-analisis', icon: History,     label: 'Riwayat Analisis' },
  { to: '/profil',     icon: User,            label: 'Profil' },
];

const dosenNav = [
  { to: '/dosen/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dosen/mahasiswa', icon: Users,           label: 'Mahasiswa' },
  { to: '/dosen/profil',    icon: User,            label: 'Profil' },
];

export default function Sidebar({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const router = useRouter();

  const navItems = user?.role === 'dosen' ? dosenNav : mahasiswaNav;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <>
      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30
        bg-slate-900 border-r border-slate-800
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-400 leading-none">EARLY WARNING</p>
              <p className="text-xs text-slate-500 mt-0.5">Risiko Akademik</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">{user?.name || 'Loading...'}</p>
              <p className="text-xs text-slate-500 truncate">
                {user?.role === 'dosen' ? 'Dosen Pembimbing' : `NIM: ${user?.nim || '-'}`}
              </p>
            </div>
          </div>
          {user?.role === 'mahasiswa' && (
            <div className="mt-2 flex items-center gap-1.5">
              <GraduationCap size={12} className="text-blue-400" />
              <span className="text-xs text-slate-400">Semester {user?.semester_aktif || '-'}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = pathname === to || pathname?.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                href={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
