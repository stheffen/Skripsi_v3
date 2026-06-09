"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
      data.semester_aktif = parseInt(formData.get("semester_aktif") as string);
      data.phone = formData.get("phone") as string;
    }

    const user = await prisma.user.create({ data });

    // Generate KHS kosong if mahasiswa
    if (user.role === 'mahasiswa') {
      const allMk = await prisma.mataKuliah.findMany();
      const khsData = allMk.map((mk: any) => ({
        user_id: user.id,
        mata_kuliah_id: mk.id,
        semester_input: mk.semester,
      }));
      
      // SQLite limit variables, insert in chunks
      const chunkSize = 50;
      for (let i = 0; i < khsData.length; i += chunkSize) {
        const chunk = khsData.slice(i, i + chunkSize);
        await prisma.khs.createMany({ data: chunk });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Terjadi kesalahan" };
  }
}
