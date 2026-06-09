"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AlertTriangle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { registerUser } from '@/app/actions/auth';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState('mahasiswa');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('role', role);

    const res = await registerUser(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    // Auto login
    const signInRes = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (signInRes?.error) {
      setError("Login gagal setelah registrasi");
      setLoading(false);
    } else {
      router.push(role === 'dosen' ? '/dosen/dashboard' : '/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-400">EARLY WARNING</p>
            <p className="text-xs text-slate-500">Risiko Akademik</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-100 mb-1">Buat Akun</h2>
          <p className="text-slate-400 text-sm mb-6">Daftar untuk mengakses sistem</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Daftar Sebagai</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['mahasiswa', 'Mahasiswa'],
                  ['dosen', 'Dosen PA'],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRole(val)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      role === val
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Nama Lengkap</label>
                <input name="name" type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Nama lengkap" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input name="email" type="email" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="nama@email.com" required />
              </div>

              {role === 'mahasiswa' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">NIM</label>
                    <input name="nim" type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Nomor Induk Mahasiswa" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Angkatan</label>
                    <input name="angkatan" type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Contoh: 2022" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Semester Aktif</label>
                    <select name="semester_aktif" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      {Array.from({ length: 14 }, (_, i) => i + 1).map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">No. HP (opsional)</label>
                    <input name="phone" type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="08xxxxxxxxxx" />
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input name="password" type={showPass ? 'text' : 'password'} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pr-12 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Minimal 8 karakter" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Konfirmasi Password</label>
                <input name="password_confirmation" type={showPass ? 'text' : 'password'} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Ulangi password" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><UserPlus size={18} /> Daftar Sekarang</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
