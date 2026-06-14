"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hitungSemesterAktif } from "@/lib/utils";

export async function updateProfile(userId: string, data: { name: string; email: string; nim: string; angkatan?: string; semester_aktif?: number; phone?: string; password?: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== userId) {
      return { error: "Akses ditolak. Sesi tidak valid atau Anda mencoba mengubah data pengguna lain." };
    }

    const id = parseInt(userId);
    
    // Check if email or NIM already exists in another user
    const existingEmail = await prisma.user.findFirst({
      where: { email: data.email, id: { not: id } }
    });
    if (existingEmail) return { error: "Email sudah digunakan oleh pengguna lain." };

    if (data.nim) {
      const existingNim = await prisma.user.findFirst({
        where: { nim: data.nim, id: { not: id } }
      });
      if (existingNim) return { error: "Nomor Induk sudah terdaftar pada pengguna lain." };
    }

    // Prepare update data
    const updateData: any = {
      name: data.name,
      email: data.email,
      nim: data.nim || null,
      phone: data.phone || null,
    };

    if (data.angkatan) {
      updateData.angkatan = data.angkatan;
      // Auto kalibrasi semester aktif di DB
      updateData.semester_aktif = hitungSemesterAktif(data.angkatan);
    } else if (data.semester_aktif) {
      updateData.semester_aktif = data.semester_aktif;
    }
    
    if (data.password && data.password.trim().length > 0) {
      const bcrypt = await import("bcryptjs");
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    });

    return { success: true, message: "Profil berhasil diperbarui." };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal memperbarui profil." };
  }
}
