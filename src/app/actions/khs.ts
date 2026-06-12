"use server";

import prisma from '@/lib/prisma';

// Helper untuk konversi huruf ke angka
const getBobot = (nilai: string | null) => {
  if (!nilai) return null;
  const map: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, E: 0 };
  return map[nilai.toUpperCase()] ?? null;
};

export async function getSemesterKHS(userId: number, semester: number) {
  // Ambil semua KHS user ini untuk melihat yang pindahan
  const allKhs = await prisma.khs.findMany({
    where: { user_id: userId },
    include: { mata_kuliah: true },
  });

  const wajib: any[] = [];
  const pilihan: Record<string, any[]> = {};
  const pindahan: any[] = [];

  for (const khs of allKhs) {
    const mk = khs.mata_kuliah;
    const isPilihan = mk.jenis === "Pilihan";
    
    const semAsli = mk.semester;
    const semEfektif = khs.semester_override ?? semAsli;

    if (semEfektif !== semester) continue;

    const data = {
      khs_id: khs.id,
      mk_id: mk.id,
      kode: mk.kode,
      nama: mk.nama,
      sks: mk.sks,
      jenis: mk.jenis,
      semester_asli: semAsli,
      semester_override: khs.semester_override,
      semester_efektif: semEfektif,
      nilai: khs.nilai,
      bobot_nilai: khs.bobot_nilai,
      is_pindahan: khs.semester_override !== null,
    };

    if (data.is_pindahan) {
      pindahan.push(data);
    } else if (isPilihan) {
      // Kelompokkan MK pilihan yang ada di semester ini
      const groupKey = `Pilihan_Sem_${semester}`; // Sederhananya, dikelompokkan per semester
      if (!pilihan[groupKey]) pilihan[groupKey] = [];
      pilihan[groupKey].push(data);
    } else {
      wajib.push(data);
    }
  }

  return { wajib, pilihan, pindahan };
}

export async function batchUpdateKHS(userId: number, values: { khs_id: number; nilai: string }[]) {
  try {
    for (const val of values) {
      await prisma.khs.update({
        where: { id: val.khs_id, user_id: userId }, // Ensure user owns it
        data: {
          nilai: val.nilai,
          bobot_nilai: getBobot(val.nilai),
        },
      });
    }

    // Perbarui semester_aktif berdasarkan semester tertinggi yang sudah diisi
    const filledSemRes = await getFilledSemesters(userId);
    if (filledSemRes.data && filledSemRes.data.length > 0) {
      const maxSem = Math.max(...filledSemRes.data);
      await prisma.user.update({
        where: { id: userId },
        data: { semester_aktif: maxSem }
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal menyimpan nilai" };
  }
}

export async function getFilledSemesters(userId: number) {
  try {
    const allKhs = await prisma.khs.findMany({
      where: {
        user_id: userId,
        nilai: { not: null }
      },
      include: {
        mata_kuliah: { select: { semester: true } }
      }
    });

    const semSet = new Set<number>();
    for (const khs of allKhs) {
      const semEfektif = khs.semester_override ?? khs.mata_kuliah.semester;
      semSet.add(semEfektif);
    }
    
    return { data: Array.from(semSet).sort((a, b) => a - b) };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal mengambil daftar semester" };
  }
}

export async function pindahSemesterKHS(userId: number, khsId: number, semesterTujuan: number) {
  try {
    const khs = await prisma.khs.findUnique({
      where: { id: khsId },
      include: { mata_kuliah: true },
    });

    if (!khs || khs.user_id !== userId) {
      return { error: "Mata kuliah tidak ditemukan" };
    }

    // Validasi ganjil/genap
    const semAsli = khs.mata_kuliah.semester;
    const isGanjilAsli = semAsli % 2 !== 0;
    const isGanjilTujuan = semesterTujuan % 2 !== 0;

    if (isGanjilAsli !== isGanjilTujuan) {
      return { error: `Mata kuliah semester ${isGanjilAsli ? "ganjil" : "genap"} hanya bisa dipindah ke semester ${isGanjilAsli ? "ganjil" : "genap"} juga.` };
    }

    // Jika dipindah kembali ke semester aslinya
    if (semAsli === semesterTujuan) {
      await prisma.khs.update({
        where: { id: khsId },
        data: { semester_override: null },
      });
      return { success: true, message: "Dikembalikan ke semester asli" };
    }

    // Update override
    await prisma.khs.update({
      where: { id: khsId },
      data: { semester_override: semesterTujuan },
    });

    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal memindahkan mata kuliah" };
  }
}
