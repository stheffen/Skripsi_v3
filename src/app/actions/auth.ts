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
      const nim = formData.get("nim") as string;
      if (nim) {
        const existingNim = await prisma.user.findFirst({ where: { nim } });
        if (existingNim) {
          return { error: "NIM sudah terdaftar" };
        }
      }
      
      // Validasi wajib: Dosen PA harus dipilih
      const dosenId = formData.get("dosen_id");
      if (!dosenId || dosenId === "") {
        return { error: "Dosen Pembimbing Akademik (PA) wajib dipilih saat registrasi" };
      }

      // Pastikan dosen yang dipilih benar-benar ada dan berstatus dosen
      const dosenExists = await prisma.user.findFirst({
        where: { id: parseInt(dosenId as string, 10), role: 'dosen' }
      });
      if (!dosenExists) {
        return { error: "Dosen PA yang dipilih tidak valid" };
      }
      
      data.nim = nim;
      data.angkatan = formData.get("angkatan") as string;
      data.semester_aktif = hitungSemesterAktif(data.angkatan);
      
      data.mahasiswaBimbingan = {
        create: {
          dosen_id: parseInt(dosenId as string, 10)
        }
      };
    }

    const user = await prisma.user.create({ data });

    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Terjadi kesalahan" };
  }
}

export async function getDosenList() {
  try {
    const dosenList = await prisma.user.findMany({
      where: { role: 'dosen' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
    return { success: true, data: dosenList };
  } catch (error) {
    return { error: "Gagal memuat daftar dosen" };
  }
}
