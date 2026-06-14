"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertTriangle, Eye, EyeOff, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerUser } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const registerSchema = z
  .object({
    role: z.enum(["mahasiswa", "dosen"]),
    name: z.string().min(1, "Nama wajib diisi"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email({ message: "Format email tidak valid" }),
    password: z.string().min(8, "Password minimal 8 karakter"),
    password_confirmation: z.string().min(1, "Konfirmasi password wajib diisi"),
    nim: z.string().optional(),
    angkatan: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Password tidak cocok",
    path: ["password_confirmation"],
  })
  .refine(
    (data) => {
      if (data.role === "mahasiswa") {
        return !!data.nim;
      }
      return true;
    },
    {
      message: "NIM wajib diisi untuk mahasiswa",
      path: ["nim"],
    },
  );

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
    },
  });

  const selectedRole = watch("role");

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
        router.push(data.role === "dosen" ? "/dosen/dashboard" : "/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem saat mendaftar");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-400">EARLY WARNING</p>
            <p className="text-xs text-slate-500">Risiko Akademik</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-100 mb-1">Buat Akun</h2>
          <p className="text-slate-400 text-sm mb-6">
            Daftar untuk mengakses sistem
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="block text-slate-300 mb-2">
                Daftar Sebagai
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["mahasiswa", "Mahasiswa"],
                  ["dosen", "Dosen PA"],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setValue("role", val as "mahasiswa" | "dosen")
                    }
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      selectedRole === val
                        ? "bg-blue-600/20 border-blue-500 text-blue-300"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="name" className="text-slate-300">
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className={`bg-slate-950 border-slate-800 text-slate-300 focus-visible:ring-blue-500 ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Nama lengkap"
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={`bg-slate-950 border-slate-800 text-slate-300 focus-visible:ring-blue-500 ${errors.email ? "border-red-500" : ""}`}
                  placeholder="nama@email.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {selectedRole === "mahasiswa" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="nim" className="text-slate-300">
                      NIM
                    </Label>
                    <Input
                      id="nim"
                      {...register("nim")}
                      className={`bg-slate-950 border-slate-800 text-slate-300 focus-visible:ring-blue-500 ${errors.nim ? "border-red-500" : ""}`}
                      placeholder="Nomor Induk Mahasiswa"
                    />
                    {errors.nim && (
                      <p className="text-xs text-red-500">
                        {errors.nim.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="angkatan" className="text-slate-300">
                      Angkatan
                    </Label>
                    <Input
                      id="angkatan"
                      {...register("angkatan")}
                      className="bg-slate-950 border-slate-800 text-slate-300 focus-visible:ring-blue-500"
                      placeholder="Contoh: 2022"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    {...register("password")}
                    className={`bg-slate-950 border-slate-800 pr-12 text-slate-300 focus-visible:ring-blue-500 ${errors.password ? "border-red-500" : ""}`}
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label
                  htmlFor="password_confirmation"
                  className="text-slate-300"
                >
                  Konfirmasi Password
                </Label>
                <Input
                  id="password_confirmation"
                  type={showPass ? "text" : "password"}
                  {...register("password_confirmation")}
                  className={`bg-slate-950 border-slate-800 text-slate-300 focus-visible:ring-blue-500 ${errors.password_confirmation ? "border-red-500" : ""}`}
                  placeholder="Ulangi password"
                />
                {errors.password_confirmation && (
                  <p className="text-xs text-red-500">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
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

          <p className="text-center text-sm text-slate-400 mt-6">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Masuk di sini
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
