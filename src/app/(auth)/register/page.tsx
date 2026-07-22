"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertTriangle, Eye, EyeOff, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerUser, getDosenList } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const registerSchema = z
  .object({
    role: z.literal("mahasiswa"),
    name: z.string().min(1, "Nama wajib diisi"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email({ message: "Format email tidak valid" }),
    password: z.string().min(8, "Password minimal 8 karakter"),
    password_confirmation: z.string().min(1, "Konfirmasi password wajib diisi"),
    nim: z.string().min(1, "NIM wajib diisi"),
    angkatan: z.string().min(1, "Angkatan wajib diisi"),
    dosen_id: z.string().min(1, "Dosen PA wajib dipilih"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Password tidak cocok",
    path: ["password_confirmation"],
  });
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [dosenList, setDosenList] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    getDosenList().then((res) => {
      if (res.data) setDosenList(res.data);
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "mahasiswa",
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      nim: "",
      angkatan: "",
      dosen_id: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError("");

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });

    try {
      const res = await registerUser(formData);

      if (res.error) {
        setError(res.error);
        return;
      }

      // Auto login
      const signInRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Login gagal setelah registrasi");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem saat mendaftar");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans selection:bg-blue-500/30">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <AlertTriangle size={24} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Akademik<span className="text-blue-600">Pro</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Risiko Akademik & EWS</p>
          </div>
        </div>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Buat Akun</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Daftar untuk mengakses sistem
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle size={18} className="shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className={`h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-blue-500 rounded-xl transition-all ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Nama lengkap"
                />
                {errors.name && (
                  <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-blue-500 rounded-xl transition-all ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="nama@email.com"
                />
                {errors.email && (
                  <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
                )}
              </div>

                  <div className="space-y-2">
                    <Label htmlFor="nim" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                      NIM
                    </Label>
                    <Input
                      id="nim"
                      {...register("nim")}
                      className={`h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-blue-500 rounded-xl transition-all ${errors.nim ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      placeholder="Nomor Induk Mahasiswa"
                    />
                    {errors.nim && (
                      <p className="text-xs font-medium text-red-500">
                        {errors.nim.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="angkatan" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                      Angkatan
                    </Label>
                    <Input
                      id="angkatan"
                      {...register("angkatan")}
                      className={`h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-blue-500 rounded-xl transition-all ${errors.angkatan ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      placeholder="Contoh: 2022"
                    />
                    {errors.angkatan && (
                      <p className="text-xs font-medium text-red-500">
                        {errors.angkatan.message}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="dosen_id" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                      Dosen Pembimbing Akademik (PA)
                    </Label>
                    <select
                      id="dosen_id"
                      {...register("dosen_id")}
                      className={`w-full h-12 px-3 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-blue-500 rounded-xl transition-all ${errors.dosen_id ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    >
                      <option value="">-- Pilih Dosen PA --</option>
                      {dosenList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    {errors.dosen_id && (
                      <p className="text-xs font-medium text-red-500">
                        {errors.dosen_id.message}
                      </p>
                    )}
                  </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    {...register("password")}
                    className={`h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 pr-12 text-slate-900 dark:text-white focus-visible:ring-blue-500 rounded-xl transition-all ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    placeholder="Minimal 8 karakter"
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
              <div className="sm:col-span-2 space-y-2">
                <Label
                  htmlFor="password_confirmation"
                  className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider"
                >
                  Konfirmasi Password
                </Label>
                <Input
                  id="password_confirmation"
                  type={showPass ? "text" : "password"}
                  {...register("password_confirmation")}
                  className={`h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-blue-500 rounded-xl transition-all ${errors.password_confirmation ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Ulangi password"
                />
                {errors.password_confirmation && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] mt-6 font-semibold text-base"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} className="mr-2" /> Daftar Sekarang
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Masuk di sini
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
