"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getRiwayatAnalisis } from '@/app/actions/analisis';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const [themeClass, setThemeClass] = useState("theme-aman"); // Default theme

  useEffect(() => {
    if (user?.id) {
      getRiwayatAnalisis(parseInt(user.id)).then(res => {
        if (res.data && res.data.length > 0) {
          const latest = res.data[0];
          if (latest.kategori === 'Tinggi') setThemeClass('theme-bahaya');
          else if (latest.kategori === 'Sedang') setThemeClass('theme-sedang');
          else setThemeClass('theme-aman');
        }
      });
    }
  }, [user?.id]);

  return (
    <div className={`flex h-screen overflow-hidden bg-slate-950 ${themeClass}`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="h-14 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center px-4 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-100">{user?.name || 'Loading...'}</p>
              <p className="text-xs text-slate-400 font-medium capitalize">{user?.role === 'dosen' ? 'Dosen Pembimbing' : 'Mahasiswa'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
