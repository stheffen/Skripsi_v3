"use server";

import prisma from '@/lib/prisma';
import { hitungSemesterAktif } from '@/lib/utils';

// Helper untuk konversi huruf ke angka
const getBobot = (nilai: string | null) => {
  if (!nilai) return null;
  const map: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, E: 0 };
  return map[nilai.toUpperCase()] ?? null;
};

// Helper untuk memilih nilai tertinggi jika ada retake
function deduplicateKhsList(khsList: any[]) {
  const map = new Map<number, any>();
  for (const khs of khsList) {
    const existing = map.get(khs.mata_kuliah_id);
    if (!existing) {
      map.set(khs.mata_kuliah_id, khs);
    } else {
      const currentBobot = khs.bobot_nilai ?? -1;
      const existingBobot = existing.bobot_nilai ?? -1;
      if (currentBobot > existingBobot) {
        map.set(khs.mata_kuliah_id, khs);
      } else if (currentBobot === existingBobot && khs.id > existing.id) {
        // Jika nilai sama, ambil attempt terbaru
        map.set(khs.mata_kuliah_id, khs);
      }
    }
  }
  return Array.from(map.values());
}

export async function getSemesterKHS(userId: number, semester: number) {
  // Ambil semua KHS user ini untuk melihat yang pindahan
  const allKhsRaw = await prisma.khs.findMany({
    where: { user_id: userId },
    include: { mata_kuliah: true },
  });

  const allKhs = deduplicateKhsList(allKhsRaw);

  const wajib: any[] = [];
  const pilihan: Record<string, any[]> = {};

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
    };

    if (isPilihan) {
      // Kelompokkan MK pilihan yang ada di semester ini
      const groupKey = `Pilihan_Sem_${semester}`; // Sederhananya, dikelompokkan per semester
      if (!pilihan[groupKey]) pilihan[groupKey] = [];
      pilihan[groupKey].push(data);
    } else {
      wajib.push(data);
    }
  }

  return { wajib, pilihan };
}

export async function getCurriculumNilai(userId: number, semester: number) {
  // Ambil KHS user untuk melihat matkul apa yang SUDAH diregistrasikan di semester ini
  const khsListRaw = await prisma.khs.findMany({
    where: { 
      user_id: userId,
      mata_kuliah: { semester: semester }
    },
    include: { mata_kuliah: true }
  });

  const khsList = deduplicateKhsList(khsListRaw);

  const wajib: any[] = [];
  const pilihan: Record<string, any[]> = {};

  for (const khs of khsList) {
    const mk = khs.mata_kuliah;
    const isPilihan = mk.jenis === "Pilihan";

    const data = {
      khs_id: khs.id,
      mk_id: mk.id,
      kode: mk.kode,
      nama: mk.nama,
      sks: mk.sks,
      jenis: mk.jenis,
      semester_asli: mk.semester,
      semester_override: khs.semester_override,
      semester_efektif: semester,
      nilai: khs.nilai,
      bobot_nilai: khs.bobot_nilai,
    };

    if (isPilihan) {
      const groupKey = `Pilihan_Sem_${semester}`; 
      if (!pilihan[groupKey]) pilihan[groupKey] = [];
      pilihan[groupKey].push(data);
    } else {
      wajib.push(data);
    }
  }

  return { wajib, pilihan };
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

    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Gagal menyimpan nilai" };
  }
}

export async function getFilledSemesters(userId: number) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { angkatan: true } });
    const maxSemester = hitungSemesterAktif(user?.angkatan);

    const allKhs = await prisma.khs.findMany({
      where: {
        user_id: userId
      },
      include: {
        mata_kuliah: { select: { semester: true } }
      }
    });

    const semSet = new Set<number>();
    for (let i = 1; i <= maxSemester; i++) semSet.add(i);

    for (const khs of allKhs) {
      semSet.add(khs.mata_kuliah.semester);
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
