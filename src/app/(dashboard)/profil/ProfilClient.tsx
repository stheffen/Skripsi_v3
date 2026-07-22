"use client";

import { useState, useTransition } from "react";
import { User, Mail, Shield, GraduationCap, Calendar, FileText, Lock, Edit3, Save, X, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { updateProfile, ajukanGantiDosen } from "@/app/actions/profile";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProfilClient({ user, dosenPA, dosenList, permohonanAktif }: { user: any, dosenPA?: any, dosenList?: any[], permohonanAktif?: any }) {
  const router = useRouter();
  const { update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [isGantiDosenOpen, setIsGantiDosenOpen] = useState(false);
  const [gantiDosenForm, setGantiDosenForm] = useState({ dosen_baru_id: "", alasan: "" });

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    nim: user.nim || user.nidn || "",
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

  const handleAjukanGantiDosen = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!gantiDosenForm.dosen_baru_id || !gantiDosenForm.alasan) {
      setError("Silakan pilih dosen dan isi alasan.");
      return;
    }
    
    startTransition(async () => {
      const res = await ajukanGantiDosen(
        parseInt(user.id), 
        parseInt(gantiDosenForm.dosen_baru_id), 
        gantiDosenForm.alasan
      );
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Permohonan berhasil diajukan!");
        setIsGantiDosenOpen(false);
        router.refresh();
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
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-start justify-between gap-4 sm:col-span-2">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-0.5">Dosen PA</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                            {dosenPA ? dosenPA.name : 'Belum memilih Dosen PA'}
                          </p>
                          
                          {permohonanAktif && permohonanAktif.status === 'pending' && (
                            <div className="mt-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/50 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Menunggu persetujuan pindah ke {permohonanAktif.dosen_baru?.name}
                            </div>
                          )}
                          {permohonanAktif && permohonanAktif.status === 'ditolak' && (
                            <div className="mt-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800/50">
                              <span className="font-semibold">Ditolak:</span> {permohonanAktif.catatan_dosen || 'Tidak ada catatan'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!isGantiDosenOpen && (!permohonanAktif || permohonanAktif.status !== 'pending') && (
                        <button 
                          onClick={() => setIsGantiDosenOpen(true)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                        >
                          Ganti Dosen
                        </button>
                      )}
                    </div>
                    
                    {isGantiDosenOpen && (
                      <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Ajukan Pergantian Dosen PA</h3>
                          <button onClick={() => setIsGantiDosenOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={16} />
                          </button>
                        </div>
                        <form onSubmit={handleAjukanGantiDosen} className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Pilih Dosen PA Baru</label>
                            <select 
                              required
                              value={gantiDosenForm.dosen_baru_id}
                              onChange={(e) => setGantiDosenForm(prev => ({...prev, dosen_baru_id: e.target.value}))}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">-- Pilih Dosen --</option>
                              {dosenList?.filter(d => d.id !== dosenPA?.id).map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Alasan Pergantian</label>
                            <textarea 
                              required
                              value={gantiDosenForm.alasan}
                              onChange={(e) => setGantiDosenForm(prev => ({...prev, alasan: e.target.value}))}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                              placeholder="Tuliskan alasan Anda..."
                            />
                          </div>
                          <div className="flex justify-end">
                            <button 
                              type="submit"
                              disabled={isPending}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition disabled:opacity-50 flex items-center gap-2"
                            >
                              {isPending && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                              Ajukan Permohonan
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
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
