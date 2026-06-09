import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Mail, Shield, FileText } from 'lucide-react';

export default async function DosenProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'dosen') {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Profil Pengguna</h1>
        <p className="text-slate-400 text-sm mt-1">Informasi detail akun Anda</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8 relative">
          {/* Avatar */}
          <div className="flex justify-between items-end -mt-12 mb-6 relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center shadow-xl">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">
              {user.role}
            </span>
          </div>

          <div className="space-y-1 mb-8">
            <h2 className="text-2xl font-bold text-slate-100">{user.name}</h2>
            <p className="text-slate-400 flex items-center gap-2">
              <Mail size={14} /> {user.email}
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 text-indigo-400">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">NIDN</p>
                <p className="text-sm font-semibold text-slate-200">{user.nim || (user as any).nidn || '-'}</p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-400">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">Status Akun</p>
                <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Aktif
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
