"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDosenDashboard() {
  try {
    const totalMahasiswa = await prisma.user.count({
      where: { role: 'mahasiswa' },
    });

    // Ambil analisis terbaru dari semua mahasiswa
    const mahasiswa = await prisma.user.findMany({
      where: { role: 'mahasiswa' },
      include: {
        analisis_risiko: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    });

    let risikoTinggi = 0;
    let risikoSedang = 0;
    let risikoRendah = 0;
    let totalMkBermasalah = 0;

    mahasiswa.forEach((m: any) => {
      if (m.analisis_risiko.length > 0) {
        const ar = m.analisis_risiko[0];
        if (ar.kategori === 'Tinggi') risikoTinggi++;
        else if (ar.kategori === 'Sedang') risikoSedang++;
        else if (ar.kategori === 'Rendah') risikoRendah++;
        
        totalMkBermasalah += ar.mk_bermasalah;
      }
    });

    return {
      success: true,
      data: {
        total_mahasiswa: totalMahasiswa,
        risiko_tinggi: risikoTinggi,
        risiko_sedang: risikoSedang,
        risiko_rendah: risikoRendah,
        total_mk_bermasalah: totalMkBermasalah,
      }
    };
  } catch (error: any) {
    return { error: error.message || "Gagal memuat dashboard dosen" };
  }
}

export async function getDosenMahasiswaList() {
  try {
    const mahasiswaList = await prisma.user.findMany({
      where: { role: 'mahasiswa' },
      select: {
        id: true,
        name: true,
        email: true,
        nim: true,
        semester_aktif: true,
        analisis_risiko: {
          orderBy: { created_at: 'desc' },
          take: 1,
        }
      },
      orderBy: { name: 'asc' },
    });

    const formattedList = mahasiswaList.map((m: any) => {
      const ar = m.analisis_risiko.length > 0 ? m.analisis_risiko[0] : null;
      return {
        id: m.id,
        name: m.name,
        email: m.email,
        nim: m.nim,
        semester_aktif: m.semester_aktif,
        risiko: ar ? ar.kategori : 'Belum Dianalisis',
        ips: ar ? ar.ips : 0,
        ipk: ar ? ar.ipk : 0,
        mk_bermasalah: ar ? ar.mk_bermasalah : 0,
      };
    });

    return { success: true, data: formattedList };
  } catch (error: any) {
    return { error: error.message || "Gagal memuat daftar mahasiswa" };
  }
}
