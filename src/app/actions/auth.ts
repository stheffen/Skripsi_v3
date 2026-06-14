"use server";

import prisma from '@/lib/prisma';
import bcrypt from "bcryptjs";
import { hitungSemesterAktif } from '@/lib/utils';

export async function registerUser(formData: FormData) {
  try {
    const role = formData.get("role") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirmation = formData.get("password_confirmation") as string;

    if (password !== passwordConfirmation) {
      return { error: "Password tidak cocok" };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Email sudah terdaftar" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const data: any = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    if (role === "mahasiswa") {
      data.nim = formData.get("nim") as string;
      data.angkatan = formData.get("angkatan") as string;
      data.semester_aktif = hitungSemesterAktif(data.angkatan);
    }

    const user = await prisma.user.create({ data });

    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Terjadi kesalahan" };
  }
}
