"use client";

import { useState, useTransition } from "react";
import { User, Mail, Shield, GraduationCap, Calendar, FileText, Phone, Lock, Edit3, Save, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { updateProfile } from "@/app/actions/profile";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProfilClient({ user }: { user: any }) {
  const router = useRouter();
  const { update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    nim: user.nim || user.nidn || "",
    phone: user.phone || "",
    angkatan: (user as any).angkatan || "",
    semester_aktif: user.semester_aktif || 1,
    password: "",
  });

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      nim: user.nim || user.nidn || "",
      phone: user.phone || "",
      angkatan: (user as any).angkatan || "",
      semester_aktif: user.semester_aktif || 1,
      password: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "semester_aktif" ? parseInt(value) || 1 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email) {
      setError("Nama dan Email wajib diisi.");
      return;
    }

    startTransition(async () => {
      const res = await updateProfile(user.id, formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Profil berhasil diperbarui!");
        await update(); // Update JWT session
        setTimeout(() => {
          setIsEditing(false);
          setSuccess("");
          router.refresh();
        }, 1500);
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profil Pengguna</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Informasi detail akun Anda</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-sm"
          >
            <Edit3 size={16} /> Edit Profil
          </button>
        )}
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
              <CheckCircle size={18} /> {success}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 transition"
                    required
                  />
                </div>
                {user.role === 'mahasiswa' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nomor Induk (NIM)</label>
                      <input
                        type="text"
                        name="nim"
                        value={formData.nim}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nomor Telepon</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 transition"
                      />
                    </div>
                  </>
                )}
                
                {user.role === 'mahasiswa' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Angkatan</label>
                      <input
                        type="text"
                        name="angkatan"
                        value={formData.angkatan}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Semester Aktif (Dihitung Otomatis dari Angkatan)</label>
                      <input
                        type="number"
                        name="semester_aktif"
                        value={formData.semester_aktif}
                        disabled
                        className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-slate-400 opacity-70 cursor-not-allowed transition"
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password Baru (Biarkan kosong jika tidak ingin mengubah)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  {isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-1 mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Mail size={14} /> {user.email}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.role === 'mahasiswa' && (
                  <>
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-0.5">Nomor Induk</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{user.nim || '-'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center flex-shrink-0 text-rose-600 dark:text-rose-400">
                        <Phone size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-0.5">Nomor Telepon</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{user.phone || '-'}</p>
                      </div>
                    </div>
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
                        <GraduationCap size={20} />
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
