"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertTriangle, Eye, EyeOff, LogIn, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email({ message: "Format email tidak valid" }),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError("");

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("Login gagal. Periksa email dan password.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans selection:bg-blue-500/30">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="p-12 flex-1 flex flex-col justify-center relative z-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20">
            <AlertTriangle size={32} className="text-white" />
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            EWS
            <br />
            <span className="text-2xl text-slate-500 dark:text-slate-400 font-medium">
              Early Warning System
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-lg mb-12 leading-relaxed max-w-md">
            Deteksi dini profil risiko akademik mahasiswa menggunakan ketepatan{" "}
            <strong className="text-slate-900 dark:text-white font-semibold">
              Logika Fuzzy Mamdani
            </strong>
            .
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                <span className="text-lg font-bold text-blue-600">52</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Mata Kuliah
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Terintegrasi dalam sistem
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                <span className="text-lg font-bold text-blue-600">27</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Fuzzy Rules
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Parameter defuzzifikasi akurat
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Glow behind form in dark mode */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl hidden dark:block" />

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Akademik<span className="text-blue-600">Pro</span>
              </p>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-white dark:border-slate-800 p-8 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Selamat Datang
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Silakan masuk menggunakan kredensial Anda
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle size={18} className="shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider"
                >
                  Alamat Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-blue-500 rounded-xl transition-all ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="mahasiswa@kampus.ac.id"
                />
                {errors.email && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider"
                  >
                    Kata Sandi
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    {...register("password")}
                    className={`h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 pr-12 text-slate-900 dark:text-white focus-visible:ring-blue-500 rounded-xl transition-all ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] mt-2 group font-semibold text-base"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Masuk ke Sistem
                    <ChevronRight
                      size={18}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            Belum terdaftar dalam sistem?{" "}
            <Link
              href="/register"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Buat akun baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
