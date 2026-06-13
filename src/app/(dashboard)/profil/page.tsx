import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Mail, Shield, GraduationCap, Calendar, FileText } from 'lucide-react';

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profil Pengguna</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Informasi detail akun Anda</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl dark:shadow-none">
        {/* Header Cover */}
        <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-600 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8 relative">
          {/* Avatar */}
          <div className="flex justify-between items-end -mt-12 mb-6 relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-xl">
              <div className="w-full h-full rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm dark:shadow-none">
              {user.role}
            </span>
          </div>

          <div className="space-y-1 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Mail size={14} /> {user.email}
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">Nomor Induk</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{user.nim || (user as any).nidn || '-'}</p>
              </div>
            </div>

            {user.role === 'mahasiswa' && (
              <>

                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-0.5">Angkatan</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{(user as any).angkatan || '-'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-0.5">Semester Aktif</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">Semester {user.semester_aktif || '-'}</p>
                  </div>
                </div>
              </>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">Status Akun</p>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" /> Aktif
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
