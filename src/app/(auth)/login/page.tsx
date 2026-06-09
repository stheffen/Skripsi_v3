"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AlertTriangle, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        // NextAuth will handle the session. We just need to navigate to dashboard
        router.push('/dashboard'); // We can conditionally route later based on session
        router.refresh();
      }
    } catch (err: any) {
      setError('Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30">
            <AlertTriangle size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
            Sistem Early Warning<br />
            <span className="text-blue-400">Risiko Akademik</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Deteksi dini risiko akademik mahasiswa menggunakan metode <strong className="text-blue-300">Logika Fuzzy Mamdani</strong> untuk pengambilan keputusan yang lebih baik.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[['52', 'Mata Kuliah'], ['27', 'Fuzzy Rules'], ['14', 'Semester']].map(([val, label]) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-blue-400">{val}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-400">EARLY WARNING</p>
              <p className="text-xs text-slate-500">Risiko Akademik</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-100 mb-1">Selamat Datang</h2>
          <p className="text-slate-400 text-sm mb-8">Masuk untuk melanjutkan ke sistem</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                name="email"
                type="email"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="nama@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pr-12 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Masuk
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Daftar sekarang
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <p className="text-xs font-semibold text-slate-400 mb-2">🔑 Akun Demo:</p>
            <div className="space-y-1 text-xs text-slate-500">
              <p>Mahasiswa: <span className="text-slate-300">mahasiswa@demo.com</span></p>
              <p>Dosen: <span className="text-slate-300">dosen@demo.com</span></p>
              <p>Password: <span className="text-slate-300">password</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
